import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  renameSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, describe, it } from 'node:test';
import {
  clean,
  decide,
  outsideLinks,
  parseWorktrees,
  previewOf,
  removeLink,
  renderClean,
  trashCommand,
  within,
  type Facts,
  type PullRequest,
  type Worktree,
} from './worktree-clean.ts';

const sh = (cwd: string, ...args: string[]) =>
  execFileSync('git', ['-C', cwd, ...args], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();

const temp = mkdtempSync(path.join(os.tmpdir(), 'worktree-clean-'));
after(() => rmSync(temp, { recursive: true, force: true, maxRetries: 5 }));

/** A link to a folder: a junction on Windows (no privilege needed), a symlink elsewhere. */
const linkDir = (target: string, link: string) =>
  symlinkSync(target, link, process.platform === 'win32' ? 'junction' : 'dir');

const worktree = (over: Partial<Worktree> = {}): Worktree => ({
  dir: path.join(temp, 'repo-wt-10'),
  branch: '10-feature',
  head: 'abc',
  locked: false,
  prunable: false,
  ...over,
});

const pr = (over: Partial<PullRequest> = {}): PullRequest => ({
  number: 11,
  state: 'MERGED',
  url: 'https://github.com/o/r/pull/11',
  baseRefName: 'main',
  headRefOid: 'abc',
  ...over,
});

const facts = (over: Partial<Facts> = {}): Facts => ({
  prs: [pr()],
  landed: true,
  dirty: [],
  ...over,
});

const elsewhere = path.join(temp, 'main-checkout');

describe('parseWorktrees', () => {
  it('reads the main checkout first, branches, detached heads, locks and missing folders', () => {
    const porcelain = [
      'worktree C:/repo',
      'HEAD 111',
      'branch refs/heads/main',
      '',
      'worktree C:/repo-wt-10',
      'HEAD 222',
      'branch refs/heads/10-feature',
      '',
      'worktree C:/repo-wt-detached',
      'HEAD 333',
      'detached',
      '',
      'worktree C:/repo-wt-12',
      'HEAD 444',
      'branch refs/heads/12-x',
      'locked reason',
      '',
      'worktree C:/repo-wt-13',
      'HEAD 555',
      'branch refs/heads/13-y',
      'prunable gitdir file points to non-existent location',
      '',
    ].join('\n');
    assert.deepEqual(parseWorktrees(porcelain), [
      { dir: 'C:/repo', branch: 'main', head: '111', locked: false, prunable: false },
      { dir: 'C:/repo-wt-10', branch: '10-feature', head: '222', locked: false, prunable: false },
      { dir: 'C:/repo-wt-detached', branch: null, head: '333', locked: false, prunable: false },
      { dir: 'C:/repo-wt-12', branch: '12-x', head: '444', locked: true, prunable: false },
      { dir: 'C:/repo-wt-13', branch: '13-y', head: '555', locked: false, prunable: true },
    ]);
  });
});

describe('previewOf', () => {
  it('names the epic of a preview branch, and nothing else', () => {
    assert.equal(previewOf('693-preview'), 693);
    assert.equal(previewOf('693-preview-old'), null);
    assert.equal(previewOf('693-feature'), null);
    assert.equal(previewOf(null), null);
  });
});

describe('within', () => {
  it('holds for the folder and what is inside it, not for a sibling with the same prefix', () => {
    const dir = path.join(temp, 'repo-wt-10');
    assert.equal(within(dir, dir), true);
    assert.equal(within(dir, path.join(dir, 'projects', 'stencil')), true);
    assert.equal(within(dir, path.join(temp, 'repo-wt-100')), false);
  });
});

describe('decide', () => {
  it('trashes a worktree whose branch has landed with a merged pull request', () => {
    const decision = decide(worktree(), facts(), elsewhere);
    assert.equal(decision.action, 'trash');
    assert.match(decision.why, /#11 merged into `main`/);
  });

  for (const [name, wt, f, why] of [
    ['the one it runs in', worktree({ dir: elsewhere }), facts(), /you are in it/],
    ['a locked one', worktree({ locked: true }), facts(), /locked/],
    ['a detached head', worktree({ branch: null }), facts(), /detached/],
    ['an unreadable GitHub', worktree(), facts({ prs: null }), /GitHub could not be read/],
    [
      'an open pull request',
      worktree(),
      facts({ prs: [pr(), pr({ number: 12, state: 'OPEN' })] }),
      /#12 still open/,
    ],
    ['no pull request', worktree(), facts({ prs: [] }), /no merged pull request/],
    [
      'a closed, unmerged one',
      worktree(),
      facts({ prs: [pr({ state: 'CLOSED' })] }),
      /no merged pull request/,
    ],
    ['uncommitted changes', worktree(), facts({ dirty: [' M a.txt'] }), /uncommitted changes: 1/],
    ['commits after the merge', worktree(), facts({ landed: false }), /commits after the merge/],
    ['a merged head it does not have', worktree(), facts({ landed: null }), /git fetch/],
  ] as const)
    it(`keeps ${name}`, () => {
      const decision = decide(wt, f, elsewhere);
      assert.equal(decision.action, 'keep');
      assert.match(decision.why, why);
    });

  it('trashes the preview of a closed epic, keeps it while the epic is open or unknown', () => {
    const preview = worktree({ branch: '693-preview' });
    assert.equal(
      decide(preview, facts({ prs: [], epicState: 'CLOSED' }), elsewhere).action,
      'trash',
    );
    assert.match(
      decide(preview, facts({ prs: [], epicState: 'OPEN' }), elsewhere).why,
      /open epic #693/,
    );
    assert.equal(decide(preview, facts({ prs: [], epicState: null }), elsewhere).action, 'keep');
    assert.equal(
      decide(preview, facts({ prs: [], epicState: 'CLOSED', dirty: ['?? x'] }), elsewhere).action,
      'keep',
    );
  });
});

describe('trashCommand', () => {
  const none = () => false;
  it('sends to the Recycle Bin on Windows, the folder passed outside the script', () => {
    const command = trashCommand('win32', 'C:\\repo-wt-10', none);
    assert.equal(command?.file, 'powershell.exe');
    assert.equal(command?.env?.MAGMA_TRASH_PATH, 'C:\\repo-wt-10');
    const script = Buffer.from(command?.args.at(-1) ?? '', 'base64').toString('utf16le');
    assert.match(script, /FOF_ALLOWUNDO/);
    assert.match(
      script,
      /0x4000/,
      'FOF_WANTNUKEWARNING: too large for the bin stops, never deletes',
    );
  });
  it('uses trash on macOS when it has it, the Finder otherwise', () => {
    assert.deepEqual(
      trashCommand('darwin', '/r', (c) => c === '/usr/bin/trash'),
      {
        file: '/usr/bin/trash',
        args: ['/r'],
      },
    );
    assert.equal(trashCommand('darwin', '/r', none)?.file, 'osascript');
    assert.equal(trashCommand('darwin', '/r', none)?.args.at(-1), '/r');
  });
  it('uses gio on Linux, and has nothing to offer without it', () => {
    assert.deepEqual(
      trashCommand('linux', '/r', (c) => c === 'gio'),
      {
        file: 'gio',
        args: ['trash', '/r'],
      },
    );
    assert.equal(trashCommand('linux', '/r', none), null);
  });
});

describe('outsideLinks and removeLink', () => {
  it('finds the links out of a worktree and removes them without touching what they point to', () => {
    const shared = path.join(temp, 'links', 'shared-node_modules');
    mkdirSync(path.join(shared, 'pkg'), { recursive: true });
    writeFileSync(path.join(shared, 'pkg', 'index.js'), 'kept\n');
    const wt = path.join(temp, 'links', 'wt');
    mkdirSync(path.join(wt, 'projects', 'a'), { recursive: true });
    mkdirSync(path.join(wt, 'inner'), { recursive: true });
    linkDir(shared, path.join(wt, 'node_modules'));
    linkDir(shared, path.join(wt, 'projects', 'a', 'node_modules'));
    linkDir(path.join(wt, 'inner'), path.join(wt, 'to-inner'));

    const links = outsideLinks(wt)
      .map((link) => path.relative(wt, link))
      .sort();
    assert.deepEqual(links, [
      path.join('node_modules'),
      path.join('projects', 'a', 'node_modules'),
    ]);

    for (const link of outsideLinks(wt)) removeLink(link);
    assert.equal(existsSync(path.join(wt, 'node_modules')), false);
    assert.equal(readFileSync(path.join(shared, 'pkg', 'index.js'), 'utf8'), 'kept\n');
    assert.throws(() => removeLink(path.join(wt, 'inner')), /not a link/);
    // the link inside stays, and rmSync would follow it (Node does, on Windows): removed by hand
    removeLink(path.join(wt, 'to-inner'));
  });
});

describe('clean', () => {
  /** A repository with a main checkout and worktrees beside it. */
  const repository = (name: string) => {
    const root = path.join(temp, name);
    const main = path.join(root, 'repo');
    execFileSync('git', ['init', '--quiet', '-b', 'main', main]);
    sh(main, 'config', 'user.email', 'test@example.com');
    sh(main, 'config', 'user.name', 'test');
    writeFileSync(path.join(main, 'a.txt'), 'a\n');
    sh(main, 'add', 'a.txt');
    sh(main, 'commit', '--quiet', '--no-verify', '-m', 'base');
    const add = (branch: string) => {
      const dir = path.join(root, `repo-wt-${branch}`);
      sh(main, 'worktree', 'add', '--quiet', '-b', branch, dir, 'main');
      return dir;
    };
    const bin = path.join(root, 'bin');
    mkdirSync(bin);
    const trash = (dir: string) => renameSync(dir, path.join(bin, path.basename(dir)));
    return { root, main, add, bin, trash };
  };

  const merged: Facts = facts();
  const open: Facts = facts({ prs: [pr({ state: 'OPEN' })] });

  it('moves the landed worktrees to the trash, prunes them and deletes their branches', () => {
    const repo = repository('landed');
    const landed = repo.add('10-landed');
    const working = repo.add('11-open');
    const shared = path.join(repo.root, 'shared');
    mkdirSync(shared);
    writeFileSync(path.join(shared, 'keep.txt'), 'kept\n');
    linkDir(shared, path.join(landed, 'node_modules'));
    let linkGoneBeforeTrash = false;

    const result = clean(repo.main, {
      read: (wt) => (wt.branch === '10-landed' ? merged : open),
      trash: (dir) => {
        linkGoneBeforeTrash = !existsSync(path.join(dir, 'node_modules'));
        repo.trash(dir);
      },
    });

    assert.deepEqual(
      result.rows.map((row) => [row.worktree.branch, row.outcome]),
      [
        ['10-landed', 'trashed'],
        ['11-open', 'kept'],
      ],
    );
    assert.equal(linkGoneBeforeTrash, true, 'the links are removed before the folder moves');
    assert.equal(readFileSync(path.join(shared, 'keep.txt'), 'utf8'), 'kept\n');
    assert.equal(existsSync(path.join(repo.bin, 'repo-wt-10-landed', 'a.txt')), true);
    assert.equal(existsSync(working), true);
    assert.doesNotMatch(sh(repo.main, 'worktree', 'list'), /10-landed/);
    assert.equal(sh(repo.main, 'branch', '--list', '10-landed'), '');
    assert.notEqual(sh(repo.main, 'branch', '--list', '11-open'), '');
    assert.match(renderClean(result), /\| `repo-wt-10-landed` \| `10-landed` \| \[#11\]/);
  });

  it('changes nothing on a dry run', () => {
    const repo = repository('dry');
    const dir = repo.add('10-landed');
    const result = clean(repo.main, {
      dryRun: true,
      read: () => merged,
      trash: () => assert.fail('a dry run trashes nothing'),
    });
    assert.equal(result.rows[0]?.outcome, 'would trash');
    assert.equal(existsSync(dir), true);
    assert.notEqual(sh(repo.main, 'branch', '--list', '10-landed'), '');
    assert.match(renderClean(result), /without `--dry-run`/);
  });

  it('keeps the worktree and its branch when the trash refuses it', () => {
    const repo = repository('refused');
    const dir = repo.add('10-landed');
    const result = clean(repo.main, {
      read: () => merged,
      trash: () => {
        throw new Error('the Recycle Bin refused it (code -1)');
      },
    });
    assert.equal(result.rows[0]?.outcome, 'failed');
    assert.equal(existsSync(dir), true);
    assert.notEqual(sh(repo.main, 'branch', '--list', '10-landed'), '');
    assert.match(renderClean(result), /refused it/);
  });

  it('forgets a worktree whose folder is already gone, and keeps its branch', () => {
    const repo = repository('gone');
    const dir = repo.add('10-landed');
    rmSync(dir, { recursive: true, force: true });
    const result = clean(repo.main, {
      read: () => assert.fail('nothing to read for a folder that is gone'),
      trash: () => assert.fail('nothing to trash'),
    });
    assert.equal(result.rows[0]?.outcome, 'forgotten');
    assert.doesNotMatch(sh(repo.main, 'worktree', 'list'), /10-landed/);
    assert.notEqual(sh(repo.main, 'branch', '--list', '10-landed'), '', 'nothing says it landed');
  });
});
