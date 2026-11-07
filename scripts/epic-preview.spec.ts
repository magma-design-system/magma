import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, describe, it } from 'node:test';
import {
  chooseCopy,
  entriesOf,
  isModulesLink,
  rebuild,
  renderPreview,
  uncommitted,
  type Entry,
} from './epic-preview.ts';
import type { Epic, Part, PullRequest } from './epic.ts';

const sh = (cwd: string, ...args: string[]) =>
  execFileSync('git', ['-C', cwd, ...args], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();

const temp = mkdtempSync(path.join(os.tmpdir(), 'epic-preview-'));
after(() => rmSync(temp, { recursive: true, force: true }));

/** A repository with a base branch `epic` and part branches made of one commit each. */
const repository = (name: string) => {
  const repo = path.join(temp, name);
  execFileSync('git', ['init', '--quiet', '-b', 'epic', repo]);
  sh(repo, 'config', 'user.email', 'test@example.com');
  sh(repo, 'config', 'user.name', 'test');
  const commit = (branch: string, file: string, text: string) => {
    // symbolic-ref answers on the unborn branch of a new repository too, where checkout fails
    if (sh(repo, 'symbolic-ref', '--short', 'HEAD') !== branch)
      sh(repo, 'checkout', '--quiet', branch);
    writeFileSync(path.join(repo, file), text);
    sh(repo, 'add', file);
    sh(repo, 'commit', '--quiet', '--no-verify', '-m', `${branch}: ${file}`);
  };
  commit('epic', 'shared.txt', 'base\n');
  for (const [branch, file, text] of [
    ['20-a', 'a.txt', 'a\n'],
    ['21-b', 'shared.txt', 'from b\n'],
    ['22-c', 'shared.txt', 'from c\n'],
  ]) {
    sh(repo, 'branch', branch, 'epic');
    commit(branch, file, text);
  }
  sh(repo, 'checkout', '--quiet', 'epic');
  return repo;
};

const entry = (
  branch: string,
  over: Partial<Entry> = {},
): Omit<Entry, 'outcome' | 'conflicts'> => ({
  parts: [],
  pr: null,
  branch,
  ref: branch,
  copy: 'local',
  notPushed: 'never',
  diverged: false,
  worktree: null,
  dirty: [],
  ...over,
});

describe('isModulesLink', () => {
  it('leaves out the node_modules links a worktree carries, and nothing else', () => {
    assert.ok(isModulesLink('?? node_modules'));
    assert.ok(isModulesLink('?? projects/stencil/node_modules'));
    assert.equal(isModulesLink('?? node_modules_notes.md'), false);
    assert.equal(isModulesLink(' M package.json'), false);
  });
});

describe('chooseCopy', () => {
  it('takes the local copy when it holds commits origin has not, and says when origin moved too', () => {
    assert.deepEqual(chooseCopy({ local: true, remote: true, ahead: 2, behind: 0 }), {
      copy: 'local',
      notPushed: 2,
      diverged: false,
    });
    assert.deepEqual(chooseCopy({ local: true, remote: true, ahead: 1, behind: 3 }), {
      copy: 'local',
      notPushed: 1,
      diverged: true,
    });
  });
  it('takes origin when the local copy is only behind or missing, and knows a branch never pushed', () => {
    assert.equal(chooseCopy({ local: true, remote: true, ahead: 0, behind: 4 }).copy, 'origin');
    assert.equal(chooseCopy({ local: false, remote: true, ahead: 0, behind: 0 }).copy, 'origin');
    assert.deepEqual(chooseCopy({ local: true, remote: false, ahead: 0, behind: 0 }), {
      copy: 'local',
      notPushed: 'never',
      diverged: false,
    });
    assert.equal(chooseCopy({ local: false, remote: false, ahead: 0, behind: 0 }).copy, 'missing');
  });
});

describe('entriesOf', () => {
  const pr = (number: number, head: string, over: Partial<PullRequest> = {}): PullRequest => ({
    number,
    title: '',
    url: `https://x/pull/${number}`,
    state: 'OPEN',
    isDraft: false,
    baseRefName: '10-epic',
    headRefName: head,
    createdAt: `2026-11-0${number}T00:00:00Z`,
    mergedAt: null,
    body: '',
    mergeable: 'MERGEABLE',
    isInMergeQueue: false,
    checks: 'SUCCESS',
    files: [],
    ...over,
  });
  const part = (number: number, over: Partial<Part> = {}): Part => ({
    number,
    title: `part ${number}`,
    url: `https://x/issues/${number}`,
    state: 'OPEN',
    branches: [],
    blockedBy: [],
    mentions: [],
    ...over,
  });
  const epic = (parts: Part[], intoBranch: PullRequest[] = []): Epic => ({
    number: 10,
    title: 'epic',
    url: 'https://x/issues/10',
    state: 'OPEN',
    defaultBranch: 'main',
    branch: '10-epic',
    linkedBranches: ['10-epic'],
    parts,
    intoBranch,
    landings: [],
    distance: { ahead: 0, behind: 0 },
  });

  it('merges the open pull requests in their order, then the parts with no pull request by their branch', () => {
    const entries = entriesOf(
      epic(
        [
          part(20, { mentions: [pr(2, '20-a')] }),
          part(21, { branches: ['21-linked'] }),
          part(22),
          part(23, { state: 'CLOSED' }),
        ],
        [pr(1, '10-own-work')],
      ),
      ['22-local', '23-closed'],
    );
    assert.deepEqual(
      entries.map((e) => [e.branch, e.parts.map((p) => p.number)]),
      [
        ['10-own-work', []],
        ['20-a', [20]],
        ['21-linked', [21]],
        ['22-local', [22]],
      ],
    );
  });

  it('lists a part with no branch at all, so the table says it is missing', () => {
    assert.deepEqual(
      entriesOf(epic([part(20)]), []).map((e) => e.branch),
      [null],
    );
  });
});

describe('rebuild', () => {
  it('merges each branch in order, skips the one that conflicts and names its files', () => {
    const repo = repository('merge');
    const dir = path.join(temp, 'merge-preview');
    const result = rebuild(repo, dir, '10-preview', 'epic', [
      entry('20-a'),
      entry('21-b'),
      entry('22-c'),
      entry('none', { ref: null, copy: 'missing' }),
    ]);
    assert.deepEqual(result.blocked, []);
    assert.equal(result.created, true);
    assert.deepEqual(
      result.entries.map((e) => [e.branch, e.outcome, e.conflicts]),
      [
        ['20-a', 'merged', []],
        ['21-b', 'merged', []],
        ['22-c', 'conflict', ['shared.txt']],
        ['none', 'missing', []],
      ],
    );
    assert.deepEqual(uncommitted(dir), [], 'a conflict is aborted, not left in the folder');
  });

  it('rebuilds from scratch on the next run, and knows a branch already in the base', () => {
    const repo = repository('again');
    const dir = path.join(temp, 'again-preview');
    rebuild(repo, dir, '10-preview', 'epic', [entry('20-a')]);
    sh(repo, 'merge', '--quiet', '--no-edit', '20-a');
    const second = rebuild(repo, dir, '10-preview', 'epic', [entry('20-a'), entry('21-b')]);
    assert.deepEqual(
      second.entries.map((e) => [e.branch, e.outcome]),
      [
        ['20-a', 'already in'],
        ['21-b', 'merged'],
      ],
    );
  });

  it('never touches a preview that holds uncommitted changes or a commit of its own', () => {
    const repo = repository('guard');
    const dir = path.join(temp, 'guard-preview');
    rebuild(repo, dir, '10-preview', 'epic', [entry('20-a')]);
    writeFileSync(path.join(dir, 'notes.txt'), 'work\n');
    const dirty = rebuild(repo, dir, '10-preview', 'epic', [entry('20-a')]);
    assert.match(dirty.blocked.join(), /holds uncommitted changes: notes\.txt/);
    sh(dir, 'add', 'notes.txt');
    sh(dir, 'commit', '--quiet', '--no-verify', '-m', 'work on the preview');
    const committed = rebuild(repo, dir, '10-preview', 'epic', [entry('20-a')]);
    assert.match(
      committed.blocked.join(),
      /holds commits of its own: [0-9a-f]+ work on the preview/,
    );
    assert.equal(
      sh(dir, 'log', '-1', '--format=%s'),
      'work on the preview',
      'the commit is still there',
    );
  });
});

describe('renderPreview', () => {
  it('says what each branch brings and what stays out', () => {
    const text = renderPreview({
      epic: {
        number: 10,
        title: 'epic',
        url: 'https://x/issues/10',
        state: 'OPEN',
        defaultBranch: 'main',
        branch: '10-epic',
        linkedBranches: [],
        parts: [],
        intoBranch: [],
        landings: [],
        distance: { ahead: 3, behind: 1 },
      },
      dir: '/repos/magma-wt-10-preview',
      branch: '10-preview',
      base: 'origin/10-epic',
      blocked: [],
      created: true,
      modules: false,
      entries: [
        {
          ...entry('20-a', {
            worktree: '/repos/magma-wt-20',
            dirty: [' M a.ts', '?? b.ts'],
            notPushed: 3,
          }),
          outcome: 'merged',
          conflicts: [],
        },
        { ...entry('22-c'), outcome: 'conflict', conflicts: ['shared.txt'] },
        {
          ...entry('23-d', { copy: 'origin', notPushed: 0 }),
          outcome: 'already in',
          conflicts: [],
        },
      ],
    });
    assert.match(
      text,
      /^\| 1 \| work of the epic itself \| `20-a` \| `magma-wt-20` \| 2 files \| 3 commits \| yes, without the 2 uncommitted files \|$/m,
    );
    assert.match(text, /^\| 2 \| .* \| no: conflicts in `shared\.txt` \|$/m);
    assert.match(text, /^\| 3 \| .* `23-d` \(origin\) .* already in the branch of the epic \|$/m);
    assert.match(text, /Install once: `npm ci` in `\/repos\/magma-wt-10-preview`/);
    assert.match(text, /Commit on its branch what each part should show: `magma-wt-20`/);
  });
});
