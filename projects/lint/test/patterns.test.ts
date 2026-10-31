// The patterns core (#1174): the format, the coverage of the cases, the links, the layers, the
// answer for a situation and the generated body, on the patterns Magma ships and on small ones
// written here to break one rule each.
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, test } from 'vitest';

import { loadComponents, loadStyles, loadThemeNames } from '../src/core/data.js';
import {
  answer,
  bodyErrors,
  carrierErrors,
  componentErrors,
  coverage,
  formatErrors,
  layerErrors,
  linkErrors,
  lintErrors,
  listPatterns,
  missingPreviews,
  parseCarrier,
  parsePatternFile,
  parsePreview,
  parseUse,
  previewLinkErrors,
  projectErrors,
  readPatternDir,
  readPreviews,
  readProjectDir,
  regionsFor,
  resolveLayer,
  rulesOfCase,
  rulesOfComponent,
  syncBody,
  coverageErrors,
  type Layer,
  type Pattern,
  type PatternFile,
  type Situation,
} from '../src/core/patterns.js';
import { data } from './mcp-context.js';

const SOURCES = path.join(import.meta.dirname, '../../../docs/agents/patterns');
const LAYER = path.join(
  import.meta.dirname,
  'fixtures/project/magma/patterns/message-placement.md',
);

/** A decided pattern small enough to read: two variables, `decision` among them. */
const small = (over: Partial<Pattern> = {}): Pattern => ({
  id: 'small',
  kind: 'pattern',
  title: 'Small',
  group: 'messages-and-states',
  layer: 'magma',
  status: 'decided',
  need: 'A need.',
  principle: 'A principle.',
  keywords: ['small'],
  'validated-on': [],
  variables: {
    about: { values: ['field', 'action'], means: 'what it is about' },
    decision: { values: ['none', 'needed'], means: 'a choice to make' },
  },
  cases: [
    { id: 'on-field', about: 'field', where: 'under the field' },
    { id: 'on-action', about: 'action', where: 'a toast' },
    { id: 'ask', about: 'action', decision: 'needed', where: 'a dialog' },
  ],
  gaps: [],
  'not-applicable': [{ about: 'field', decision: 'needed', why: 'a field asks nothing' }],
  'always-true': [{ id: 'one-rule', rule: 'A rule.', 'checked-by': 'review' }],
  'open-choices': [{ id: 'one-choice', default: 'a', may: 'choose b' }],
  situations: [{ situation: 'A thing happens', case: 'on-field' }],
  ...over,
});
const file = (pattern: Pattern): PatternFile => ({
  file: `${pattern.id}.md`,
  data: pattern,
  body: '',
});

describe('the patterns Magma ships', () => {
  const files = readPatternDir(SOURCES);
  const patterns = files.map((one) => one.data);

  test('the patterns of Data and of Messages and states are decided, their candidates cited', () => {
    expect(
      listPatterns(patterns)
        .filter((one) => one.kind === 'pattern' && one.status === 'decided')
        .map((one) => one.id),
    ).toEqual([
      'list-with-filters',
      'record-detail',
      'confirm-action',
      'empty-state',
      'error-recovery',
      'loading',
      'message-placement',
    ]);
  });

  test('the building blocks come after the domains, before the patterns: page-header, used by the two of Data', () => {
    const listed = listPatterns(patterns);
    const kinds = listed.map((one) => one.kind);
    expect(kinds.indexOf('block')).toBeGreaterThan(kinds.lastIndexOf('foundation'));
    expect(kinds.lastIndexOf('block')).toBeLessThan(kinds.indexOf('pattern'));
    const header = patterns.find((one) => one.id === 'page-header')!;
    expect(header).toMatchObject({ kind: 'block', status: 'decided' });
    expect(header['used-by']).toEqual(['list-with-filters', 'record-detail']);
    expect(
      regionsFor(header, { level: 'nested', subject: 'item' }).regions.map((one) => one.id),
    ).toEqual(['back', 'number', 'title', 'status', 'summary', 'actions']);
    expect(
      regionsFor(header, { level: 'top', subject: 'set' }).regions.map((one) => one.id),
    ).toEqual(['title', 'summary', 'actions']);
  });

  test('the domains of Foundation come first, rhythm among them', () => {
    const listed = listPatterns(patterns);
    expect(listed[0]).toMatchObject({ id: 'rhythm', kind: 'foundation', status: 'decided' });
    expect(listed[0]).not.toHaveProperty('group');
    expect(listed.findLastIndex((one) => one.kind === 'foundation')).toBeLessThan(
      listed.findIndex((one) => one.kind !== 'foundation'),
    );
  });

  test.each(files.map((one) => [one.data.id, one] as const))(
    '%s: its format, its cases, its body',
    (_id, one) => {
      expect(formatErrors(one)).toEqual([]);
      const { none, conflicts } = coverage(one.data);
      expect(none).toEqual([]);
      expect(conflicts).toEqual([]);
      expect(bodyErrors(one.data, one.body, patterns)).toEqual([]);
    },
  );

  test('every link resolves', () => {
    expect([...linkErrors(patterns)]).toEqual([]);
  });

  test('get_guide names a domain by its id: no guide has it', () => {
    const guides = readdirSync(path.join(SOURCES, '..'))
      .filter((name) => name.endsWith('.md'))
      .map((name) => name.slice(0, -3).toLowerCase());
    const domains = patterns.filter((one) => one.kind === 'foundation').map((one) => one.id);
    expect(domains).toContain('rhythm');
    expect(domains.filter((id) => guides.includes(id))).toEqual([]);
  });

  test('each component a domain carries a rule on is governed by it', () => {
    const domains = patterns.filter((one) => one.kind === 'foundation');
    for (const domain of domains)
      for (const one of [...(domain.cases ?? []), ...(domain['always-true'] ?? [])])
        for (const text of [...(one['carried-by'] ?? []), ...(one['carried-by-planned'] ?? [])]) {
          const carrier = parseCarrier(text);
          if (carrier?.kind !== 'component') continue;
          expect(
            rulesOfComponent(patterns, carrier.use.tag).map((rule) => `${rule.from}/${rule.id}`),
          ).toContain(`${domain.id}/${one.id}`);
        }
    expect(rulesOfComponent(patterns, 'mds-input-field').map((rule) => rule.id)).toEqual([
      'label-control',
    ]);
  });

  test('message-placement answers each of its 384 combinations once', () => {
    const placement = patterns.find((one) => one.id === 'message-placement')!;
    expect(coverage(placement).total).toBe(384);
  });
});

describe('the format', () => {
  test('a complete pattern has no error', () => {
    expect(formatErrors(file(small()))).toEqual([]);
  });

  test('a candidate needs only its identity and its need', () => {
    const { id, kind, title, group, layer, need } = small();
    expect(
      formatErrors(file({ id, kind, title, group, layer, need, status: 'candidate' })),
    ).toEqual([]);
  });

  test('a variable may not take the name of a key of the entries', () => {
    const errors = formatErrors(
      file(small({ variables: { ...small().variables, why: { values: ['a'], means: 'why' } } })),
    );
    expect(errors).toContain('no variable may be named why: it is a key of the entries');
  });

  test('an entry gives only values its variables have, and a case its where', () => {
    const errors = formatErrors(
      file(
        small({
          cases: [
            { id: 'bad', about: 'region', where: '' },
            { id: 'bad', topic: 'x', where: 'w' },
          ],
        }),
      ),
    );
    expect(errors).toEqual(
      expect.arrayContaining([
        'case bad: about is one of field, action, not region',
        'case bad: where is required',
        'case bad: the id is used twice',
        'case bad: topic is neither a variable nor a field of a case',
      ]),
    );
  });

  test('values are text: an unquoted yes of YAML 1.1 is no value', () => {
    const errors = formatErrors(
      file(small({ variables: { flag: { values: [true as unknown as string], means: 'm' } } })),
    );
    expect(errors).toContain(
      'variable flag has its values, a list of text (quote yes, no and numbers)',
    );
  });

  test('a decided pattern has no gaps', () => {
    expect(formatErrors(file(small({ gaps: [{ about: 'field', note: 'open' }] })))).toContain(
      'a decided pattern has no gaps: decide them, or set the status to draft',
    );
  });

  test('a rule says how it is checked, a lint rule by its name', () => {
    const errors = formatErrors(
      file(
        small({
          'always-true': [
            { id: 'a', rule: 'A.', 'checked-by': 'lint' },
            { id: 'b', rule: 'B.', 'checked-by': 'review', lint: 'magma/b' },
            { id: 'c', rule: 'C.' },
            { id: 'd', from: 'other', rule: 'D.' },
          ],
        }),
      ),
    );
    expect(errors).toEqual([
      'always-true a: checked by lint names the rule in lint',
      'always-true b: checked by review names no lint (lint-planned for one to write)',
      'always-true c: checked-by is review or lint',
      'always-true d: a rule cited from another pattern has only its id and from',
    ]);
  });

  test('a use is a tag and its attributes', () => {
    expect(parseUse('mds-toast variant=error duration=0 dismissible')).toEqual({
      tag: 'mds-toast',
      attributes: [
        { name: 'variant', value: 'error' },
        { name: 'duration', value: '0' },
        { name: 'dismissible' },
      ],
    });
    expect(parseUse('a toast, with an action')).toBeUndefined();
  });
});

/** A domain of Foundation small enough to read: one variable, its relations the cases. */
const domain = (over: Partial<Pattern> = {}): Pattern => ({
  id: 'spacing',
  kind: 'foundation',
  title: 'Spacing',
  layer: 'magma',
  status: 'decided',
  need: 'Space two elements by their relation.',
  principle: 'Nearer is closer.',
  keywords: ['space'],
  'validated-on': [],
  variables: { relation: { values: ['inline', 'inset'], means: 'how the two relate' } },
  cases: [
    {
      id: 'inline',
      relation: 'inline',
      where: 'gap-md',
      serves: 'intuitive',
      'carried-by': ['gap-md'],
      'carried-by-planned': ['gap-inline'],
    },
    {
      id: 'inset',
      relation: 'inset',
      where: 'p-md',
      serves: ['intuitive', 'flexible'],
      'carried-by': ['mds-banner'],
    },
  ],
  'always-true': [
    {
      id: 'ladder',
      rule: 'Only the steps of the ladder.',
      serves: 'intuitive',
      'checked-by': 'review',
    },
  ],
  situations: [{ situation: 'Two buttons in a row', case: 'inline' }],
  ...over,
});

describe('a domain of Foundation', () => {
  test('a complete domain has no error, and no group', () => {
    expect(formatErrors(file(domain()))).toEqual([]);
    expect(formatErrors(file(domain({ group: 'data' })))).toEqual([
      'a domain of Foundation has no group: Foundation is its place',
    ]);
    const groupless = small();
    delete groupless.group;
    expect(formatErrors(file(groupless))).toEqual(['group is required, as text']);
  });

  test('every case and rule says the principle it serves', () => {
    const errors = formatErrors(
      file(
        domain({
          cases: [
            { id: 'inline', relation: 'inline', where: 'w' },
            { id: 'inset', relation: 'inset', where: 'w', serves: ['flexible', 'pretty'] },
          ],
          'always-true': [{ id: 'ladder', rule: 'R.', 'checked-by': 'review' }],
        }),
      ),
    );
    expect(errors).toEqual([
      'case inline: serves is required: the principle it serves, inclusive, enabling, intuitive, flexible',
      'case inset: serves is one of inclusive, enabling, intuitive, flexible, not pretty',
      'always-true ladder: serves is required: the principle it serves, inclusive, enabling, intuitive, flexible',
    ]);
  });

  test('a carrier is a component, a custom property, a lint rule or a utility, named once', () => {
    expect(parseCarrier('mds-modal slot=window')).toMatchObject({
      kind: 'component',
      use: { tag: 'mds-modal', attributes: [{ name: 'slot', value: 'window' }] },
    });
    expect(parseCarrier('--magma-rhythm-inset')).toEqual({
      kind: 'token',
      text: '--magma-rhythm-inset',
    });
    expect(parseCarrier('magma/token-values')).toEqual({
      kind: 'lint',
      text: 'magma/token-values',
    });
    expect(parseCarrier('gap-between-fields')).toEqual({
      kind: 'utility',
      text: 'gap-between-fields',
    });
    for (const text of ['md:gap-md', 'p-[3px]', 'gap md', 'mds-Card'])
      expect(parseCarrier(text)).toBeUndefined();
    const errors = formatErrors(
      file(
        domain({
          cases: [
            {
              id: 'inline',
              relation: 'inline',
              where: 'w',
              serves: 'intuitive',
              'carried-by': ['md:gap-md', 'gap-md'],
              'carried-by-planned': ['gap-md'],
            },
            {
              id: 'inset',
              relation: 'inset',
              where: 'w',
              serves: 'intuitive',
              'carried-by': 'p-md' as unknown as string[],
            },
          ],
          'always-true': [
            {
              id: 'ladder',
              rule: 'R.',
              serves: 'intuitive',
              'checked-by': 'review',
              'carried-by-planned': ['magma/ladder'],
            },
          ],
        }),
      ),
    );
    expect(errors).toEqual([
      'case inline: carried-by "md:gap-md" is not a component (mds-tag attribute=value), a custom property (--name), a lint rule (magma/<rule>) or a utility (one class)',
      'case inline: gap-md is named twice in its carriers',
      'case inset: carried-by is a list of carriers',
      'always-true ladder: the lint rule of an always-true rule goes in lint or lint-planned',
    ]);
  });

  test('serves and the carriers belong to a domain, and its ids name one thing', () => {
    expect(
      formatErrors(
        file(
          small({
            cases: [
              { id: 'on-field', about: 'field', where: 'w', serves: 'intuitive' },
              { id: 'on-action', about: 'action', where: 'w', 'carried-by': ['mds-banner'] },
              { id: 'ask', about: 'action', decision: 'needed', where: 'w' },
            ],
          }),
        ),
      ),
    ).toEqual([
      'case on-field: serves belongs to a domain of Foundation (kind foundation)',
      'case on-action: carried-by belongs to a domain of Foundation (kind foundation)',
    ]);
    expect(
      formatErrors(
        file(
          domain({
            'always-true': [
              { id: 'inline', rule: 'R.', serves: 'intuitive', 'checked-by': 'review' },
            ],
          }),
        ),
      ),
    ).toEqual(['always-true inline: a case of the domain has this id: a citation would name both']);
  });

  test('every carrier is in the release; a planned one is not yet', () => {
    const release = {
      components: loadComponents({ documentation: data.documentation }),
      styles: loadStyles({ documentation: data.documentation }),
      theme: loadThemeNames({ consumption: data.consumption }),
      lintRules: new Set(['magma/token-values']),
    };
    expect(carrierErrors(domain(), release)).toEqual([]);
    const one = domain({
      cases: [
        {
          id: 'inline',
          relation: 'inline',
          where: 'w',
          serves: 'intuitive',
          'carried-by': [
            'mds-banner variant=error',
            'mds-nope',
            'mds-banner variant=nope',
            '--mds-banner-background',
            '--mds-banner-cockade-distance',
            '--spacing-md',
            '--nope',
            'gap-md',
            'max-w-md',
            'text-title-h3',
            'gap-nope',
            'magma/token-values',
            'magma/nope',
          ],
        },
        {
          id: 'inset',
          relation: 'inset',
          where: 'w',
          serves: 'intuitive',
          'carried-by-planned': [
            'gap-md',
            'gap-inset',
            'mds-banner variant=nope',
            'magma/token-values',
          ],
        },
      ],
      'always-true': [
        {
          id: 'ladder',
          rule: 'R.',
          serves: 'intuitive',
          'checked-by': 'review',
          'carried-by': ['--magma-rhythm-ladder'],
        },
      ],
    });
    expect(carrierErrors(one, release)).toEqual([
      'case inline: carried by mds-nope, but mds-nope is not a component of this release',
      'case inline: carried by mds-banner variant=nope, but variant of mds-banner is one of ai, dark, error, info, light, primary, success, warning, not nope',
      'case inline: carried by --mds-banner-cockade-distance, but --mds-banner-cockade-distance is internal to mds-banner: a carrier is public',
      'case inline: carried by --nope, but the release has no custom property --nope',
      'case inline: carried by gap-nope, but the theme makes no class gap-nope',
      'case inline: carried by magma/nope, but the lint has no rule magma/nope',
      'case inset: gap-md exists now: move it from carried-by-planned to carried-by',
      'case inset: magma/token-values exists now: move it from carried-by-planned to carried-by',
      'always-true ladder: carried by --magma-rhythm-ladder, but the release has no custom property --magma-rhythm-ladder',
    ]);
  });

  test('its cases cover its variables, and answer for a context', () => {
    expect(coverage(domain())).toEqual({ total: 2, none: [], conflicts: [] });
    expect(answer(domain(), { relation: 'inset' }).hits.map(({ entry }) => entry.id)).toEqual([
      'inset',
    ]);
  });

  test('a pattern cites a relation or a rule of a domain, never one it lacks', () => {
    const one = small({
      'always-true': [
        { id: 'inline', from: 'spacing' },
        { id: 'ladder', from: 'spacing' },
        { id: 'nope', from: 'spacing' },
      ],
    });
    expect(linkErrors([one, domain()]).get('small')).toEqual([
      'always-true nope: spacing has no rule nor case nope of its own',
    ]);
    const synced = syncBody(one, '# S\n', [one, domain()]);
    expect(synced).toContain('| `inline` | gap-md (from `spacing`) |  |');
    expect(synced).toContain(
      '| `ladder` | Only the steps of the ladder. (from `spacing`) | review |',
    );
  });

  test('a case names the rules of the domains it relies on, by <domain>/<id>', () => {
    const errors = formatErrors(
      file(
        small({
          cases: [
            { id: 'on-field', about: 'field', where: 'w', rules: ['spacing/inline', 'spacing'] },
            {
              id: 'on-action',
              about: 'action',
              where: 'w',
              rules: ['spacing/inset', 'spacing/inset', 'a/b/c'],
            },
            { id: 'ask', about: 'action', decision: 'needed', where: 'w', rules: 'spacing/inline' },
          ],
        }),
      ),
    );
    expect(errors).toEqual([
      'case on-field: rules "spacing" is not <domain>/<id>, such as rhythm/inline',
      'case on-action: spacing/inset is named twice in its rules',
      'case on-action: rules "a/b/c" is not <domain>/<id>, such as rhythm/inline',
      'case ask: rules is a list of <domain>/<id>, such as rhythm/inline',
    ]);
    expect(
      formatErrors(file(small({ variables: { rules: { values: ['a'], means: 'm' } }, cases: [] }))),
    ).toContain('no variable may be named rules: it is a key of the entries');
  });

  test('a rule a case names is a rule or a relation of a domain, never one it lacks', () => {
    const other = small({ id: 'other', aliases: ['older'] });
    const one = small({
      cases: [
        {
          id: 'on-field',
          about: 'field',
          where: 'w',
          rules: ['spacing/inline', 'spacing/ladder', 'spacing/nope', 'nowhere/inline'],
        },
        { id: 'on-action', about: 'action', where: 'w', rules: ['other/one-rule', 'older/x'] },
        { id: 'ask', about: 'action', decision: 'needed', where: 'w' },
      ],
    });
    const own = domain({
      cases: [
        ...domain().cases!.slice(0, 1),
        { ...domain().cases![1]!, rules: ['spacing/inline'] },
      ],
    });
    const errors = linkErrors([one, other, own]);
    expect(errors.get('small')).toEqual([
      'case on-field: rules spacing/nope: spacing has no rule nor case nope of its own',
      'case on-field: rules nowhere/inline: no pattern nowhere',
      'case on-action: rules other/one-rule: other is not a domain of Foundation (kind foundation)',
      'case on-action: rules older/x: older was renamed other',
    ]);
    expect(errors.get('spacing')).toEqual([
      'case inset: rules spacing/inline: a domain does not cite its own rules',
    ]);
  });

  test('the answer cites the rules of its case, then those of its pattern, each once', () => {
    const one = small({
      cases: [
        {
          id: 'on-field',
          about: 'field',
          where: 'w',
          rules: ['spacing/inset', 'spacing/nope', 'spacing/ladder'],
        },
        { id: 'on-action', about: 'action', where: 'w' },
        { id: 'ask', about: 'action', decision: 'needed', where: 'w' },
      ],
      'always-true': [
        { id: 'one-rule', rule: 'A rule.', 'checked-by': 'review' },
        { id: 'ladder', from: 'spacing' },
        { id: 'kept', from: 'other' },
      ],
    });
    const other = small({
      id: 'other',
      'always-true': [{ id: 'kept', rule: 'K.', 'checked-by': 'review' }],
    });
    const all = [one, other, domain()];
    expect(rulesOfCase(one, one.cases![0]!, all)).toEqual([
      {
        id: 'inset',
        from: 'spacing',
        rule: 'p-md',
        serves: ['intuitive', 'flexible'],
        'carried-by': ['mds-banner'],
      },
      {
        id: 'ladder',
        from: 'spacing',
        rule: 'Only the steps of the ladder.',
        serves: 'intuitive',
        'checked-by': 'review',
      },
    ]);
    expect(rulesOfCase(one, one.cases![1]!, all).map((rule) => rule.id)).toEqual(['ladder']);
  });

  test('a component is governed by the rules it carries, now or once built, and the relations that write it', () => {
    const spacing = domain({
      cases: [
        { ...domain().cases![0]!, use: ['mds-button variant=primary'] },
        {
          ...domain().cases![1]!,
          'carried-by': ['mds-modal slot=window'],
          'carried-by-planned': ['mds-card'],
        },
      ],
      'always-true': [
        { ...domain()['always-true']![0]!, 'carried-by': ['mds-card'] },
        { id: 'inline', from: 'other' },
      ],
      components: ['mds-banner'],
    });
    const later = domain({ id: 'later', status: 'candidate' });
    const all = [small(), spacing, later];
    const ids = (tag: string) => rulesOfComponent(all, tag).map((one) => `${one.from}/${one.id}`);
    expect(ids('mds-button')).toEqual(['spacing/inline']);
    expect(ids('mds-modal')).toEqual(['spacing/inset']);
    expect(ids('mds-card')).toEqual(['spacing/inset', 'spacing/ladder']);
    // the components of a domain name what it speaks of, not what a rule governs
    expect(ids('mds-banner')).toEqual([]);
    expect(rulesOfComponent(all, 'mds-button')[0]).toMatchObject({
      rule: 'gap-md',
      use: ['mds-button variant=primary'],
    });
  });

  test('its generated sections say the principle each rule serves and what carries it', () => {
    const synced = syncBody(domain(), '# S\n\n## When to use it\n\nKept.\n');
    expect(synced).toContain('| Case | When | Where | Use | Serves | Carried by |');
    expect(synced).toContain(
      '| `inline` | relation: inline | gap-md |  | intuitive | `gap-md`; planned: gap-inline |',
    );
    expect(synced).toContain(
      '| `inset` | relation: inset | p-md |  | intuitive, flexible | `mds-banner` |',
    );
    expect(synced).toContain('| Id | Rule | Serves | Carried by | Checked by |');
    expect(synced).toContain(
      '| `ladder` | Only the steps of the ladder. | intuitive | the guide | review |',
    );
    expect(syncBody(domain(), synced)).toBe(synced);
  });
});

/** A decided building block small enough to read: one variable, a required region, two patterns that use it. */
const block = (over: Partial<Pattern> = {}): Pattern => ({
  id: 'head',
  kind: 'block',
  title: 'Head',
  group: 'navigation',
  layer: 'magma',
  status: 'decided',
  need: 'The person sees what the page is about.',
  principle: 'The head names the page.',
  keywords: ['head'],
  'validated-on': [],
  'used-by': ['small', 'other'],
  variables: { level: { values: ['top', 'nested'], means: 'where the page sits' } },
  regions: [
    { id: 'back', when: { level: 'nested' }, what: 'a link to the page above' },
    { id: 'title', required: true, what: 'the heading of the page' },
    { id: 'actions', what: 'the actions on the page' },
  ],
  'always-true': [{ id: 'one-h1', rule: 'The title is the only h1.', 'checked-by': 'review' }],
  situations: [
    { situation: 'A list', level: 'top' } as Situation,
    { situation: 'An item of the list', level: 'nested' } as Situation,
  ],
  ...over,
});
/** The two patterns the block comes back in, each naming it among its related. */
const users = () => [small({ related: ['head'] }), small({ id: 'other', related: ['head'] })];

describe('a building block', () => {
  test('a complete block has no error, and every combination shows a required region', () => {
    expect(formatErrors(file(block()))).toEqual([]);
    expect(coverage(block())).toEqual({ total: 2, none: [], conflicts: [], of: 'regions' });
    expect([...linkErrors([block(), ...users()])]).toEqual([]);
  });

  test('regions in place of cases; regions and used-by belong to a block', () => {
    expect(
      formatErrors(file(block({ cases: [{ id: 'a', where: 'w' }], gaps: [], regions: undefined }))),
    ).toEqual([
      'cases belongs to a pattern: a building block has regions, each saying when it shows',
      'gaps belongs to a pattern: a building block has regions, each saying when it shows',
      'regions is required, as a list',
    ]);
    expect(
      formatErrors(file(small({ regions: [{ id: 'a', what: 'w' }], 'used-by': ['x'] }))),
    ).toEqual([
      'regions belongs to a building block (kind block)',
      'used-by belongs to a building block (kind block)',
    ]);
  });

  test('a region has an id, what goes in it, a when on the variables; one is required at least', () => {
    const errors = formatErrors(
      file(
        block({
          regions: [
            { id: 'back', when: { level: 'deep', side: 'left' }, what: 'w', use: ['button'] },
            { id: 'back', what: '', required: 'yes' as unknown as boolean, colour: 'red' } as never,
          ],
        }),
      ),
    );
    expect(errors).toEqual([
      'region back: use "button" is not "mds-tag attribute=value ..."',
      'region back: level is one of top, nested, not deep',
      'region back: when names side, which is not a variable',
      'region back: unknown field colour',
      'region back: the id is used twice',
      'region back: what is required: what goes in it',
      'region back: required is true or false',
      'a building block has a required region at least: what makes it the block',
    ]);
  });

  test('every combination shows a required region', () => {
    const one = block({
      regions: [{ id: 'back', when: { level: 'nested' }, required: true, what: 'w' }],
    });
    const covered = coverage(one);
    expect(covered.none).toEqual([{ level: 'top' }]);
    expect(coverageErrors(covered)).toEqual([
      '1 of 2 combinations show no required region, such as:\n    level=top',
    ]);
  });

  test('used-by names two patterns at least, each defined and naming the block among its related', () => {
    expect(formatErrors(file(block({ 'used-by': ['small', 'small'] })))).toEqual([
      'used-by names the patterns the block comes back in, 2 at least: a section becomes a block when it comes back',
    ]);
    const errors = linkErrors([
      block({ 'used-by': ['small', 'other', 'missing', 'spacing', 'later'] }),
      small({ related: ['head'] }),
      small({ id: 'other' }),
      domain(),
      {
        id: 'later',
        kind: 'pattern',
        title: 'L',
        group: 'data',
        layer: 'magma',
        status: 'candidate',
        need: 'n',
      },
    ]);
    expect(errors.get('head')).toEqual([
      'used-by: other does not name head among its related',
      'used-by: no pattern missing',
      'used-by: spacing is not a pattern (kind foundation)',
      'used-by: later is a candidate: it has no cases to use the block in',
    ]);
  });

  test('a situation gives every variable of the block, never a case', () => {
    expect(
      formatErrors(
        file(
          block({
            situations: [
              { situation: 'A list', case: 'title' },
              { situation: 'An item', level: 'deep' } as Situation,
              { situation: 'Members', use: 'small' },
            ],
          }),
        ),
      ),
    ).toEqual([
      'situation 1: a block has no cases: give the values of its variables',
      'situation 1: a situation of a block gives every variable; level missing',
      'situation 2: level is one of top, nested, not deep',
    ]);
  });

  test('the regions for a situation, and the ones that wait on a variable still unknown', () => {
    const ids = (list: { id: string }[]) => list.map((one) => one.id);
    const nested = regionsFor(block(), { level: 'nested' });
    expect(ids(nested.regions)).toEqual(['back', 'title', 'actions']);
    expect(nested.missing).toEqual([]);
    const open = regionsFor(block(), {});
    expect(ids(open.regions)).toEqual(['title', 'actions']);
    expect(ids(open.depends)).toEqual(['back']);
    expect(open.missing).toEqual(['level']);
    expect(() => regionsFor(block(), { level: 'deep' })).toThrow(
      'level of head is one of top, nested, not deep.',
    );
  });

  test('a component of a region exists in the release, and is among the components', () => {
    const components = loadComponents({ documentation: data.documentation });
    const one = block({
      components: ['mds-button'],
      regions: [
        { id: 'title', required: true, what: 'w', use: ['mds-text'] },
        { id: 'actions', what: 'w', use: ['mds-button tone=nope'] },
      ],
    });
    expect(componentErrors(one, components)).toEqual([
      'region title: mds-text is missing from components',
      expect.stringMatching(/^region actions: tone of mds-button is one of .*, not nope$/),
    ]);
  });

  test('its body has Regions and Layout where a pattern has Cases, Parts and Behaviour over time', () => {
    const body = [
      '',
      '# Head',
      '',
      '## When to use it',
      '',
      'At the top.',
      '',
      '## What decides it',
      '',
      'Where the page sits.',
      '',
      '## Layout',
      '',
      'The way back first.',
      '',
      '## Decisions',
      '',
      '| Date | Decision | Why |',
      '',
    ].join('\n');
    const synced = syncBody(block(), body);
    expect(synced).toContain('## Regions');
    expect(synced).not.toContain('## Cases');
    expect(synced.indexOf('## Regions')).toBeLessThan(synced.indexOf('## Layout'));
    expect(synced).toContain('| `back` | level: nested |  | a link to the page above |  |');
    expect(synced).toContain('| `title` | any | yes | the heading of the page |  |');
    expect(synced).toContain('| An item of the list | `back`, `title`, `actions` |');
    expect(bodyErrors(block(), synced)).toEqual([]);
    const wrong = synced.replace('## Layout', '## Parts');
    expect(bodyErrors(block(), wrong)).toEqual([
      'the body has no section Layout',
      'section Parts is not one of a building block: When to use it, What decides it, Regions, Layout, Always true, Open choices, Situations, Accessibility, Content, Magma gaps, Decisions',
    ]);
  });

  test('a layer of a block gives its situations by the variables, and narrows no rule', () => {
    const layer = (over: Partial<Layer>): PatternFile<Layer> => ({
      file: 'head.md',
      data: { id: 'head', extends: 'magma:head', layer: 'shop', ...over },
      body: '',
    });
    expect(
      layerErrors(layer({ situations: [{ situation: 'Orders', level: 'top' } as Situation] }), [
        block(),
      ]),
    ).toEqual([]);
    expect(
      layerErrors(
        layer({
          narrows: { 'one-h1': false },
          situations: [{ situation: 'Orders', case: 'title' }],
        }),
        [block()],
      ),
    ).toEqual([
      'narrows one-h1: an "Always true" rule holds in every product, a layer cannot change it',
      'situation 1: a block has no cases: give the values of its variables',
      'situation 1: a situation of a block gives every variable; level missing',
    ]);
  });

  test('the list puts it between the domains and the patterns; it has no previews yet', () => {
    expect(listPatterns([small(), block(), domain()]).map((one) => one.kind)).toEqual([
      'foundation',
      'block',
      'pattern',
    ]);
    expect(missingPreviews([block()], [])).toEqual([]);
    const preview = parsePreview(
      '<!--\ntry: Look.\n-->\n<mds-text>x</mds-text>\n',
      'previews/head/title.html',
    );
    expect([...previewLinkErrors([preview], [block()]).values()]).toEqual([
      ['head is a building block: whether a block gets previews is still open (#1210)'],
    ]);
  });
});

describe('the cases', () => {
  test('a variable left out means any value, decision none', () => {
    // on-action leaves decision out: it holds when there is no decision to make
    expect(coverage(small())).toEqual({ total: 4, none: [], conflicts: [] });
    const conflict = coverage(
      small({ cases: [...small().cases!, { id: 'again', about: 'action', where: 'w' }] }),
    );
    expect(conflict.conflicts).toEqual([
      { combo: { about: 'action', decision: 'none' }, cases: ['on-action', 'again'] },
    ]);
  });

  test('a list of values means any of them', () => {
    const one = small({
      cases: [
        { id: 'both', about: ['field', 'action'], where: 'w' },
        { id: 'ask', about: 'action', decision: 'needed', where: 'd' },
      ],
    });
    expect(coverage(one).none).toEqual([]);
  });

  test('a combination with no entry is reported', () => {
    expect(coverage(small({ 'not-applicable': [] })).none).toEqual([
      { about: 'field', decision: 'needed' },
    ]);
  });

  test('a gap or a not-applicable entry may overlap a case', () => {
    const one = small({ status: 'draft', gaps: [{ about: 'field', note: 'what of a field?' }] });
    expect(coverage(one).conflicts).toEqual([]);
  });

  test('the answer for a situation: one case, or what is still to know', () => {
    const one = small();
    expect(answer(one, { about: 'action' })).toEqual({
      hits: [{ kind: 'case', entry: one.cases![1] }],
      missing: [],
    });
    expect(answer(one, { about: 'field', decision: 'needed' }).hits).toEqual([
      { kind: 'not-applicable', entry: one['not-applicable']![0] },
    ]);
    const open = answer(one, { decision: 'needed' });
    expect(open.missing).toEqual(['about']);
    expect(open.hits.map((hit) => hit.kind)).toEqual(['case', 'not-applicable']);
    expect(() => answer(one, { topic: 'x' })).toThrow('small has no variable topic');
    expect(() => answer(one, { about: 'page' })).toThrow(
      'about of small is one of field, action, not page',
    );
  });
});

describe('the data of the release', () => {
  const components = loadComponents({ documentation: data.documentation });

  test('every component and attribute named exists, with a value it takes', () => {
    const one = small({
      components: ['mds-banner', 'mds-button', 'mds-nope'],
      cases: [
        {
          id: 'a',
          about: 'field',
          where: 'w',
          use: ['mds-banner variant=error slot=action aria-label=x'],
        },
        {
          id: 'b',
          about: 'action',
          where: 'w',
          use: ['mds-banner variant=nope', 'mds-button await=yes size'],
        },
        { id: 'c', decision: 'needed', where: 'w', use: ['mds-text', 'mds-banner colour=red'] },
      ],
    });
    expect(componentErrors(one, components)).toEqual([
      'components: mds-nope is not a component of this release',
      'case b: variant of mds-banner is one of ai, dark, error, info, light, primary, success, warning, not nope',
      'case b: await of mds-button is a boolean: write it bare',
      'case c: mds-text is missing from components',
      'case c: mds-banner has no attribute colour',
    ]);
  });

  test('a lint rule exists, a planned one does not yet', () => {
    const one = small({
      'always-true': [
        { id: 'a', rule: 'A.', 'checked-by': 'lint', lint: 'magma/no-false-boolean' },
        { id: 'b', rule: 'B.', 'checked-by': 'lint', lint: 'magma/nope' },
        { id: 'c', rule: 'C.', 'checked-by': 'review', 'lint-planned': 'magma/no-false-boolean' },
      ],
    });
    expect(lintErrors(one, new Set(['magma/no-false-boolean']))).toEqual([
      'always-true b: the lint has no rule magma/nope',
      'always-true c: magma/no-false-boolean exists now: checked-by lint, lint magma/no-false-boolean',
    ]);
  });
});

describe('the links', () => {
  test('an id cited must exist, and never an old one', () => {
    const other = small({
      id: 'other',
      aliases: ['older'],
      'always-true': [{ id: 'kept', rule: 'K.', 'checked-by': 'review' }],
    });
    const one = small({
      related: ['other', 'older', 'nowhere'],
      'not-for': [{ need: 'n', use: 'nowhere' }],
      cases: [
        { id: 'on-field', about: 'field', where: 'w', see: 'on-action' },
        { id: 'on-action', about: 'action', where: 'w', see: 'other' },
      ],
      situations: [
        { situation: 'S', case: 'missing' },
        { situation: 'T', use: 'older' },
      ],
      'always-true': [
        { id: 'kept', from: 'other' },
        { id: 'lost', from: 'other' },
      ],
    });
    expect(linkErrors([one, other]).get('small')).toEqual([
      'related: older was renamed other',
      'related: no pattern nowhere',
      'not-for: no pattern nowhere',
      'situation "S": no case missing',
      'situation "T": older was renamed other',
      'always-true lost: other has no rule lost of its own',
    ]);
  });
});

describe('a product layer', () => {
  const sources = readPatternDir(SOURCES).map((one) => one.data);
  const layer = parsePatternFile<Layer>(readFileSync(LAYER, 'utf8'), LAYER);

  test('narrows the open choices and adds situations', () => {
    expect(layerErrors(layer, sources)).toEqual([]);
    const placement = sources.find((one) => one.id === 'message-placement')!;
    const resolved = resolveLayer(placement, layer.data);
    expect(resolved.layers).toEqual(['magma', 'example-backoffice']);
    expect(resolved['open-choices']![0]).toMatchObject({
      id: 'success-toast-duration',
      value: 8000,
      'narrowed-by': 'example-backoffice',
    });
    expect(resolved.situations!.at(-1)).toMatchObject({ layer: 'example-backoffice' });
    // the rules stay the ones of Magma
    expect(resolved['always-true']).toEqual(placement['always-true']);
  });

  test('never narrows an "Always true" rule, nor what the pattern does not leave open', () => {
    const bad = {
      ...layer,
      data: { ...layer.data, narrows: { 'toast-action-stays': false, colour: 'red' } },
    };
    expect(layerErrors(bad, sources)).toEqual([
      'narrows toast-action-stays: an "Always true" rule holds in every product, a layer cannot change it',
      'narrows colour: message-placement has no open choice colour (success-toast-duration, message-wording)',
    ]);
  });

  test('extends a pattern Magma has, by its current id', () => {
    const renamed = [{ ...sources[0]!, aliases: ['old-name'] }];
    expect(
      layerErrors({ ...layer, data: { ...layer.data, extends: 'magma:old-name' } }, renamed),
    ).toEqual([`old-name was renamed ${sources[0]!.id}`]);
    expect(layerErrors({ ...layer, data: { ...layer.data, extends: 'mindy:x' } }, sources)).toEqual(
      ['extends is magma:<id>'],
    );
    const candidate = {
      ...layer.data,
      extends: 'magma:notification-center',
      id: 'notification-center',
    };
    expect(layerErrors({ ...layer, data: candidate }, sources)).toContain(
      'notification-center is a candidate: there is nothing to narrow yet',
    );
  });
});

describe("a product's folder", () => {
  const sources = readPatternDir(SOURCES).map((one) => one.data);
  const layer = parsePatternFile<Layer>(readFileSync(LAYER, 'utf8'), LAYER);
  const components = loadComponents({ documentation: data.documentation });
  const own = (over: Partial<Pattern> = {}): PatternFile =>
    file(small({ id: 'own-small', layer: 'example-backoffice', ...over }));

  test('a file that does not parse is kept with why, the others read', () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'magma-patterns-'));
    mkdirSync(dir, { recursive: true });
    writeFileSync(path.join(dir, 'broken.md'), '---\nid: [\n---\n');
    writeFileSync(path.join(dir, 'plain.md'), 'no frontmatter\n');
    writeFileSync(path.join(dir, 'message-placement.md'), readFileSync(LAYER, 'utf8'));
    const { files, unreadable } = readProjectDir(dir);
    expect(files.map((one) => one.data.id)).toEqual(['message-placement']);
    expect([...unreadable.keys()].map((one) => path.basename(one))).toEqual([
      'broken.md',
      'plain.md',
    ]);
    expect(unreadable.get(path.join(dir, 'plain.md'))).toBe(
      'not read: no frontmatter between two --- lines at the top',
    );
    expect(readProjectDir(path.join(dir, 'missing'))).toEqual({
      files: [],
      unreadable: new Map(),
    });
  });

  test('a good layer and a good pattern of its own say nothing', () => {
    const files = [layer, own({ components: [] })];
    expect(projectErrors(files, sources, components)).toEqual(new Map());
  });

  test('one layer per pattern: the second file is the wrong one', () => {
    const again = { ...layer, file: '/p/magma/patterns/placement-again.md' };
    expect(projectErrors([layer, again], sources)).toEqual(
      new Map([
        [again.file, ['message-placement.md extends message-placement too: one layer per pattern']],
      ]),
    );
  });

  test('a pattern of its own holds to the format, the cases, the components and the links', () => {
    const bad = own({
      components: ['mds-banner'],
      cases: [
        {
          id: 'on-field',
          about: 'field',
          where: 'under the field',
          use: ['mds-banner loudness=high'],
        },
        { id: 'ask', about: 'action', decision: 'needed', where: 'a dialog', see: 'nowhere' },
      ],
    });
    expect(projectErrors([bad], sources, components).get(bad.file)).toEqual([
      '1 of 4 combinations have no case, gap or not-applicable entry, such as:\n    about=action decision=none',
      'case on-field: mds-banner has no attribute loudness',
      'case ask: see: no pattern nowhere',
    ]);
  });

  test('never under an id Magma has, nor in the layer of Magma', () => {
    const taken = own({ id: 'message-placement', layer: 'magma' });
    expect(projectErrors([taken], sources).get(taken.file)).toEqual([
      'Magma has a pattern message-placement: extend it (extends: magma:message-placement)',
      'layer is the name of the product',
    ]);
  });
});

describe('the body', () => {
  test('the generated sections are written from the frontmatter, the others kept', () => {
    const body = '# Old\n\n**Old.**\n\n## When to use it\n\nKept.\n\n## Decisions\n\nKept too.\n';
    const synced = syncBody(small(), body);
    expect(synced).toMatch(
      /^\n# Small\n\n\*\*A principle\.\*\*\n\n## When to use it\n\nKept\.\n\n## Cases\n/,
    );
    expect(synced.indexOf('## Open choices')).toBeLessThan(synced.indexOf('## Situations'));
    expect(synced).toMatch(/\| `on-action` \| about: action \| a toast \|/);
    expect(synced).toMatch(/## Decisions\n\nKept too\.\n$/);
    // run again, nothing changes
    expect(syncBody(small(), synced)).toBe(synced);
    expect(bodyErrors(small(), synced)).toEqual(['the body has no section What decides it']);
    expect(bodyErrors(small({ principle: 'Another.' }), synced)).toContain(
      'the title, the principle or a generated section (Cases, Always true, Open choices, Situations) is out of date: nx run stencil:generate.pattern -- --sync',
    );
  });

  test('the rules a case names get a column once one case names them', () => {
    expect(syncBody(small(), '# S\n')).toContain('| Case | When | Where | Use |\n');
    const one = small({
      cases: [
        { id: 'on-field', about: 'field', where: 'w', rules: ['spacing/inline', 'spacing/ladder'] },
        { id: 'on-action', about: 'action', where: 'w' },
        { id: 'ask', about: 'action', decision: 'needed', where: 'w' },
      ],
    });
    const synced = syncBody(one, '# S\n');
    expect(synced).toContain('| Case | When | Where | Use | Rules |');
    expect(synced).toContain(
      '| `on-field` | about: field | w |  | `spacing/inline`, `spacing/ladder` |',
    );
    expect(synced).toContain('| `on-action` | about: action | w |  |  |');
  });

  test('a pattern with no open choice has no section for them', () => {
    const synced = syncBody(small({ 'open-choices': [] }), '# S\n\n## Open choices\n\nOld.\n');
    expect(synced).not.toMatch(/Open choices/);
  });
});

describe('the previews of the cases', () => {
  const stage = (head: string, markup = '<mds-button>Salva</mds-button>') =>
    parsePreview(`${head}\n${markup}\n`, '/p/previews/small/on-field.html');

  test('a preview is its keys and a stage, named after its pattern and case', () => {
    const preview = stage('<!--\ntry: Press Salva.\nheight: 260\n-->');
    expect(preview).toMatchObject({
      pattern: 'small',
      case: 'on-field',
      try: 'Press Salva.',
      height: 260,
      errors: [],
    });
    expect(preview.markup).toBe('<mds-button>Salva</mds-button>\n');
  });

  test('what to try is required, every key known, the height in range', () => {
    expect(stage('<mds-text>No comment</mds-text>', '').errors).toEqual([
      'it opens with a comment of keys: try, height (docs/PATTERNS.md)',
    ]);
    expect(stage('<!--\nheight: 260\n-->').errors).toEqual([
      'try is required: what to do in the preview, or what to look at',
    ]);
    expect(stage('<!--\ntry: Look.\nplay: #save\nwhy not\n-->').errors).toEqual([
      'play is not a key of a preview: try, height',
      '"why not" in the opening comment is not a key: value line',
    ]);
    const low = stage('<!--\ntry: Look.\nheight: 90\n-->');
    expect(low.errors).toEqual(['height is a whole number of pixels, 120 to 2000']);
    expect(low.height).toBeUndefined();
  });

  test('only a stage: no page, no script that loads, nothing from outside', () => {
    const head = '<!--\ntry: Look.\n-->';
    expect(stage(head, '').errors).toEqual(['the stage is empty']);
    expect(stage(head, '<link rel="stylesheet" href="a.css"><style>p {}</style>').errors).toEqual([
      '<link> belongs to the page around the stage: a preview is only the stage',
      '<style> belongs to the page around the stage: a preview is only the stage',
    ]);
    expect(stage(head, '<script type="module" src="./loader.js"></script>').errors).toEqual([
      'a script with src: the page around the stage loads Magma, a preview loads nothing',
    ]);
    expect(
      stage(head, '<img src="https://example.com/a.png"><script>import("//cdn.x/y.js")</script>')
        .errors,
    ).toEqual([
      'https://example.com/a.png is outside the preview: a stage loads nothing',
      '//cdn.x/y.js is outside the preview: a stage loads nothing',
    ]);
  });

  test('each preview shows a case that exists; the cases without one are listed', () => {
    const at = (name: string) =>
      parsePreview('<!--\ntry: Look.\n-->\n<mds-text>A</mds-text>', `/p/previews/${name}.html`);
    const previews = [at('small/on-field'), at('small/gone'), at('old/on-field'), at('later/x')];
    const patterns = [
      small({ aliases: ['old'] }),
      small({ id: 'later', status: 'candidate', cases: [] }),
    ];
    expect([...previewLinkErrors(previews, patterns)]).toEqual([
      [
        '/p/previews/small/gone.html',
        ['small has no case gone: its cases are on-field, on-action, ask'],
      ],
      ['/p/previews/old/on-field.html', ['old is an old id of small: move the folder']],
      ['/p/previews/later/x.html', ['later is a candidate: it has no cases to show']],
    ]);
    expect(missingPreviews(patterns, previews)).toEqual(['small/on-action', 'small/ask']);
    // a domain of Foundation is listed by nobody: whether its relations get a preview is open
    expect(missingPreviews([domain()], [])).toEqual([]);
  });

  test('the previews Magma ships are clean, each of a case', () => {
    const previews = readPreviews(SOURCES);
    expect(previews.length).toBeGreaterThan(0);
    expect(previews.flatMap((one) => one.errors.map((error) => `${one.file}: ${error}`))).toEqual(
      [],
    );
    expect([
      ...previewLinkErrors(
        previews,
        readPatternDir(SOURCES).map((one) => one.data),
      ),
    ]).toEqual([]);
  });

  test('a folder with no previews has none', () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'magma-previews-'));
    expect(readPreviews(dir)).toEqual([]);
    mkdirSync(path.join(dir, 'previews/small'), { recursive: true });
    writeFileSync(path.join(dir, 'previews/small/notes.md'), 'not a preview');
    expect(readPreviews(dir)).toEqual([]);
  });
});
