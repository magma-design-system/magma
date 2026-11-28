// The need and the place of a component (epic #1579): the usage files 4 and 5 read as data, on
// small files written here to break one rule each and on the files the components ship.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, test } from 'vitest';

import { readPatternDir, type Pattern } from '../src/core/patterns.js';
import {
  answersOf,
  citationsOf,
  inlineCodes,
  parsePlacement,
  parseWhenToUse,
  placesOfComponent,
  PLACEMENT_HEADINGS,
  resolveCitation,
  WHEN_TO_USE_HEADINGS,
} from '../src/core/usage.js';

const COMPONENTS = path.join(import.meta.dirname, '../../stencil/src/components');
const PATTERNS = path.join(import.meta.dirname, '../../../docs/agents/patterns');
const patterns = readPatternDir<Pattern>(PATTERNS).map(({ data }) => data);

const whenToUse = [
  '#### Use it for',
  '',
  '- The person must switch between groups of content, one at a time.',
  '- The person must move between a few pages, every item with `href`.',
  '',
  '#### Not for',
  '',
  '- Steps done once, in a fixed order: `mds-stepper-bar`.',
  '- One value in a form (a role): `mds-input-switch` with `type="radio"`.',
  '- Confirming an action: `confirm-action`, or `gap` when it lasts: `mds-modal`.',
  '- A filter: `list-with-filters`, the fields (`mds-input-select`), `mds-input-select` again.',
  '',
].join('\n');

describe('parseWhenToUse', () => {
  const parsed = parseWhenToUse(whenToUse);

  test('reads the needs of each heading, one line each, with their line in the file', () => {
    expect(parsed.problems).toEqual([]);
    expect(parsed.useFor.map((one) => one.line)).toEqual([3, 4]);
    expect(parsed.useFor[1]).toEqual({
      line: 4,
      text: 'The person must move between a few pages, every item with `href`.',
      need: 'The person must move between a few pages, every item with `href`.',
      codes: ['href'],
    });
  });

  test('splits a Not for line at its first ": ", the code after it the candidates', () => {
    expect(parsed.notFor.map(({ need, codes }) => ({ need, codes }))).toEqual([
      { need: 'Steps done once, in a fixed order', codes: ['mds-stepper-bar'] },
      { need: 'One value in a form (a role)', codes: ['mds-input-switch', 'type="radio"'] },
      { need: 'Confirming an action', codes: ['confirm-action', 'gap', 'mds-modal'] },
      {
        need: 'A filter',
        codes: ['list-with-filters', 'mds-input-select', 'mds-input-select'],
      },
    ]);
  });

  test('wants both headings, in their order, each at level 4 and once', () => {
    expect(parseWhenToUse('#### Use it for\n\n- A need.\n').problems).toEqual([
      { line: 1, message: 'no "Not for" heading' },
    ]);
    const swapped = parseWhenToUse('#### Not for\n\n- A: `gap`\n\n#### Use it for\n\n- A need.\n');
    expect(swapped.problems.map((one) => one.message)).toEqual([
      '"Use it for" is out of order: "Use it for", "Not for"',
    ]);
    expect(
      parseWhenToUse('### Use it for\n\n- A need.\n\n#### Not for\n\n- A: `gap`\n').problems,
    ).toEqual([{ line: 1, message: '"Use it for" is a heading of level 4, ####' }]);
    expect(
      parseWhenToUse(
        '#### Use it for\n\n- A.\n\n#### Use it for\n\n- B.\n\n#### Not for\n\n- C: `gap`\n',
      ).problems,
    ).toEqual([{ line: 5, message: '"Use it for" comes twice' }]);
  });

  test('names a heading of another file, text that is not a list item and an empty section', () => {
    // the items under a heading that is refused are left out: the heading says the problem
    const md = [
      'An intro.',
      '#### Use it for',
      '',
      'A paragraph.',
      '- A need',
      '  that goes on.',
      '  - a nested one',
      '',
      '#### When',
      '',
      '- A thing.',
      '',
      '#### Not for',
      '',
    ].join('\n');
    expect(parseWhenToUse(md).problems).toEqual([
      { line: 1, message: 'text outside the sections: "An intro."' },
      { line: 4, message: 'not a list item of its own, one line each: "A paragraph."' },
      { line: 6, message: 'not a list item of its own, one line each: "that goes on."' },
      { line: 7, message: 'not a list item of its own, one line each: "- a nested one"' },
      { line: 9, message: '"When" is not a heading of 4. When to use.md: "Use it for", "Not for"' },
      { line: 13, message: '"Not for" has no item' },
    ]);
  });

  test('names a Not for line with no colon, which has no candidate then', () => {
    const parsed = parseWhenToUse('#### Use it for\n\n- A.\n\n#### Not for\n\n- B `mds-tab`\n');
    expect(parsed.problems).toEqual([
      { line: 7, message: 'no ": " between the need and what answers it' },
    ]);
    expect(parsed.notFor[0]).toMatchObject({ need: 'B `mds-tab`', codes: [] });
  });
});

describe('answersOf', () => {
  const known = {
    tags: new Set(['mds-stepper-bar', 'mds-input-switch', 'mds-input-select', 'mds-modal']),
    patterns: new Set(['confirm-action', 'list-with-filters']),
  };
  const { notFor } = parseWhenToUse(whenToUse);

  test('keeps the components, the patterns and gap, each once, in the order of the line', () => {
    expect(notFor.map((line) => answersOf(line, known))).toEqual([
      [{ kind: 'component', id: 'mds-stepper-bar' }],
      [{ kind: 'component', id: 'mds-input-switch' }],
      [
        { kind: 'pattern', id: 'confirm-action' },
        { kind: 'gap', id: 'gap' },
        { kind: 'component', id: 'mds-modal' },
      ],
      [
        { kind: 'pattern', id: 'list-with-filters' },
        { kind: 'component', id: 'mds-input-select' },
      ],
    ]);
  });

  test('takes no attribute, value or name the release does not know for an answer', () => {
    expect(
      answersOf({ codes: ['href', 'type="radio"', 'mds-nothing', 'no-pattern'] }, known),
    ).toEqual([]);
  });
});

describe('parsePlacement', () => {
  test('reads up to five sections in their order, each a list', () => {
    const parsed = parsePlacement(
      '#### Where it goes\n\n- Under the title (`widths/form`).\n\n#### Narrow screens\n\n- It scrolls.\n',
    );
    expect(parsed.problems).toEqual([]);
    expect(parsed.sections).toEqual([
      {
        heading: 'Where it goes',
        line: 1,
        lines: [
          {
            line: 3,
            text: 'Under the title (`widths/form`).',
            need: 'Under the title (`widths/form`).',
            codes: ['widths/form'],
          },
        ],
      },
      {
        heading: 'Narrow screens',
        line: 5,
        lines: [{ line: 7, text: 'It scrolls.', need: 'It scrolls.', codes: [] }],
      },
    ]);
  });

  test('names a heading out of order, unknown or written by hand where the build writes it', () => {
    const md = [
      '#### Around it',
      '- A title.',
      '#### Where it goes',
      '- Under the title.',
      '#### Next to it',
      '- A thing.',
      '#### In the patterns',
      '- confirm-action, ask-first: a dialog.',
    ].join('\n');
    expect(parsePlacement(md).problems.map((one) => [one.line, one.message])).toEqual([
      [3, `"Where it goes" is out of order: ${PLACEMENT_HEADINGS.map((h) => `"${h}"`).join(', ')}`],
      [
        5,
        `"Next to it" is not a heading of 5. Placement context.md: ${PLACEMENT_HEADINGS.map((h) => `"${h}"`).join(', ')}`,
      ],
      [7, '"In the patterns" is written by the build from the cases of the patterns, not by hand'],
    ]);
  });
});

describe('citations', () => {
  test('reads `pattern/id` in the code of a line, never an icon slug or a longer path', () => {
    expect(
      citationsOf({ codes: ['actions/order', 'mdi/home', 'mi/baseline/close', 'href', 'a/b/c'] }),
    ).toEqual([{ from: 'actions', id: 'order' }]);
    expect(inlineCodes('a `x` and ` y ` b')).toEqual(['x', 'y']);
  });

  test('resolves a rule of its own, a case and a region of a block, never a rule it cites', () => {
    expect(resolveCitation(patterns, 'actions', 'order')).toMatchObject({ kind: 'rule' });
    expect(resolveCitation(patterns, 'widths', 'dialog')).toMatchObject({ kind: 'case' });
    expect(resolveCitation(patterns, 'item-list', 'filters')).toMatchObject({ kind: 'region' });
    expect(resolveCitation(patterns, 'actions', 'nothing')).toBeUndefined();
    expect(resolveCitation(patterns, 'nothing', 'order')).toBeUndefined();
    const cited = patterns.find((one) =>
      (one['always-true'] ?? []).some((rule) => rule.from !== undefined),
    )!;
    const rule = cited['always-true']!.find((one) => one.from !== undefined)!;
    expect(resolveCitation(patterns, cited.id, rule.id)?.kind).not.toBe('rule');
  });
});

describe('placesOfComponent', () => {
  test('gives the cases and the regions that write the tag, by pattern, never a domain', () => {
    const places = placesOfComponent(patterns, 'mds-filter');
    expect(places.map((one) => `${one.pattern}/${one.id}`)).toEqual([
      'item-list/filters',
      'list-with-filters/find-and-open',
    ]);
    expect(places[1]!.roles).toEqual(['the statuses, one at a time']);
    expect(places[0]!.roles).toEqual([]);
    // mds-filter-item is another component
    expect(placesOfComponent(patterns, 'mds-modal').map((one) => one.pattern)).not.toContain(
      'surfaces',
    );
  });
});

describe('the files the components ship', () => {
  const files = readdirSync(COMPONENTS).flatMap((tag) =>
    ['4. When to use.md', '5. Placement context.md']
      .map((name) => path.join(COMPONENTS, tag, 'usage', name))
      .filter(existsSync),
  );

  test('read with no problem, on the headings of the format', () => {
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      const text = readFileSync(file, 'utf8');
      const parsed = file.endsWith('4. When to use.md')
        ? parseWhenToUse(text)
        : parsePlacement(text);
      expect(parsed.problems, file).toEqual([]);
    }
    expect(WHEN_TO_USE_HEADINGS).toEqual(['Use it for', 'Not for']);
  });
});
