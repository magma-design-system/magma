/**
 * Pure logic of pr-risk.ts: the review level of a pull request and the semver check of
 * its public API change. Kept free of git and file-system access so
 * scripts/pr-risk-lib.spec.ts can test it directly.
 *
 * The review level is the highest of:
 * - contract: magma.api.txt changes (the public component API, see api-snapshot-lib.ts);
 * - behaviour: sources that ship as code change (components, wrappers, codemods, the
 *   consumer-facing fields of a package manifest);
 * - visual: only CSS, tokens, styles, icons or brand assets change;
 * - low: docs, tests, stories, tooling, CI.
 * Each level tells the reviewer what to look at (REVIEW below), so the attention goes to
 * the few PRs that change what consumers rely on.
 *
 * The semver check reads each changed line of the snapshot: a removal or a narrowing is
 * major, an addition or a widening is minor. The release the commits declare (the stock
 * commit-analyzer rules, as semantic-release reads them) must be at least that.
 */

export type Tier = 'contract' | 'behaviour' | 'visual' | 'low';
export type FileTier = Exclude<Tier, 'contract'>;
export type Bump = 'major' | 'minor' | 'patch';

const TIER_RANK: Record<Tier, number> = { low: 0, visual: 1, behaviour: 2, contract: 3 };
const BUMP_RANK: Record<Bump, number> = { patch: 1, minor: 2, major: 3 };
const bumpRank = (bump: Bump | null): number => (bump ? BUMP_RANK[bump] : 0);
const maxBump = (bumps: (Bump | null)[]): Bump | null =>
  bumps.reduce<Bump | null>((a, b) => (bumpRank(b) > bumpRank(a) ? b : a), null);

/* first match wins, anything unmatched is low */
const MANIFEST = /^projects\/[^/]+(\/magma-angular)?\/package\.json$/;
const FILE_RULES: [RegExp, FileTier][] = [
  /* generated, or read as the contract by apiChanges */
  [/^projects\/stencil\/src\/components\.d\.ts$/, 'low'],
  [/^projects\/stencil\/magma\.api\.txt$/, 'low'],
  [/^projects\/stencil-react\/src\//, 'low'],
  [/\/stencil-generated\//, 'low'],
  /* tests, stories, docs, playgrounds */
  [/(^|\/)(test|tests|fixtures|usage|playground|treeshaking-probe|\.storybook)\//, 'low'],
  [/^projects\/stencil\/src\/storybook\//, 'low'],
  [/\.(spec|e2e|test|stories)\.[cm]?[jt]sx?$/, 'low'],
  [/\.mdx?$/, 'low'],
  /* what ships */
  [MANIFEST, 'behaviour'],
  [/^projects\/.+\.css$/, 'visual'],
  [/^projects\/(styles|design-tokens|svg-icons|icons|identity)\//, 'visual'],
  [/^projects\/stencil\/assets\//, 'visual'],
  [/^projects\/stencil\/src\//, 'behaviour'],
  [/^projects\/stencil\/stencil\.config\.ts$/, 'behaviour'],
  [
    /^projects\/stencil\/scripts\/(postcss-token-fallbacks|patch-custom-elements-lazy-import)\.ts$/,
    'behaviour',
  ],
  [/^projects\/stencil-angular\/magma-angular\//, 'behaviour'],
  [/^projects\/codemod\/src\//, 'behaviour'],
];

/**
 * The level of one changed file. A package manifest counts as behaviour only when
 * `manifestReachesConsumers` says a field other than scripts, devDependencies or version
 * changed (see manifestReachesConsumers).
 */
export const fileTier = (path: string, manifestReachesConsumers = true): FileTier => {
  if (MANIFEST.test(path) && !manifestReachesConsumers) return 'low';
  return FILE_RULES.find(([rule]) => rule.test(path))?.[1] ?? 'low';
};

/** Fields of a package.json that never reach a consumer of the published package. */
const MANIFEST_PRIVATE = new Set(['scripts', 'devDependencies', 'version']);

/** True when a package.json change reaches consumers (exports, sideEffects, dependencies...). */
export const manifestReachesConsumers = (before: string | null, after: string | null): boolean => {
  if (before == null || after == null) return true;
  const strip = (json: string) =>
    JSON.stringify(
      Object.entries(JSON.parse(json) as Record<string, unknown>)
        .filter(([key]) => !MANIFEST_PRIVATE.has(key))
        .sort(([a], [b]) => a.localeCompare(b)),
    );
  return strip(before) !== strip(after);
};

/** The review level of a PR and the files that set it. */
export const prTier = (
  files: { path: string; tier: FileTier }[],
  apiChanged: boolean,
): { tier: Tier; because: string[] } => {
  if (apiChanged) return { tier: 'contract', because: ['projects/stencil/magma.api.txt'] };
  const tier = files.reduce<Tier>((t, f) => (TIER_RANK[f.tier] > TIER_RANK[t] ? f.tier : t), 'low');
  return { tier, because: files.filter((f) => f.tier === tier).map((f) => f.path) };
};

/* ---- the snapshot diff ------------------------------------------------------------- */

export interface ApiChange {
  key: string;
  before?: string;
  after?: string;
  bump: Bump;
  why: string;
}

const isMember = (line: string) => line !== '' && !line.startsWith('#');

/** What identifies a snapshot line across versions: component, kind and name, or the type name. */
export const memberKey = (line: string): string => {
  const declared = /^(?:type|interface|enum|class)\s+(\w+)/.exec(line);
  if (declared) return `type ${declared[1]}`;
  const [tag, kind, rest = ''] = line.split(' ');
  if (kind === 'encapsulation') return `${tag} ${kind}`;
  if (kind === 'method') return `${tag} ${kind} ${rest.split('(')[0]}`;
  if (kind === 'event') return `${tag} ${kind} ${rest.replace(/:$/, '')}`;
  return `${tag} ${kind} ${rest}`;
};

/** The members of a top-level union, `"a" | "b" | undefined` -> a, b, undefined. */
const unionMembers = (type: string): Set<string> => {
  const members: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < type.length; i++) {
    const c = type[i];
    if ('([{<'.includes(c)) depth++;
    else if (')]}>'.includes(c)) depth--;
    else if (c === '|' && depth === 0) {
      members.push(type.slice(start, i).trim());
      start = i + 1;
    }
  }
  members.push(type.slice(start).trim());
  return new Set(members.filter(Boolean));
};

const compareSets = (
  before: Set<string>,
  after: Set<string>,
  what: string,
): [Bump, string] | null => {
  const lost = [...before].filter((m) => !after.has(m));
  const gained = [...after].filter((m) => !before.has(m));
  if (lost.length) return ['major', `${what} no longer has ${lost.join(', ')}`];
  if (gained.length) return ['minor', `${what} also has ${gained.join(', ')}`];
  return null;
};

const flagSet = (flags: string | undefined) =>
  new Set(
    (flags ?? '')
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean),
  );

/* removing one of these breaks consumers, adding it does not (required: the other way round) */
const flagChanges = (before: Set<string>, after: Set<string>): [Bump, string][] => {
  const out: [Bump, string][] = [];
  for (const flag of ['reflect', 'bubbles', 'composed', 'cancelable']) {
    if (before.has(flag) && !after.has(flag)) out.push(['major', `no longer ${flag}`]);
    if (!before.has(flag) && after.has(flag)) out.push(['minor', `now ${flag}`]);
  }
  if (!before.has('required') && after.has('required')) out.push(['major', 'now required']);
  if (before.has('required') && !after.has('required')) out.push(['minor', 'no longer required']);
  if (before.has('mutable') !== after.has('mutable')) out.push(['patch', 'mutable changed']);
  return out;
};

const deprecation = (before: string, after: string): [Bump, string][] => {
  const was = before.endsWith(' DEPRECATED');
  const is = after.endsWith(' DEPRECATED');
  if (!was && is) return [['minor', 'deprecated']];
  if (was && !is) return [['patch', 'no longer deprecated']];
  return [];
};
const undeprecated = (line: string) => line.replace(/ DEPRECATED$/, '');

const PROP = /^\S+ prop \S+ \(([^)]*)\)(?: \[([^\]]*)\])?: (.*?)(?: = (.*))?$/;
const EVENT = /^\S+ event \S+: (.*?)(?: \[([^\]]*)\])?$/;
const INTERFACE = /^interface \w+(?:<[^>]*>)? \{ (.*) \}$/;
const ALIAS = /^type \w+(?:<[^>]*>)? = (.*)$/;

/** What a changed line does to consumers: every facet that differs, with its weight. */
const changedLine = (before: string, after: string): [Bump, string][] => {
  const facets = deprecation(before, after);
  const b = undeprecated(before);
  const a = undeprecated(after);
  if (b === a) return facets;

  const props = [PROP.exec(b), PROP.exec(a)];
  if (props[0] && props[1]) {
    const [, attrB, flagsB, typeB, defB] = props[0];
    const [, attrA, flagsA, typeA, defA] = props[1];
    if (attrB !== attrA)
      facets.push(
        attrB === 'no attr' ? ['minor', `now ${attrA}`] : ['major', `${attrB} became ${attrA}`],
      );
    facets.push(...flagChanges(flagSet(flagsB), flagSet(flagsA)));
    const types = compareSets(unionMembers(typeB), unionMembers(typeA), 'the type');
    if (types) facets.push(types);
    if (defB !== defA) facets.push(['major', `default ${defB ?? 'none'} became ${defA ?? 'none'}`]);
    return facets;
  }

  const events = [EVENT.exec(b), EVENT.exec(a)];
  if (events[0] && events[1]) {
    if (events[0][1] !== events[1][1]) facets.push(['major', 'the detail type changed']);
    facets.push(...flagChanges(flagSet(events[0][2]), flagSet(events[1][2])));
    return facets;
  }

  const interfaces = [INTERFACE.exec(b), INTERFACE.exec(a)];
  if (interfaces[0] && interfaces[1]) {
    const fields = (body: string) =>
      new Set(
        body
          .split(';')
          .map((f) => f.trim())
          .filter(Boolean),
      );
    facets.push(
      compareSets(fields(interfaces[0][1]), fields(interfaces[1][1]), 'the interface') ?? [
        'patch',
        'reformatted',
      ],
    );
    return facets;
  }

  const aliases = [ALIAS.exec(b), ALIAS.exec(a)];
  if (aliases[0] && aliases[1]) {
    facets.push(
      compareSets(unionMembers(aliases[0][1]), unionMembers(aliases[1][1]), 'the type') ?? [
        'patch',
        'reformatted',
      ],
    );
    return facets;
  }

  /* encapsulation, method signature, a declaration that changed shape */
  facets.push(['major', 'changed']);
  return facets;
};

/** Every member the two snapshots disagree on, with the release it needs. */
export const apiChanges = (before: string, after: string): ApiChange[] => {
  const index = (file: string) =>
    new Map(
      file
        .split('\n')
        .filter(isMember)
        .map((line) => [memberKey(line), line]),
    );
  const b = index(before);
  const a = index(after);
  const changes: ApiChange[] = [];
  for (const [key, line] of b) {
    const now = a.get(key);
    if (now === undefined) changes.push({ key, before: line, bump: 'major', why: 'removed' });
    else if (now !== line) {
      const facets = changedLine(line, now);
      const bump = maxBump(facets.map(([f]) => f)) ?? 'patch';
      changes.push({
        key,
        before: line,
        after: now,
        bump,
        why: facets.map(([, why]) => why).join('; '),
      });
    }
  }
  for (const [key, line] of a) {
    if (b.has(key)) continue;
    const required = / prop .*\[[^\]]*\brequired\b/.test(line);
    changes.push(
      required
        ? { key, after: line, bump: 'major', why: 'added as required' }
        : { key, after: line, bump: 'minor', why: 'added' },
    );
  }
  return changes.sort((x, y) => bumpRank(y.bump) - bumpRank(x.bump) || x.key.localeCompare(y.key));
};

export const requiredBump = (changes: ApiChange[]): Bump | null =>
  maxBump(changes.map((c) => c.bump));

/* ---- what the commits declare ----------------------------------------------------- */

/**
 * The release one commit asks for, as the stock @semantic-release/commit-analyzer reads it
 * with the conventionalcommits preset: breaking (`!` or a BREAKING CHANGE footer) -> major,
 * feat -> minor, fix / perf / revert -> patch, anything else -> none.
 */
export const commitRelease = (message: string): Bump | null => {
  const header = message.split('\n', 1)[0].trim();
  if (/^(revert: |Revert ")/.test(header)) return 'patch';
  const parsed = /^(\w+)(?:\([^)]*\))?(!)?: /.exec(header);
  if (!parsed) return null;
  if (parsed[2] || /^BREAKING[ -]CHANGE: /m.test(message)) return 'major';
  if (parsed[1] === 'feat') return 'minor';
  if (parsed[1] === 'fix' || parsed[1] === 'perf') return 'patch';
  return null;
};

export const declaredRelease = (messages: string[]): Bump | null =>
  maxBump(messages.map(commitRelease));

/** True when the commits declare at least the release the API change needs. */
export const semverOk = (required: Bump | null, declared: Bump | null): boolean =>
  bumpRank(declared) >= bumpRank(required);

/* ---- the report ------------------------------------------------------------------- */

export const REPORT_MARKER = '<!-- magma-pr-risk -->';

export const REVIEW: Record<Tier, string> = {
  contract:
    'The public component API changes. Read the members below one by one: each must be intended, and the release must say so.',
  behaviour:
    'Shipped code changes, the public API does not. Review the tests that cover the change: do they describe the new behaviour, and would they fail on the old code?',
  visual:
    'Only CSS, tokens, styles, icons or brand assets change. Look at the rendered result (the stories of the components involved), not at the CSS.',
  low: 'Docs, tests, stories, tooling or CI only. A green CI is enough.',
};

/* enough to review in a comment, short enough to read */
const SHOWN = 60;

export interface RiskReport {
  tier: Tier;
  because: string[];
  /** null when the base branch has no snapshot to compare with */
  changes: ApiChange[] | null;
  required: Bump | null;
  declared: Bump | null;
  scope: string;
}

export const renderReport = (r: RiskReport): string => {
  const out = [REPORT_MARKER, `### Review level: ${r.tier}`, '', REVIEW[r.tier], ''];

  if (r.tier === 'behaviour' || r.tier === 'visual') {
    out.push(`Set by ${r.because.length} file(s):`, '');
    for (const path of r.because.slice(0, 10)) out.push(`- \`${path}\``);
    if (r.because.length > 10) out.push(`- ... ${r.because.length - 10} more`);
    out.push('');
  }

  if (r.changes === null) {
    out.push(
      'The base branch has no `projects/stencil/magma.api.txt` yet: the API and release checks are skipped.',
    );
    return out.join('\n') + '\n';
  }

  if (r.changes.length) {
    out.push(`#### API changes (${r.changes.length})`, '');
    for (const c of r.changes.slice(0, SHOWN)) out.push(`- **${c.bump}** \`${c.key}\`: ${c.why}`);
    if (r.changes.length > SHOWN) out.push(`- ... ${r.changes.length - SHOWN} more`);
    out.push('', '<details><summary>Snapshot diff</summary>', '', '```diff');
    for (const c of r.changes.slice(0, SHOWN)) {
      if (c.before) out.push(`- ${c.before}`);
      if (c.after) out.push(`+ ${c.after}`);
    }
    out.push('```', '', '</details>', '');
  }

  const declared = r.declared ?? 'no release';
  if (!r.required) {
    out.push(`**Release**: no API change; the commits in scope declare ${declared}.`);
  } else if (semverOk(r.required, r.declared)) {
    out.push(
      `**Release**: the API change needs ${r.required}, the commits in scope declare ${declared}. OK.`,
    );
  } else {
    out.push(
      `**Release: FAILS.** The API change needs a **${r.required}** release of magma, the commits in scope (\`${r.scope}\`) declare **${declared}**, ` +
        'so semantic-release would ship it as less than it is.',
      '',
      r.required === 'major'
        ? 'If the break is intended, declare it: a commit with `!` after the type or scope (`feat(mds-button)!: ...`) or a `BREAKING CHANGE:` footer, and a migration note. If it is not, restore the members above.'
        : 'Declare it with a `feat(<scope>): ...` commit, or restore the members above if the change is not intended.',
    );
  }
  return out.join('\n') + '\n';
};
