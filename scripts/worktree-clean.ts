/*
  The worktrees of the branches that have landed go to the trash (docs/WORKFLOW.md rule 9, #1381).

  A worktree is the folder of one unit of work: once its pull request is merged it holds nothing
  the repository has not, and left beside the main checkout it looks like work still in progress
  (#693). It goes to the trash of the OS, never deleted for good: whatever was left in it can still
  be recovered.

    tsx scripts/worktree-clean.ts [--dry-run]
                                    move the worktrees of merged branches to the trash, then
                                    `git worktree prune` and delete their local branches; with
                                    --dry-run, only say which ones it would move

  Where each answer comes from:

  - the worktrees and their branches: `git worktree list --porcelain`, the first one the main
    checkout (git lists it first);
  - whether a branch has landed: its pull requests on GitHub (`gh pr list --head <branch>`), as the
    person running it sees them. Merged, with none open, and the local branch holds no commit the
    merged head has not (`git merge-base --is-ancestor`): a commit after the merge is work no pull
    request carries, and keeps the worktree. The preview of an epic (`<epic>-preview`, built by
    `epic.preview`, never pushed) has no pull request: it lands with its epic, when the epic issue
    is closed;
  - uncommitted changes: `git status` there, without the node_modules links a worktree carries
    (`uncommitted` of epic-preview.ts). They keep the worktree: the person decides;
  - the trash: the Recycle Bin on Windows (the shell, `SHFileOperation` with `FOF_ALLOWUNDO`, and
    `FOF_WANTNUKEWARNING` so that a folder too large for the bin stops on a warning instead of being
    deleted for good), the Trash on macOS (`trash`, macOS 15, else the Finder), `gio trash` on
    Linux. With none of them it stops: it never deletes.

  The links a worktree carries (its `node_modules`, a link to the one of the main checkout) are
  removed first, as links, never followed: a recursive delete that follows a junction (PowerShell 5.1
  `Remove-Item -Recurse`) empties the folder it points to.
*/
import { execFileSync } from 'node:child_process';
import { existsSync, lstatSync, readdirSync, realpathSync, rmdirSync, unlinkSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { git, uncommitted } from './epic-preview.ts';

export interface Worktree {
  dir: string;
  /** The branch checked out, null when the head is detached. */
  branch: string | null;
  head: string;
  locked: boolean;
  /** Registered by git, its folder missing: `git worktree prune` forgets it. */
  prunable: boolean;
}

/** The worktrees of `git worktree list --porcelain`, the main checkout first. */
export const parseWorktrees = (porcelain: string): Worktree[] => {
  const out: Worktree[] = [];
  for (const block of porcelain.split(/\r?\n\r?\n/)) {
    const lines = block.split(/\r?\n/).filter(Boolean);
    const dir = lines.find((line) => line.startsWith('worktree '))?.slice('worktree '.length);
    if (!dir) continue;
    const ref = lines.find((line) => line.startsWith('branch '))?.slice('branch '.length);
    out.push({
      dir,
      branch: ref?.startsWith('refs/heads/') ? ref.slice('refs/heads/'.length) : null,
      head: lines.find((line) => line.startsWith('HEAD '))?.slice('HEAD '.length) ?? '',
      locked: lines.some((line) => line === 'locked' || line.startsWith('locked ')),
      prunable: lines.some((line) => line === 'prunable' || line.startsWith('prunable ')),
    });
  }
  return out;
};

export interface PullRequest {
  number: number;
  state: 'OPEN' | 'CLOSED' | 'MERGED';
  url: string;
  baseRefName: string;
  headRefOid: string;
}

/** What GitHub and git answer about one worktree, read before deciding. */
export interface Facts {
  /** The pull requests whose head is the branch; null when GitHub could not be read. */
  prs: PullRequest[] | null;
  /** For the preview of an epic: the state of the epic issue; null when unknown. */
  epicState?: 'OPEN' | 'CLOSED' | null;
  /** Whether every commit of the local branch is in the merged head; null when unknown. */
  landed: boolean | null;
  dirty: string[];
}

export type Decision =
  | { action: 'trash'; why: string; pr: PullRequest | null }
  | { action: 'keep'; why: string; pr: PullRequest | null };

/** The preview of an epic, `<epic>-preview` (scripts/epic-preview.ts), with the number of the epic. */
export const previewOf = (branch: string | null): number | null => {
  const match = branch ? /^(\d+)-preview$/.exec(branch) : null;
  return match ? Number(match[1]) : null;
};

/** Whether a path is a folder or inside it, as git and the OS spell them. */
export const within = (folder: string, p: string): boolean => {
  const norm = (value: string) => {
    const resolved = path.resolve(value);
    return process.platform === 'win32' ? resolved.toLowerCase() : resolved;
  };
  const rel = path.relative(norm(folder), norm(p));
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
};

/** Which worktrees a run looks at: every one but the main checkout. */
export const candidatesOf = (worktrees: Worktree[]): Worktree[] => worktrees.slice(1);

/** Whether a worktree goes to the trash, and why; what cannot be known keeps it. */
export const decide = (worktree: Worktree, facts: Facts, cwd: string): Decision => {
  const keep = (why: string, pr: PullRequest | null = null): Decision => ({
    action: 'keep',
    why,
    pr,
  });
  if (within(worktree.dir, cwd)) return keep('you are in it: run from the main checkout');
  if (worktree.locked) return keep('locked (`git worktree unlock` first, if it is done)');
  if (!worktree.branch) return keep('detached head: no branch to match a pull request');
  const epic = previewOf(worktree.branch);
  if (epic !== null) {
    if (facts.dirty.length) return keep(`uncommitted changes: ${facts.dirty.length}`);
    if (facts.epicState === 'CLOSED')
      return { action: 'trash', why: `epic #${epic} closed`, pr: null };
    return keep(
      facts.epicState === 'OPEN'
        ? `preview of the open epic #${epic}`
        : `preview of epic #${epic}, whose state GitHub did not give`,
    );
  }
  if (facts.prs === null) return keep('GitHub could not be read (`gh auth status`)');
  const open = facts.prs.find((pr) => pr.state === 'OPEN');
  if (open) return keep(`pull request #${open.number} still open`, open);
  const merged = facts.prs.find((pr) => pr.state === 'MERGED');
  if (!merged) return keep('no merged pull request');
  if (facts.dirty.length) return keep(`uncommitted changes: ${facts.dirty.length}`, merged);
  if (facts.landed === false) return keep('commits after the merge, in no pull request', merged);
  if (facts.landed === null) return keep('the merged head is not here (`git fetch`)', merged);
  return {
    action: 'trash',
    why: `#${merged.number} merged into \`${merged.baseRefName}\``,
    pr: merged,
  };
};

// The links a worktree carries.

const SKIP = new Set(['.git']);

/** The symbolic links and junctions under a folder that point outside it, found without following any. */
export const outsideLinks = (root: string): string[] => {
  const out: string[] = [];
  const top = realpathSync(root);
  const walk = (dir: string) => {
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isSymbolicLink() || lstatSync(full).isSymbolicLink()) {
        let target: string | null;
        try {
          target = realpathSync(full);
        } catch {
          target = null; // a dangling link points nowhere it could empty
        }
        if (target === null || !within(top, target)) out.push(full);
        continue;
      }
      // a real node_modules holds the packages of an install, not links out of the worktree
      if (entry.isDirectory() && !SKIP.has(entry.name) && entry.name !== 'node_modules') walk(full);
    }
  };
  walk(top);
  return out;
};

/** Removes a link, never what it points to. */
export const removeLink = (link: string): void => {
  if (!lstatSync(link).isSymbolicLink()) throw new Error(`not a link: ${link}`);
  try {
    unlinkSync(link);
  } catch (error) {
    // a junction, or a directory symlink on Windows, goes with rmdir, which never recurses
    if (process.platform === 'win32') rmdirSync(link);
    else throw error;
  }
};

// The trash of the OS.

const RECYCLE = `
$ErrorActionPreference = 'Stop'
Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
public static class MagmaRecycle {
  [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
  struct SHFILEOPSTRUCT {
    public IntPtr hwnd; public uint wFunc; public string pFrom; public string pTo;
    public ushort fFlags; public bool fAnyOperationsAborted; public IntPtr hNameMappings; public string lpszProgressTitle;
  }
  [DllImport("shell32.dll", CharSet = CharSet.Unicode)]
  static extern int SHFileOperation(ref SHFILEOPSTRUCT op);
  public static int Send(string path) {
    var op = new SHFILEOPSTRUCT();
    op.wFunc = 3; // FO_DELETE
    op.pFrom = path + "\\0\\0";
    // FOF_ALLOWUNDO | FOF_NOCONFIRMATION | FOF_SILENT | FOF_NOERRORUI | FOF_WANTNUKEWARNING
    op.fFlags = 0x0040 | 0x0010 | 0x0004 | 0x0400 | 0x4000;
    int code = SHFileOperation(ref op);
    return op.fAnyOperationsAborted ? -1 : code;
  }
}
'@
$code = [MagmaRecycle]::Send($env:MAGMA_TRASH_PATH)
if ($code -ne 0) { Write-Error "the Recycle Bin refused it (code $code)"; exit 1 }
`;

/** The command that moves a folder to the trash of an OS; null when the OS has none it knows. */
export const trashCommand = (
  platform: NodeJS.Platform,
  dir: string,
  has: (command: string) => boolean,
): { file: string; args: string[]; env?: Record<string, string> } | null => {
  if (platform === 'win32')
    return {
      file: 'powershell.exe',
      // encoded: the script holds quotes and newlines that a command line would mangle
      args: [
        '-NoProfile',
        '-NonInteractive',
        '-EncodedCommand',
        Buffer.from(RECYCLE, 'utf16le').toString('base64'),
      ],
      env: { MAGMA_TRASH_PATH: dir },
    };
  if (platform === 'darwin') {
    if (has('/usr/bin/trash')) return { file: '/usr/bin/trash', args: [dir] };
    return {
      file: 'osascript',
      args: [
        '-e',
        'on run argv',
        '-e',
        'tell application "Finder" to delete (POSIX file (item 1 of argv) as alias)',
        '-e',
        'end run',
        dir,
      ],
    };
  }
  if (has('gio')) return { file: 'gio', args: ['trash', dir] };
  return null;
};

const which = (command: string): boolean => {
  if (path.isAbsolute(command)) return existsSync(command);
  try {
    execFileSync(process.platform === 'win32' ? 'where' : 'which', [command], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
};

/** Moves a folder to the trash of this OS; throws when it cannot, never deletes. */
export const toTrash = (dir: string): void => {
  const command = trashCommand(process.platform, dir, which);
  if (!command) throw new Error('no trash on this system (`gio`): move the folder by hand');
  execFileSync(command.file, command.args, {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, ...command.env },
  });
  if (existsSync(dir)) throw new Error('the folder is still there');
};

// GitHub, through `gh`.

const gh = (args: string[]): string | null => {
  try {
    return execFileSync('gh', args, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      maxBuffer: 16 * 1024 * 1024,
    });
  } catch {
    return null;
  }
};

const pullRequestsOf = (branch: string): PullRequest[] | null => {
  const out = gh([
    'pr',
    'list',
    '--head',
    branch,
    '--state',
    'all',
    '--limit',
    '50',
    '--json',
    'number,state,url,baseRefName,headRefOid',
  ]);
  return out === null ? null : (JSON.parse(out) as PullRequest[]);
};

const issueState = (number: number): 'OPEN' | 'CLOSED' | null => {
  const out = gh(['issue', 'view', String(number), '--json', 'state', '-q', '.state']);
  return out?.trim() === 'OPEN' || out?.trim() === 'CLOSED'
    ? (out.trim() as 'OPEN' | 'CLOSED')
    : null;
};

/** Whether every commit of a branch is in a commit; null when that commit is not here. */
export const landedIn = (cwd: string, branch: string, head: string): boolean | null => {
  if (git(cwd, ['cat-file', '-e', `${head}^{commit}`], true) === null) return null;
  return git(cwd, ['merge-base', '--is-ancestor', `refs/heads/${branch}`, head], true) !== null;
};

export interface Row {
  worktree: Worktree;
  decision: Decision;
  outcome: 'trashed' | 'would trash' | 'forgotten' | 'kept' | 'failed';
  error?: string;
}

export interface Clean {
  rows: Row[];
  pruned: boolean;
  dryRun: boolean;
}

/** Decides every worktree and, unless dry, moves the landed ones to the trash. */
export const clean = (
  cwd: string,
  options: {
    dryRun?: boolean;
    read?: (worktree: Worktree) => Facts;
    trash?: (dir: string) => void;
  } = {},
): Clean => {
  const dryRun = options.dryRun ?? false;
  const read =
    options.read ??
    ((worktree: Worktree): Facts => {
      const dirty = worktree.prunable ? [] : uncommitted(worktree.dir);
      const epic = previewOf(worktree.branch);
      if (epic !== null) return { prs: [], epicState: issueState(epic), landed: null, dirty };
      const prs = worktree.branch ? pullRequestsOf(worktree.branch) : null;
      const merged = prs?.find((pr) => pr.state === 'MERGED');
      const landed =
        merged && worktree.branch ? landedIn(cwd, worktree.branch, merged.headRefOid) : null;
      return { prs, landed, dirty };
    });
  const trash = options.trash ?? toTrash;
  const worktrees = parseWorktrees(git(cwd, ['worktree', 'list', '--porcelain']) ?? '');
  const rows: Row[] = [];
  let changed = false;
  for (const worktree of candidatesOf(worktrees)) {
    if (worktree.prunable) {
      // the folder went by hand: git forgets it, the branch stays (nothing says it landed)
      rows.push({
        worktree,
        decision: { action: 'keep', why: 'its folder is already gone; its branch stays', pr: null },
        outcome: dryRun ? 'kept' : 'forgotten',
      });
      changed = true;
      continue;
    }
    const decision = decide(worktree, read(worktree), cwd);
    if (decision.action === 'keep') {
      rows.push({ worktree, decision, outcome: 'kept' });
      continue;
    }
    if (dryRun) {
      rows.push({ worktree, decision, outcome: 'would trash' });
      continue;
    }
    try {
      for (const link of outsideLinks(worktree.dir)) removeLink(link);
      trash(worktree.dir);
      changed = true;
      rows.push({ worktree, decision, outcome: 'trashed' });
    } catch (error) {
      rows.push({
        worktree,
        decision,
        outcome: 'failed',
        error: error instanceof Error ? error.message.split('\n')[0] : String(error),
      });
    }
  }
  let pruned = false;
  if (!dryRun && changed) {
    git(cwd, ['worktree', 'prune']);
    pruned = true;
    for (const row of rows)
      if (row.outcome === 'trashed' && row.worktree.branch)
        // -D: the branch is in the merged head (or is a preview, never pushed), checked above
        git(cwd, ['branch', '-D', row.worktree.branch], true);
  }
  return { rows, pruned, dryRun };
};

/** The run as a table, with what to do next. */
export const renderClean = (result: Clean): string => {
  if (!result.rows.length) return 'No worktree beside the main checkout.';
  const lines = [
    '| Worktree | Branch | Pull request | Outcome | Why |',
    '| --- | --- | --- | --- | --- |',
  ];
  for (const row of result.rows) {
    const pr = row.decision.pr ? `[#${row.decision.pr.number}](${row.decision.pr.url})` : '-';
    const why = row.error ? `${row.decision.why}; ${row.error}` : row.decision.why;
    lines.push(
      `| \`${path.basename(row.worktree.dir)}\` | ${row.worktree.branch ? `\`${row.worktree.branch}\`` : '-'} | ${pr} | ${row.outcome} | ${why} |`,
    );
  }
  const next: string[] = [];
  if (result.dryRun && result.rows.some((row) => row.outcome === 'would trash'))
    next.push('Run it again without `--dry-run` to move them to the trash.');
  if (result.pruned)
    next.push(
      'Trashed worktrees are forgotten by git (`git worktree prune`) and their local branches deleted; the folders can still be restored from the trash.',
    );
  if (result.rows.some((row) => row.outcome === 'failed'))
    next.push(
      'A failed one is still in place: move it to the trash by hand, then `git worktree prune`.',
    );
  if (next.length) lines.push('', ...next.map((line) => `- ${line}`));
  return lines.join('\n');
};

const main = () => {
  const args = process.argv.slice(2);
  const cwd = process.cwd();
  git(cwd, ['fetch', '--quiet', 'origin'], true);
  const result = clean(cwd, { dryRun: args.includes('--dry-run') });
  console.info(renderClean(result));
  if (result.rows.some((row) => row.outcome === 'failed')) process.exitCode = 1;
};

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) main();
