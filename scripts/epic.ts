/*
  Where an epic stands, as a table in the order its work lands (#1319).

  docs/WORKFLOW.md rule 2: the parts of an epic (its sub-issues) come back to the branch of the
  epic with a pull request each, the open parts sync with it after each merge, and the epic lands
  in the default branch with one pull request. Rule 1: a person decides every merge. This script
  only reads; the skill /epic (.claude/skills/epic) shows its table and carries out the merges a
  person approves.

    tsx scripts/epic.ts <epic number> [--branch=<branch of the epic>]
                                    print the table in Markdown, then the next action

  Where each answer comes from (GitHub, through `gh`, as the person running it sees it):

  - the parts: the native sub-issues of the epic;
  - the branch of the epic: the branch linked to the epic issue (rule 2 creates it with
    `gh issue develop <epic> --base <default branch>`); no linked branch, or more than one, is
    "unknown", and `--branch` names it;
  - the default branch: the repository's (`defaultBranchRef`), never a name written here;
  - the pull requests of a part: those that mention it (its timeline) and either close it with a
    keyword GitHub reads, in the `#<number>` form rule 3 writes (close, closes, closed, fix,
    fixes, fixed, resolve, resolves, resolved: "Linking a pull request to an issue" in the GitHub
    docs), or come from a branch linked to it or named `<part>-...` (the name `gh issue develop`
    gives, rule 3);
  - a landing of the epic: a pull request into the default branch from the branch of the epic, or
    from a branch named `<epic>-...` (an earlier branch of the same epic, once it landed and
    GitHub deleted it); it is not a part's even though it closes parts;
  - the epic's own work: the pull requests into the branch of the epic that belong to no part;
  - pull requests closed without a merge are left out: they landed nowhere;
  - the order: what landed, by the time it landed; then the open pull requests, a part after the
    open parts it is blocked by (the native issue dependencies, "blocked by"), otherwise in the
    order they were opened, as a merge queue takes them; then the parts with no pull request;
    the epic last. With no dependency declared there is no order beyond that: the script never
    guesses one from the content;
  - the checks: the rollup of the last commit of the pull request (none reported is not green);
    the conflicts: `mergeable`, which GitHub computes lazily (UNKNOWN until it has); the shared
    files: the files each open pull request changes (its first 100), a warning that the one
    merged second needs a sync with the branch of the epic first;
  - the distance from the default branch: the compare API, ahead and behind.
*/
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export type Checks = 'SUCCESS' | 'FAILURE' | 'ERROR' | 'PENDING' | 'EXPECTED' | null;

export interface PullRequest {
  number: number;
  title: string;
  url: string;
  state: 'OPEN' | 'MERGED' | 'CLOSED';
  isDraft: boolean;
  baseRefName: string;
  headRefName: string;
  createdAt: string;
  mergedAt: string | null;
  body: string;
  mergeable: 'MERGEABLE' | 'CONFLICTING' | 'UNKNOWN';
  isInMergeQueue: boolean;
  checks: Checks;
  files: string[];
}

export interface Part {
  number: number;
  title: string;
  url: string;
  state: 'OPEN' | 'CLOSED';
  /** The branches linked to the part. */
  branches: string[];
  /** The issues the part is blocked by (native issue dependencies). */
  blockedBy: { number: number; state: 'OPEN' | 'CLOSED' }[];
  /** The pull requests that mention the part. */
  mentions: PullRequest[];
}

export interface Epic {
  number: number;
  title: string;
  url: string;
  state: 'OPEN' | 'CLOSED';
  defaultBranch: string;
  /** The branch of the epic, or null when it is unknown. */
  branch: string | null;
  /** The branches linked to the epic issue. */
  linkedBranches: string[];
  parts: Part[];
  /** The pull requests into the branch of the epic. */
  intoBranch: PullRequest[];
  /** The pull requests from the branch of the epic into the default branch. */
  landings: PullRequest[];
  /** Commits of the branch of the epic past the default branch, and missing from it; null when the branch is not on GitHub. */
  distance: { ahead: number; behind: number } | null;
}

export type Kind = 'landed' | 'open' | 'waiting' | 'epic';

export interface Row {
  kind: Kind;
  /** The parts the row is about: none for the epic's own work and for a landing. */
  parts: Part[];
  pr: PullRequest | null;
  /** Whether the pull request is a landing of the epic in the default branch. */
  landing: boolean;
  state: string[];
}

const KEYWORD = /\b(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)\s*:?\s+#(\d+)\b/gi;

/** The issues a pull request body closes, by the keywords GitHub reads in the `#<number>` form. */
export const closes = (body: string): Set<number> =>
  new Set([...body.matchAll(KEYWORD)].map((match) => Number(match[1])));

/** Whether a pull request lands the epic in the default branch (its current or an earlier branch). */
export const isLanding = (pr: PullRequest, epic: Epic): boolean =>
  pr.baseRefName === epic.defaultBranch &&
  (pr.headRefName === epic.branch || pr.headRefName.startsWith(`${epic.number}-`));

/** Whether a pull request is the work of a part. */
export const belongsTo = (pr: PullRequest, part: Part): boolean =>
  closes(pr.body).has(part.number) ||
  part.branches.includes(pr.headRefName) ||
  pr.headRefName.startsWith(`${part.number}-`);

const day = (iso: string): string => iso.slice(0, 10);

const checksText = (checks: Checks): string =>
  checks === 'SUCCESS'
    ? 'checks green'
    : checks === 'FAILURE' || checks === 'ERROR'
      ? 'checks red'
      : checks === 'PENDING' || checks === 'EXPECTED'
        ? 'checks running'
        : 'no checks reported';

/** The open issues among those a set of parts is blocked by. */
const openBlockers = (parts: Part[]): number[] => [
  ...new Set(
    parts.flatMap((part) => part.blockedBy.filter((b) => b.state === 'OPEN').map((b) => b.number)),
  ),
];

/** What keeps an open pull request from merging into `into`; empty when it is ready. */
export const holds = (pr: PullRequest, parts: Part[], into: string): string[] => {
  const out: string[] = [];
  if (pr.baseRefName !== into) out.push(`it goes into \`${pr.baseRefName}\`, not \`${into}\``);
  if (pr.isDraft) out.push('draft');
  if (pr.checks !== 'SUCCESS') out.push(checksText(pr.checks));
  if (pr.mergeable === 'CONFLICTING') out.push(`conflicts with \`${pr.baseRefName}\``);
  if (pr.mergeable === 'UNKNOWN') out.push('mergeability not computed yet');
  const blockers = openBlockers(parts);
  if (blockers.length) out.push(`blocked by ${blockers.map((n) => `#${n}`).join(', ')}`);
  return out;
};

/** The rows of the table, in the order the work lands. */
export const rowsOf = (epic: Epic): Row[] => {
  const prs = new Map<number, PullRequest>();
  const partsOf = new Map<number, Part[]>();
  const keep = (pr: PullRequest) => {
    if (pr.state === 'CLOSED') return;
    if (pr.headRefName === epic.branch && pr.baseRefName === epic.defaultBranch) return;
    prs.set(pr.number, pr);
  };
  for (const part of epic.parts)
    for (const pr of part.mentions)
      if (belongsTo(pr, part) || isLanding(pr, epic)) {
        keep(pr);
        const listed = partsOf.get(pr.number) ?? [];
        if (prs.has(pr.number) && !isLanding(pr, epic) && !listed.includes(part))
          partsOf.set(pr.number, [...listed, part]);
      }
  for (const pr of epic.intoBranch) {
    keep(pr);
    if (prs.has(pr.number) && !partsOf.has(pr.number))
      partsOf.set(
        pr.number,
        epic.parts.filter((part) => belongsTo(pr, part)),
      );
  }

  const landed: Row[] = [];
  const open: Row[] = [];
  for (const pr of prs.values()) {
    const parts = partsOf.get(pr.number) ?? [];
    const landing = isLanding(pr, epic);
    if (pr.state === 'MERGED') {
      const where = landing
        ? `landed in \`${pr.baseRefName}\` ${day(pr.mergedAt ?? '')}, from an earlier branch of the epic`
        : pr.baseRefName === epic.branch
          ? `merged ${day(pr.mergedAt ?? '')}`
          : pr.baseRefName === epic.defaultBranch
            ? `merged into \`${pr.baseRefName}\` ${day(pr.mergedAt ?? '')}, outside the epic`
            : `merged into \`${pr.baseRefName}\` ${day(pr.mergedAt ?? '')}`;
      landed.push({ kind: 'landed', parts, pr, landing, state: [where] });
      continue;
    }
    const state: string[] = [];
    if (pr.isInMergeQueue) state.push('in the merge queue');
    const held = holds(pr, parts, epic.branch ?? pr.baseRefName);
    state.push(...(held.length ? held : ['ready']));
    if (!landing && epic.branch && pr.baseRefName === epic.defaultBranch)
      state.push(
        'outside the epic: retarget it onto the branch of the epic, or take it out of the epic (rule 2)',
      );
    open.push({ kind: 'open', parts, pr, landing, state });
  }
  landed.sort((a, b) => (a.pr?.mergedAt ?? '').localeCompare(b.pr?.mergedAt ?? ''));

  // Open pull requests: a part after the open parts it is blocked by, otherwise first opened first.
  open.sort((a, b) => (a.pr?.createdAt ?? '').localeCompare(b.pr?.createdAt ?? ''));
  const ordered: Row[] = [];
  const pending = [...open];
  while (pending.length) {
    const unplaced = new Set(pending.flatMap((row) => row.parts.map((part) => part.number)));
    const free = pending.findIndex((row) => !openBlockers(row.parts).some((n) => unplaced.has(n)));
    ordered.push(...pending.splice(free === -1 ? 0 : free, 1));
  }
  for (const row of ordered) {
    const shared = ordered
      .filter((other) => other !== row)
      .map((other) => ({
        number: other.pr?.number,
        files: (other.pr?.files ?? []).filter((file) => row.pr?.files.includes(file)).length,
      }))
      .filter((other) => other.files);
    for (const other of shared)
      row.state.push(
        `same files as #${other.number} (${other.files}): the one merged second syncs first`,
      );
  }

  const covered = new Set([...partsOf.values()].flat().map((part) => part.number));
  const waiting: Row[] = epic.parts
    .filter((part) => !covered.has(part.number))
    .sort((a, b) => (a.state === b.state ? a.number - b.number : a.state === 'OPEN' ? -1 : 1))
    .map((part) => ({
      kind: 'waiting',
      parts: [part],
      pr: null,
      landing: false,
      state: [
        part.state === 'CLOSED'
          ? 'closed without a pull request'
          : part.branches.length
            ? `branch \`${part.branches[0]}\`, no pull request yet`
            : 'no pull request yet',
      ],
    }));

  const landing =
    epic.landings.find((pr) => pr.state === 'OPEN') ??
    [...epic.landings]
      .filter((pr) => pr.state === 'MERGED')
      .sort((a, b) => (b.mergedAt ?? '').localeCompare(a.mergedAt ?? ''))[0] ??
    null;
  const epicState: string[] = !landing
    ? ['no pull request yet']
    : landing.state === 'MERGED'
      ? [`landed ${day(landing.mergedAt ?? '')}`]
      : [
          ...(landing.isInMergeQueue ? ['in the merge queue'] : []),
          ...(holds(landing, [], epic.defaultBranch).length
            ? holds(landing, [], epic.defaultBranch)
            : ['ready']),
        ];
  const epicRow: Row = { kind: 'epic', parts: [], pr: landing, landing: true, state: epicState };

  return [...landed, ...ordered, ...waiting, epicRow];
};

const link = (n: number, url: string): string => `[#${n}](${url})`;

/** The next steps, in order: what a person decides is said as such, never done. */
export const nextActions = (epic: Epic, rows: Row[]): string[] => {
  const n = epic.number;
  const def = epic.defaultBranch;
  if (!epic.branch)
    return [
      epic.linkedBranches.length > 1
        ? `Name the branch of the epic: more than one is linked to #${n} (${epic.linkedBranches.map((b) => `\`${b}\``).join(', ')}); pass \`--branch=<name>\`.`
        : `Create the branch of the epic: \`gh issue develop ${n} --base ${def}\` (rule 2).`,
    ];
  const branch = epic.branch;
  const epicRow = rows.find((row) => row.kind === 'epic');
  const landing = epicRow?.pr ?? null;
  const open = rows.filter((row) => row.kind === 'open');
  const behind = epic.distance?.behind ?? 0;
  const sync = (before: string) =>
    `Sync \`${branch}\` with \`${def}\` (${behind} commits behind) before ${before} (rule 2).`;
  const out: string[] = [];

  for (const row of open)
    if (row.pr && !row.landing && row.pr.baseRefName !== branch)
      out.push(
        `#${row.pr.number} goes into \`${row.pr.baseRefName}\`: retarget it onto \`${branch}\`, or take its part out of the epic (rule 2). A person decides which.`,
      );

  const next = open.find((row) => row.pr && !row.landing && row.pr.baseRefName === branch);
  if (next?.pr) {
    const held = holds(next.pr, next.parts, branch);
    if (behind > 0) out.push(sync('the next merge into it'));
    out.push(
      held.length
        ? `${link(next.pr.number, next.pr.url)} is next, and waits: ${held.join(', ')}.`
        : `${link(next.pr.number, next.pr.url)} is ready to merge into \`${branch}\`: it waits for your ok (then \`gh pr merge ${next.pr.number} --merge\`); after it, the open parts sync with \`${branch}\`.`,
    );
    return out;
  }

  const left = rows.filter((row) => row.kind === 'waiting' && row.parts[0]?.state === 'OPEN');
  if (left.length) {
    out.push(
      `No part has a pull request open; the parts left: ${left.map((row) => `#${row.parts[0].number}`).join(', ')}.`,
    );
    return out;
  }

  if (!landing) {
    if (behind > 0) out.push(sync('the pull request of the epic'));
    const resolves = epic.parts.filter((part) => part.state === 'OPEN').map((part) => part.number);
    out.push(
      `Open the pull request of the epic, \`${branch}\` into \`${def}\`${
        resolves.length
          ? `, with \`${resolves.map((p, i) => `${i ? 'closes' : 'Closes'} #${p}`).join(', ')}\``
          : ''
      } (rules 2, 3).`,
    );
    return out;
  }
  if (landing.state === 'MERGED') {
    out.push(`The epic landed in \`${def}\` with ${link(landing.number, landing.url)}.`);
    return out;
  }
  if (landing.isInMergeQueue) {
    out.push(`${link(landing.number, landing.url)} is in the merge queue of \`${def}\`.`);
    return out;
  }
  const held = holds(landing, [], def);
  out.push(
    held.length
      ? `${link(landing.number, landing.url)} waits: ${held.join(', ')}.`
      : `${link(landing.number, landing.url)} is ready for the merge queue of \`${def}\`: it waits for your ok (then \`gh pr merge ${landing.number}\`, once no dispatched \`publish\` run is in progress, rule 1).`,
  );
  return out;
};

const cell = (text: string): string => text.replace(/\r?\n/g, ' ').replace(/\|/g, '\\|');

const short = (text: string, max = 60): string =>
  text.length > max ? `${text.slice(0, max - 3).trimEnd()}...` : text;

/** The report: the epic, its branch, the table and the next action, in Markdown. */
export const report = (epic: Epic): string => {
  const rows = rowsOf(epic);
  const lines: string[] = [`## Epic ${link(epic.number, epic.url)}: ${cell(epic.title)}`, ''];
  if (epic.state === 'CLOSED') lines.push('The epic issue is closed.', '');
  if (!epic.branch)
    lines.push(
      epic.linkedBranches.length > 1
        ? `Branch of the epic: unknown, more than one is linked (${epic.linkedBranches.map((b) => `\`${b}\``).join(', ')}).`
        : 'Branch of the epic: unknown, none is linked to the epic issue.',
    );
  else if (!epic.distance) lines.push(`Branch of the epic: \`${epic.branch}\`, not on GitHub.`);
  else
    lines.push(
      `Branch of the epic: \`${epic.branch}\`, ${epic.distance.ahead} commits ahead of \`${epic.defaultBranch}\` and ${epic.distance.behind} behind.`,
    );
  if (!epic.parts.length)
    lines.push('', 'The epic has no sub-issues: rule 2 makes each part a sub-issue of the epic.');
  lines.push(
    '',
    '| # | Part | Pull request | Into | State |',
    '|---|------|--------------|------|-------|',
  );
  let i = 0;
  for (const row of rows) {
    const what =
      row.kind === 'epic' || row.landing
        ? `**epic ${link(epic.number, epic.url)}**`
        : row.parts.length
          ? row.parts
              .map((part) => `${link(part.number, part.url)} ${cell(short(part.title))}`)
              .join('<br>')
          : 'work of the epic itself';
    const into =
      row.pr?.baseRefName ??
      (row.kind === 'epic' ? epic.defaultBranch : (epic.branch ?? epic.defaultBranch));
    lines.push(
      `| ${row.kind === 'epic' ? '->' : ++i} | ${what} | ${row.pr ? link(row.pr.number, row.pr.url) : '-'} | \`${cell(into)}\` | ${cell(row.state.join('; '))} |`,
    );
  }
  lines.push('', '**Next action**', '', ...nextActions(epic, rows).map((action) => `- ${action}`));
  return lines.join('\n');
};

// GitHub, through `gh`.

const gh = (args: string[]): string =>
  execFileSync('gh', args, {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

const graphql = <T>(query: string, variables: Record<string, string | number>): T => {
  const args = ['api', 'graphql', '-f', `query=${query}`];
  for (const [key, value] of Object.entries(variables))
    args.push(typeof value === 'number' ? '-F' : '-f', `${key}=${value}`);
  return (JSON.parse(gh(args)) as { data: T }).data;
};

const PR_FIELDS = `fragment pr on PullRequest {
  number title url state isDraft baseRefName headRefName createdAt mergedAt body mergeable isInMergeQueue
  commits(last: 1) { nodes { commit { statusCheckRollup { state } } } }
}`;

interface RawPullRequest extends Omit<PullRequest, 'checks' | 'files'> {
  commits: { nodes: { commit: { statusCheckRollup: { state: Checks } | null } }[] };
}

const toPullRequest = (raw: RawPullRequest): PullRequest => ({
  number: raw.number,
  title: raw.title,
  url: raw.url,
  state: raw.state,
  isDraft: raw.isDraft,
  baseRefName: raw.baseRefName,
  headRefName: raw.headRefName,
  createdAt: raw.createdAt,
  mergedAt: raw.mergedAt,
  body: raw.body ?? '',
  mergeable: raw.mergeable,
  isInMergeQueue: raw.isInMergeQueue,
  checks: raw.commits.nodes[0]?.commit.statusCheckRollup?.state ?? null,
  files: [],
});

const isPullRequest = (node: unknown): node is RawPullRequest =>
  typeof node === 'object' && node !== null && 'headRefName' in node;

/** Reads an epic from GitHub. */
export const readEpic = (number: number, branchOption?: string): Epic => {
  const repo = JSON.parse(gh(['repo', 'view', '--json', 'owner,name'])) as {
    owner: { login: string };
    name: string;
  };
  const vars = { owner: repo.owner.login, name: repo.name };
  type Issue = {
    number: number;
    title: string;
    url: string;
    state: 'OPEN' | 'CLOSED';
    linkedBranches: { nodes: { ref: { name: string } | null }[] };
  };
  const first = graphql<{
    repository: {
      defaultBranchRef: { name: string };
      issue:
        | (Issue & {
            subIssues: {
              nodes: (Issue & {
                blockedBy: { nodes: { number: number; state: 'OPEN' | 'CLOSED' }[] };
                timelineItems: { nodes: { source?: unknown }[] };
              })[];
            };
          })
        | null;
    };
  }>(
    `
      ${PR_FIELDS}
      query ($owner: String!, $name: String!, $n: Int!) {
        repository(owner: $owner, name: $name) {
          defaultBranchRef {
            name
          }
          issue(number: $n) {
            number
            title
            url
            state
            linkedBranches(first: 10) {
              nodes {
                ref {
                  name
                }
              }
            }
            subIssues(first: 50) {
              nodes {
                number
                title
                url
                state
                linkedBranches(first: 10) {
                  nodes {
                    ref {
                      name
                    }
                  }
                }
                blockedBy(first: 20) {
                  nodes {
                    number
                    state
                  }
                }
                timelineItems(first: 100, itemTypes: [CROSS_REFERENCED_EVENT]) {
                  nodes {
                    ... on CrossReferencedEvent {
                      source {
                        ...pr
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `,
    { ...vars, n: number },
  );
  const issue = first.repository.issue;
  if (!issue) throw new Error(`#${number} is not an issue of ${vars.owner}/${vars.name}`);
  const names = (branches: Issue['linkedBranches']) =>
    branches.nodes.map((node) => node.ref?.name).filter((name): name is string => !!name);
  const defaultBranch = first.repository.defaultBranchRef.name;
  const linkedBranches = names(issue.linkedBranches);
  const branch = branchOption ?? (linkedBranches.length === 1 ? linkedBranches[0] : null);
  const parts: Part[] = issue.subIssues.nodes.map((sub) => ({
    number: sub.number,
    title: sub.title,
    url: sub.url,
    state: sub.state,
    branches: names(sub.linkedBranches),
    blockedBy: sub.blockedBy.nodes,
    mentions: sub.timelineItems.nodes
      .map((node) => node.source)
      .filter(isPullRequest)
      .map(toPullRequest),
  }));

  let intoBranch: PullRequest[] = [];
  let landings: PullRequest[] = [];
  let distance: Epic['distance'] = null;
  if (branch) {
    const second = graphql<{
      repository: { into: { nodes: RawPullRequest[] }; landings: { nodes: RawPullRequest[] } };
    }>(
      `
        ${PR_FIELDS}
        query ($owner: String!, $name: String!, $branch: String!, $base: String!) {
          repository(owner: $owner, name: $name) {
            into: pullRequests(baseRefName: $branch, first: 100, states: [OPEN, MERGED]) {
              nodes {
                ...pr
              }
            }
            landings: pullRequests(
              headRefName: $branch
              baseRefName: $base
              first: 10
              states: [OPEN, MERGED]
            ) {
              nodes {
                ...pr
              }
            }
          }
        }
      `,
      { ...vars, branch, base: defaultBranch },
    );
    intoBranch = second.repository.into.nodes.map(toPullRequest);
    landings = second.repository.landings.nodes.map(toPullRequest);
    try {
      const compare = JSON.parse(
        gh([
          'api',
          `repos/${vars.owner}/${vars.name}/compare/${defaultBranch}...${branch}`,
          '--jq',
          '{ahead: .ahead_by, behind: .behind_by}',
        ]),
      ) as { ahead: number; behind: number };
      distance = compare;
    } catch {
      distance = null;
    }
  }

  // The files of the open pull requests, for the shared-files warning.
  const open = new Map<number, PullRequest[]>();
  for (const pr of [...parts.flatMap((part) => part.mentions), ...intoBranch, ...landings])
    if (pr.state === 'OPEN') open.set(pr.number, [...(open.get(pr.number) ?? []), pr]);
  if (open.size) {
    const aliases = [...open.keys()].map(
      (n) => `p${n}: pullRequest(number: ${n}) { files(first: 100) { nodes { path } } }`,
    );
    const files = graphql<{
      repository: Record<string, { files: { nodes: { path: string }[] } } | null>;
    }>(
      `query($owner: String!, $name: String!) { repository(owner: $owner, name: $name) { ${aliases.join('\n')} } }`,
      vars,
    );
    for (const [n, copies] of open) {
      const paths = files.repository[`p${n}`]?.files.nodes.map((node) => node.path) ?? [];
      for (const pr of copies) pr.files = paths;
    }
  }

  return {
    number: issue.number,
    title: issue.title,
    url: issue.url,
    state: issue.state,
    defaultBranch,
    branch,
    linkedBranches,
    parts,
    intoBranch,
    landings,
    distance,
  };
};

const main = () => {
  const args = process.argv.slice(2);
  const value = (name: string) =>
    args.find((arg) => arg.startsWith(`--${name}=`))?.slice(name.length + 3);
  const number = Number(value('epic') ?? args.find((arg) => /^\d+$/.test(arg)));
  if (!Number.isInteger(number) || number <= 0) {
    console.error('usage: tsx scripts/epic.ts <epic number> [--branch=<branch of the epic>]');
    process.exitCode = 2;
    return;
  }
  console.info(report(readEpic(number, value('branch'))));
};

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) main();
