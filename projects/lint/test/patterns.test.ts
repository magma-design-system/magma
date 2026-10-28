// The patterns core (#1174): the format, the coverage of the cases, the links, the layers, the
// answer for a situation and the generated body, on the patterns Magma ships and on small ones
// written here to break one rule each.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, test } from 'vitest';

import { loadComponents } from '../src/core/data.js';
import {
  answer,
  bodyErrors,
  componentErrors,
  coverage,
  formatErrors,
  layerErrors,
  linkErrors,
  lintErrors,
  listPatterns,
  parsePatternFile,
  parseUse,
  readPatternDir,
  resolveLayer,
  syncBody,
  type Layer,
  type Pattern,
  type PatternFile,
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

  test('the five of Messages and states are decided, their candidates cited', () => {
    expect(
      listPatterns(patterns)
        .filter((one) => one.status === 'decided')
        .map((one) => one.id),
    ).toEqual(['confirm-action', 'empty-state', 'error-recovery', 'loading', 'message-placement']);
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

  test('a pattern with no open choice has no section for them', () => {
    const synced = syncBody(small({ 'open-choices': [] }), '# S\n\n## Open choices\n\nOld.\n');
    expect(synced).not.toMatch(/Open choices/);
  });
});
