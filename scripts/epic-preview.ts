/*
  The preview of an epic: its branch with every open part merged in, on a local branch nobody
  pushes, in a worktree of its own, to see and test in one place the work that converges while
  its pieces live in several worktrees (#1319).

  docs/WORKFLOW.md rule 2: a part reaches the branch of the epic only through its pull request,
  merged on a person's approval. The preview never touches that branch: it is rebuilt from it on
  every run, so nothing in it is lost or needs undoing, and it is never pushed.

    tsx scripts/epic-preview.ts <epic number> [--branch=<branch of the epic>] [--dir=<folder>]
                                    rebuild the preview, then print what it holds as a table

  Where each answer comes from:

  - the epic, its branch, its parts and their order: scripts/epic.ts (`readEpic`, `rowsOf`);
  - the branch of a part: the head branch of its open pull request into the branch of the epic,
    else a branch linked to it, else a local branch named `<part>-...` (rule 3); the open pull
    requests into the branch of the epic that belong to no part are merged too, as the work of
    the epic itself;
  - which copy of a branch: the local one when it holds commits origin has not (not pushed yet),
    origin's when the local one is only behind or missing; both moved: the local one, said so;
  - the worktree of a branch: `git worktree list`; its uncommitted changes: `git status` there,
    without the node_modules links a worktree may carry (untracked, never work). They cannot be
    merged (a merge takes commits), so the table says so instead of leaving them out silently;
  - the folder: `<main worktree>-wt-<epic>-preview`, the name the worktrees of this repository
    take beside the main one; the branch: `<epic>-preview`, local only.

  It never loses work: it rebuilds the preview only when its folder holds no uncommitted change
  and no commit of its own (one that is neither a merge nor reachable from what it merges, the
  branch of the epic and the branches of the parts); otherwise it stops and says what is there.
  Work belongs on the branch of a part.
*/
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readEpic, rowsOf, type Epic, type Part, type PullRequest } from './epic.ts';

/** Runs git in a folder; with `allowFail`, a failure returns null instead of throwing. */
export const git = (cwd: string, args: string[], allowFail = false): string | null => {
  try {
    return execFileSync('git', ['-C', cwd, ...args], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      maxBuffer: 64 * 1024 * 1024,
    }).trimEnd();
  } catch (error) {
    if (allowFail) return null;
    throw error;
  }
};

/** Whether a line of `git status --porcelain` is a node_modules link a worktree carries. */
export const isModulesLink = (line: string): boolean =>
  /^\?\? (.*\/)?node_modules\/?$/.test(line.trimEnd());

/** The uncommitted changes of a folder, as `git status --porcelain` lines. */
export const uncommitted = (dir: string): string[] =>
  (git(dir, ['status', '--porcelain', '--untracked-files=normal']) ?? '')
    .split('\n')
    .filter((line) => line && !isModulesLink(line));

/** The worktrees of the repository, by the branch each has checked out; the main one first. */
export const worktreesOf = (cwd: string): { main: string; byBranch: Map<string, string> } => {
  const byBranch = new Map<string, string>();
  let main = '';
  let current = '';
  for (const line of (git(cwd, ['worktree', 'list', '--porcelain']) ?? '').split('\n')) {
    if (line.startsWith('worktree ')) {
      current = line.slice('worktree '.length);
      if (!main) main = current;
    } else if (line.startsWith('branch refs/heads/'))
      byBranch.set(line.slice('branch refs/heads/'.length), current);
  }
  return { main, byBranch };
};

export type Copy = 'local' | 'origin' | 'missing';

/** Which copy of a branch to merge, from what each side has that the other has not. */
export const chooseCopy = (state: {
  local: boolean;
  remote: boolean;
  ahead: number;
  behind: number;
}): { copy: Copy; notPushed: number | 'never'; diverged: boolean } => {
  if (!state.local)
    return { copy: state.remote ? 'origin' : 'missing', notPushed: 0, diverged: false };
  if (!state.remote) return { copy: 'local', notPushed: 'never', diverged: false };
  if (state.ahead > 0) return { copy: 'local', notPushed: state.ahead, diverged: state.behind > 0 };
  return { copy: 'origin', notPushed: 0, diverged: false };
};

const count = (cwd: string, range: string): number =>
  Number(git(cwd, ['rev-list', '--count', range], true) ?? 0);

const exists = (cwd: string, ref: string): boolean =>
  git(cwd, ['rev-parse', '--verify', '--quiet', ref], true) !== null;

/** The copy of a branch to merge and how it stands against origin. */
const resolve = (cwd: string, branch: string) => {
  const local = exists(cwd, `refs/heads/${branch}`);
  const remote = exists(cwd, `refs/remotes/origin/${branch}`);
  const ahead = local && remote ? count(cwd, `origin/${branch}..${branch}`) : 0;
  const behind = local && remote ? count(cwd, `${branch}..origin/${branch}`) : 0;
  const choice = chooseCopy({ local, remote, ahead, behind });
  const ref =
    choice.copy === 'local' ? branch : choice.copy === 'origin' ? `origin/${branch}` : null;
  return { ...choice, ref };
};

export interface Entry {
  parts: Part[];
  pr: PullRequest | null;
  branch: string | null;
  ref: string | null;
  copy: Copy;
  /** Commits of the local copy origin has not; 'never' when the branch was never pushed. */
  notPushed: number | 'never';
  diverged: boolean;
  worktree: string | null;
  dirty: string[];
  outcome: 'merged' | 'already in' | 'conflict' | 'missing';
  conflicts: string[];
}

/** The branches to merge, in the order the work lands: open pull requests first, then the parts with no pull request. */
export const entriesOf = (
  epic: Epic,
  localBranches: string[],
): Pick<Entry, 'parts' | 'pr' | 'branch'>[] => {
  const out: Pick<Entry, 'parts' | 'pr' | 'branch'>[] = [];
  const seen = new Set<string>();
  for (const row of rowsOf(epic)) {
    if (row.kind === 'open' && row.pr && !row.landing && row.pr.baseRefName === epic.branch) {
      if (seen.has(row.pr.headRefName)) continue;
      seen.add(row.pr.headRefName);
      out.push({ parts: row.parts, pr: row.pr, branch: row.pr.headRefName });
    }
    if (row.kind === 'waiting' && row.parts[0]?.state === 'OPEN') {
      const part = row.parts[0];
      const candidates = [
        ...part.branches,
        ...localBranches.filter((name) => name.startsWith(`${part.number}-`)),
      ].filter(
        (name) => name !== epic.branch && !name.startsWith(`${epic.number}-`) && !seen.has(name),
      );
      const branch = candidates[0] ?? null;
      if (branch) seen.add(branch);
      out.push({ parts: [part], pr: null, branch });
    }
  }
  return out;
};

export interface Preview {
  epic: Epic;
  dir: string;
  branch: string;
  base: string;
  entries: Entry[];
  /** Why the preview was not rebuilt; empty when it was. */
  blocked: string[];
  created: boolean;
  modules: boolean;
}

/**
 * Rebuilds the preview in `dir` on `branch` from `base`, merging each entry's ref in order.
 * Stops before touching anything when the folder or the branch holds work of its own.
 */
export const rebuild = (
  repo: string,
  dir: string,
  branch: string,
  base: string,
  entries: Omit<Entry, 'outcome' | 'conflicts'>[],
): { entries: Entry[]; blocked: string[]; created: boolean } => {
  const refs = entries.map((entry) => entry.ref).filter((ref): ref is string => !!ref);
  const blocked: string[] = [];
  const created = !existsSync(dir);
  const ownCommits = (tip: string) =>
    (git(repo, ['rev-list', '--no-merges', '--oneline', tip, '--not', base, ...refs], true) ?? '')
      .split('\n')
      .filter(Boolean);

  if (created) {
    if (exists(repo, `refs/heads/${branch}`)) {
      const own = ownCommits(branch);
      if (own.length)
        blocked.push(`the branch \`${branch}\` holds commits of its own: ${own.join('; ')}`);
    }
    if (!blocked.length) {
      // a folder deleted by hand leaves its worktree registered: prune forgets only those
      git(repo, ['worktree', 'prune']);
      git(repo, ['worktree', 'add', '--quiet', '-B', branch, dir, base]);
    }
  } else {
    const head = git(dir, ['rev-parse', '--abbrev-ref', 'HEAD'], true);
    if (head !== branch)
      blocked.push(`\`${dir}\` is on \`${head ?? 'no branch'}\`, not on \`${branch}\``);
    else {
      const dirty = uncommitted(dir);
      if (dirty.length)
        blocked.push(
          `\`${dir}\` holds uncommitted changes: ${dirty.map((line) => line.slice(3)).join(', ')}`,
        );
      // by its name, not HEAD: `repo` is another worktree, whose HEAD is another branch
      const own = ownCommits(`refs/heads/${branch}`);
      if (own.length) blocked.push(`\`${branch}\` holds commits of its own: ${own.join('; ')}`);
    }
    if (!blocked.length) git(dir, ['reset', '--quiet', '--hard', base]);
  }
  if (blocked.length)
    return {
      entries: entries.map((entry) => ({
        ...entry,
        outcome: entry.ref ? 'conflict' : 'missing',
        conflicts: [],
      })),
      blocked,
      created,
    };

  const done: Entry[] = [];
  for (const entry of entries) {
    if (!entry.ref) {
      done.push({ ...entry, outcome: 'missing', conflicts: [] });
      continue;
    }
    if (git(dir, ['merge-base', '--is-ancestor', entry.ref, 'HEAD'], true) !== null) {
      done.push({ ...entry, outcome: 'already in', conflicts: [] });
      continue;
    }
    // --no-verify: the preview is never pushed, there is nothing for the hooks to hold
    if (
      git(dir, ['merge', '--no-ff', '--no-edit', '--no-verify', '--quiet', entry.ref], true) !==
      null
    ) {
      done.push({ ...entry, outcome: 'merged', conflicts: [] });
      continue;
    }
    const conflicts = (git(dir, ['diff', '--name-only', '--diff-filter=U'], true) ?? '')
      .split('\n')
      .filter(Boolean);
    git(dir, ['merge', '--abort'], true);
    done.push({ ...entry, outcome: 'conflict', conflicts });
  }
  return { entries: done, blocked, created };
};

const link = (n: number, url: string): string => `[#${n}](${url})`;
const cell = (text: string): string => text.replace(/\r?\n/g, ' ').replace(/\|/g, '\\|');
const short = (text: string, max = 50): string =>
  text.length > max ? `${text.slice(0, max - 3).trimEnd()}...` : text;
const plural = (n: number, one: string) => `${n} ${one}${n === 1 ? '' : 's'}`;

/** What the preview holds, in Markdown: the table, then what to do next. */
export const renderPreview = (preview: Preview): string => {
  const { epic } = preview;
  const lines = [
    `## Preview of epic ${link(epic.number, epic.url)}: \`${preview.branch}\``,
    '',
    `Folder: \`${preview.dir}\`${preview.created ? ' (created now)' : ''}. Built from \`${preview.base}\`${
      epic.distance
        ? ` (${epic.distance.ahead} commits ahead of \`${epic.defaultBranch}\`, ${epic.distance.behind} behind)`
        : ''
    } and the branches below, in the order the work lands. Local only, rebuilt on every run, never pushed.`,
  ];
  if (preview.blocked.length)
    lines.push(
      '',
      '**Not rebuilt**: nothing was touched, because',
      '',
      ...preview.blocked.map((reason) => `- ${reason}`),
    );
  lines.push(
    '',
    '| # | Part | Branch | Worktree | Uncommitted | Not pushed | In the preview |',
    '|---|------|--------|----------|-------------|------------|----------------|',
  );
  if (!preview.entries.length)
    lines.push(
      '| - | no open part | - | - | - | - | the preview is the branch of the epic as it is |',
    );
  preview.entries.forEach((entry, i) => {
    const what = entry.parts.length
      ? entry.parts
          .map((part) => `${link(part.number, part.url)} ${cell(short(part.title))}`)
          .join('<br>')
      : 'work of the epic itself';
    const pushed =
      entry.copy === 'missing'
        ? '-'
        : entry.notPushed === 'never'
          ? 'never pushed'
          : entry.notPushed
            ? `${plural(entry.notPushed, 'commit')}${entry.diverged ? ', and origin moved too' : ''}`
            : '-';
    const inside = preview.blocked.length
      ? 'not rebuilt'
      : entry.outcome === 'missing'
        ? 'no: no branch yet'
        : entry.outcome === 'conflict'
          ? `no: conflicts in ${entry.conflicts.map((file) => `\`${file}\``).join(', ') || 'files git did not list'}`
          : entry.outcome === 'already in'
            ? 'already in the branch of the epic'
            : entry.dirty.length
              ? `yes, without the ${plural(entry.dirty.length, 'uncommitted file')}`
              : 'yes';
    lines.push(
      `| ${i + 1} | ${what} | ${entry.branch ? `\`${cell(entry.branch)}\`${entry.copy === 'origin' ? ' (origin)' : ''}` : '-'} | ${
        entry.worktree ? `\`${path.basename(entry.worktree)}\`` : '-'
      } | ${entry.dirty.length ? plural(entry.dirty.length, 'file') : '-'} | ${pushed} | ${cell(inside)} |`,
    );
  });
  const next: string[] = [];
  if (preview.blocked.length)
    next.push(
      'Move that work onto the branch of its part, or discard it once its owner agrees, then run again.',
    );
  const dirty = preview.entries.filter((entry) => entry.dirty.length && entry.worktree);
  if (dirty.length)
    next.push(
      `Commit on its branch what each part should show: ${dirty.map((entry) => `\`${path.basename(entry.worktree ?? '')}\``).join(', ')}; then run again.`,
    );
  if (!preview.modules) next.push(`Install once: \`npm ci\` in \`${preview.dir}\`.`);
  next.push(
    `See it, in \`${preview.dir}\`: \`npx nx run stencil:build\`, then Storybook on a port other than the 6006 of the checkout: \`npx storybook dev -p 6008 --ci --no-open\` in \`projects/stencil\`; then \`npx nx run magma:test.urls --storybook=http://localhost:6008\` for the pages to test.`,
  );
  lines.push('', '**Next**', '', ...next.map((line) => `- ${line}`));
  return lines.join('\n');
};

/** Reads the epic, rebuilds its preview and describes it. */
export const previewEpic = (
  number: number,
  options: { branch?: string; dir?: string } = {},
): Preview => {
  const cwd = process.cwd();
  git(cwd, ['fetch', '--quiet', 'origin']);
  const epic = readEpic(number, options.branch);
  const { main, byBranch } = worktreesOf(cwd);
  const branch = `${number}-preview`;
  const dir = options.dir ?? `${main}-wt-${number}-preview`;
  if (!epic.branch)
    return {
      epic,
      dir,
      branch,
      base: '-',
      entries: [],
      blocked: ['the branch of the epic is unknown: `nx run magma:epic.status` says why'],
      created: false,
      modules: existsSync(path.join(dir, 'node_modules')),
    };
  const base = `origin/${epic.branch}`;
  const localBranches = (
    git(cwd, ['for-each-ref', '--format=%(refname:short)', 'refs/heads/']) ?? ''
  )
    .split('\n')
    .filter(Boolean);
  const entries = entriesOf(epic, localBranches).map((entry) => {
    const resolved = entry.branch
      ? resolve(cwd, entry.branch)
      : { copy: 'missing' as Copy, notPushed: 0, diverged: false, ref: null };
    const worktree = entry.branch ? (byBranch.get(entry.branch) ?? null) : null;
    const ready: Omit<Entry, 'outcome' | 'conflicts'> = {
      ...entry,
      ref: resolved.ref,
      copy: resolved.copy,
      notPushed: resolved.notPushed,
      diverged: resolved.diverged,
      worktree,
      dirty: worktree && worktree !== dir ? uncommitted(worktree) : [],
    };
    return ready;
  });
  const result = rebuild(cwd, dir, branch, base, entries);
  return {
    epic,
    dir,
    branch,
    base,
    ...result,
    modules: existsSync(path.join(dir, 'node_modules')),
  };
};

const main = () => {
  const args = process.argv.slice(2);
  const value = (name: string) =>
    args.find((arg) => arg.startsWith(`--${name}=`))?.slice(name.length + 3);
  const number = Number(value('epic') ?? args.find((arg) => /^\d+$/.test(arg)));
  if (!Number.isInteger(number) || number <= 0) {
    console.error(
      'usage: tsx scripts/epic-preview.ts <epic number> [--branch=<branch of the epic>] [--dir=<folder>]',
    );
    process.exitCode = 2;
    return;
  }
  const preview = previewEpic(number, { branch: value('branch'), dir: value('dir') });
  console.info(renderPreview(preview));
  if (preview.blocked.length) process.exitCode = 1;
};

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) main();
