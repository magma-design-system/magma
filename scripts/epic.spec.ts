import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  belongsTo,
  closes,
  holds,
  nextActions,
  report,
  rowsOf,
  type Epic,
  type Part,
  type PullRequest,
} from './epic.ts';

const URL = 'https://github.com/o/r';

const pr = (number: number, over: Partial<PullRequest> = {}): PullRequest => ({
  number,
  title: `pull request ${number}`,
  url: `${URL}/pull/${number}`,
  state: 'OPEN',
  isDraft: false,
  baseRefName: '10-epic',
  headRefName: `x-${number}`,
  createdAt: `2026-11-01T00:00:${String(number % 60).padStart(2, '0')}Z`,
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
  url: `${URL}/issues/${number}`,
  state: 'OPEN',
  branches: [],
  blockedBy: [],
  mentions: [],
  ...over,
});

const epic = (over: Partial<Epic> = {}): Epic => ({
  number: 10,
  title: 'epic: the work',
  url: `${URL}/issues/10`,
  state: 'OPEN',
  defaultBranch: 'main',
  branch: '10-epic',
  linkedBranches: ['10-epic'],
  parts: [],
  intoBranch: [],
  landings: [],
  distance: { ahead: 3, behind: 0 },
  ...over,
});

describe('closes', () => {
  it('reads every keyword GitHub reads, each with its own number', () => {
    assert.deepEqual([...closes('Closes #12, closes #34')], [12, 34]);
    assert.deepEqual([...closes('Fixes: #7\nresolved #5.')], [7, 5]);
    assert.deepEqual(
      [...closes('fix #1 close #2 fixed #3 resolve #4 resolves #6 closed #8')],
      [1, 2, 3, 4, 6, 8],
    );
  });
  it('reads no reference without a keyword, nor a number that only starts the same', () => {
    assert.deepEqual([...closes('Refs #12, #34; unclosed #9')], []);
    assert.equal(closes('Closes #123').has(12), false);
  });
});

describe('belongsTo', () => {
  it('takes the closing keyword, a branch linked to the part or a branch named after it', () => {
    assert.ok(belongsTo(pr(1, { body: 'Closes #20' }), part(20)));
    assert.ok(
      belongsTo(pr(1, { headRefName: 'my-branch' }), part(20, { branches: ['my-branch'] })),
    );
    assert.ok(belongsTo(pr(1, { headRefName: '20-the-part' }), part(20)));
  });
  it('leaves out a mere mention and a branch whose number only starts the same', () => {
    assert.equal(belongsTo(pr(1, { body: 'Refs #20', headRefName: '7-other' }), part(20)), false);
    assert.equal(belongsTo(pr(1, { headRefName: '201-other' }), part(20)), false);
  });
});

describe('rowsOf', () => {
  it('puts what landed first, by the time it landed, and the epic last', () => {
    const a = pr(1, { state: 'MERGED', mergedAt: '2026-11-03T00:00:00Z', headRefName: '20-a' });
    const b = pr(2, { state: 'MERGED', mergedAt: '2026-11-02T00:00:00Z', headRefName: '21-b' });
    const rows = rowsOf(
      epic({ parts: [part(20, { mentions: [a] }), part(21, { mentions: [b] })] }),
    );
    assert.deepEqual(
      rows.map((row) => [row.kind, row.pr?.number ?? null]),
      [
        ['landed', 2],
        ['landed', 1],
        ['epic', null],
      ],
    );
    assert.deepEqual(rows[0].state, ['merged 2026-11-02']);
  });

  it('orders the open pull requests by the declared dependencies, then first opened first', () => {
    const blocker = pr(5, { headRefName: '20-a', createdAt: '2026-11-05T00:00:00Z' });
    const blocked = pr(3, { headRefName: '21-b', createdAt: '2026-11-01T00:00:00Z' });
    const free = pr(4, { headRefName: '22-c', createdAt: '2026-11-02T00:00:00Z' });
    const rows = rowsOf(
      epic({
        parts: [
          part(20, { mentions: [blocker] }),
          part(21, { mentions: [blocked], blockedBy: [{ number: 20, state: 'OPEN' }] }),
          part(22, { mentions: [free] }),
        ],
      }),
    );
    assert.deepEqual(
      rows.filter((row) => row.kind === 'open').map((row) => row.pr?.number),
      [4, 5, 3],
    );
    assert.ok(rows.find((row) => row.pr?.number === 3)?.state.includes('blocked by #20'));
  });

  it('tells the epic own work, a landing of an earlier branch and a part outside the epic apart', () => {
    const own = pr(1, {
      state: 'MERGED',
      mergedAt: '2026-11-04T00:00:00Z',
      headRefName: '10-polish',
    });
    const earlier = pr(2, {
      state: 'MERGED',
      mergedAt: '2026-11-02T00:00:00Z',
      baseRefName: 'main',
      headRefName: '10-first-round',
      body: 'Closes #20, closes #21',
    });
    const outside = pr(3, {
      state: 'MERGED',
      mergedAt: '2026-11-03T00:00:00Z',
      baseRefName: 'main',
      headRefName: '21-b',
    });
    const rows = rowsOf(
      epic({
        branch: '10-second-round',
        parts: [part(20, { mentions: [earlier] }), part(21, { mentions: [earlier, outside] })],
        intoBranch: [{ ...own, baseRefName: '10-second-round' }],
      }),
    );
    const landed = rows.filter((row) => row.kind === 'landed');
    assert.deepEqual(
      landed.map((row) => [row.pr?.number, row.landing, row.parts.map((p) => p.number)]),
      [
        [2, true, []],
        [3, false, [21]],
        [1, false, []],
      ],
    );
    assert.match(landed[0].state[0], /from an earlier branch of the epic/);
    assert.match(landed[1].state[0], /outside the epic/);
  });

  it('leaves out a pull request closed without a merge and the pull request of the epic itself', () => {
    const closed = pr(1, { state: 'CLOSED', headRefName: '20-a' });
    const landing = pr(2, { baseRefName: 'main', headRefName: '10-epic', body: 'Closes #20' });
    const rows = rowsOf(
      epic({ parts: [part(20, { mentions: [closed, landing] })], landings: [landing] }),
    );
    assert.deepEqual(
      rows.map((row) => [row.kind, row.pr?.number ?? null]),
      [
        ['waiting', null],
        ['epic', 2],
      ],
    );
  });

  it('warns when two open pull requests change the same files', () => {
    const a = pr(1, { headRefName: '20-a', files: ['a.ts', 'b.ts'] });
    const b = pr(2, { headRefName: '21-b', files: ['b.ts'] });
    const rows = rowsOf(
      epic({ parts: [part(20, { mentions: [a] }), part(21, { mentions: [b] })] }),
    );
    assert.ok(rows[0].state.some((s) => s.startsWith('same files as #2 (1)')));
    assert.ok(rows[1].state.some((s) => s.startsWith('same files as #1 (1)')));
  });

  it('lists the parts with no pull request, the open ones first', () => {
    const rows = rowsOf(
      epic({ parts: [part(21, { state: 'CLOSED' }), part(20, { branches: ['20-a'] })] }),
    );
    assert.deepEqual(
      rows.filter((row) => row.kind === 'waiting').map((row) => row.state[0]),
      ['branch `20-a`, no pull request yet', 'closed without a pull request'],
    );
  });
});

describe('holds', () => {
  it('names everything that keeps a pull request from merging', () => {
    const held = holds(
      pr(1, { isDraft: true, checks: 'FAILURE', mergeable: 'CONFLICTING', baseRefName: 'main' }),
      [
        part(20, {
          blockedBy: [
            { number: 30, state: 'OPEN' },
            { number: 31, state: 'CLOSED' },
          ],
        }),
      ],
      '10-epic',
    );
    assert.deepEqual(held, [
      'it goes into `main`, not `10-epic`',
      'draft',
      'checks red',
      'conflicts with `main`',
      'blocked by #30',
    ]);
    assert.deepEqual(holds(pr(1, { checks: null }), [], '10-epic'), ['no checks reported']);
    assert.deepEqual(holds(pr(1), [], '10-epic'), []);
  });
});

describe('nextActions', () => {
  const actions = (e: Epic) => nextActions(e, rowsOf(e));

  it('asks for the branch of the epic when none or several are linked', () => {
    assert.match(
      actions(epic({ branch: null, linkedBranches: [] }))[0],
      /gh issue develop 10 --base main/,
    );
    assert.match(actions(epic({ branch: null, linkedBranches: ['a', 'b'] }))[0], /--branch=<name>/);
  });

  it('syncs the branch of the epic first, then leaves the ready part to the person', () => {
    const e = epic({
      distance: { ahead: 1, behind: 4 },
      parts: [part(20, { mentions: [pr(1, { headRefName: '20-a' })] })],
    });
    const out = actions(e);
    assert.match(out[0], /^Sync `10-epic` with `main` \(4 commits behind\) before the next merge/);
    assert.match(
      out[1],
      /is ready to merge into `10-epic`: it waits for your ok \(then `gh pr merge 1 --merge`\)/,
    );
  });

  it('says why the next part waits', () => {
    const e = epic({
      parts: [part(20, { mentions: [pr(1, { headRefName: '20-a', checks: 'PENDING' })] })],
    });
    assert.match(actions(e)[0], /is next, and waits: checks running\.$/);
  });

  it('points out a part that goes into the default branch instead of the epic', () => {
    const e = epic({
      parts: [part(20, { mentions: [pr(1, { headRefName: '20-a', baseRefName: 'main' })] })],
    });
    assert.match(
      actions(e)[0],
      /^#1 goes into `main`: retarget it onto `10-epic`, or take its part out of the epic/,
    );
  });

  it('lists the parts left when none has a pull request open', () => {
    assert.deepEqual(actions(epic({ parts: [part(20), part(21, { state: 'CLOSED' })] })), [
      'No part has a pull request open; the parts left: #20.',
    ]);
  });

  it('opens the pull request of the epic once every part is in, closing the open ones', () => {
    const merged = (n: number, p: number) =>
      pr(n, { state: 'MERGED', mergedAt: '2026-11-02T00:00:00Z', headRefName: `${p}-x` });
    const e = epic({
      distance: { ahead: 5, behind: 2 },
      parts: [
        part(20, { mentions: [merged(1, 20)] }),
        part(21, { mentions: [merged(2, 21)] }),
        part(22, { state: 'CLOSED', mentions: [merged(3, 22)] }),
      ],
    });
    assert.deepEqual(actions(e), [
      'Sync `10-epic` with `main` (2 commits behind) before the pull request of the epic (rule 2).',
      'Open the pull request of the epic, `10-epic` into `main`, with `Closes #20, closes #21` (rules 2, 3).',
    ]);
  });

  it('leaves the merge queue of the default branch to the person, and follows the epic into it', () => {
    const landing = pr(9, { baseRefName: 'main', headRefName: '10-epic' });
    assert.match(
      actions(epic({ landings: [landing] }))[0],
      /is ready for the merge queue of `main`: it waits for your ok \(then `gh pr merge 9`/,
    );
    assert.match(
      actions(epic({ landings: [{ ...landing, isInMergeQueue: true }] }))[0],
      /is in the merge queue of `main`\.$/,
    );
    assert.match(
      actions(
        epic({ landings: [{ ...landing, state: 'MERGED', mergedAt: '2026-11-09T00:00:00Z' }] }),
      )[0],
      /^The epic landed in `main`/,
    );
  });
});

describe('report', () => {
  it('writes the branch, a table whose cells keep their columns, and the next action', () => {
    const text = report(
      epic({ parts: [part(20, { title: 'a | b', mentions: [pr(1, { headRefName: '20-a' })] })] }),
    );
    assert.match(
      text,
      /^## Epic \[#10\]\(https:\/\/github\.com\/o\/r\/issues\/10\): epic: the work$/m,
    );
    assert.match(
      text,
      /^Branch of the epic: `10-epic`, 3 commits ahead of `main` and 0 behind\.$/m,
    );
    assert.match(
      text,
      /^\| 1 \| \[#20\]\(https:\/\/github\.com\/o\/r\/issues\/20\) a \\\| b \| \[#1\]\(https:\/\/github\.com\/o\/r\/pull\/1\) \| `10-epic` \| ready \|$/m,
    );
    assert.match(text, /^\| -> \| \*\*epic \[#10\]/m);
    assert.match(text, /^\*\*Next action\*\*$/m);
  });
  it('says when the branch is not on GitHub and when the epic has no sub-issues', () => {
    const text = report(epic({ distance: null }));
    assert.match(text, /Branch of the epic: `10-epic`, not on GitHub\./);
    assert.match(text, /The epic has no sub-issues/);
  });
});
