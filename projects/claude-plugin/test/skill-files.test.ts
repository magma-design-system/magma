import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, test } from 'vitest';
import {
  categoriesOf,
  categoryOf,
  commonRules,
  filesUnder,
  needsByCategory,
  needTable,
  taxonomyOf,
  templateTargets,
  writtenList,
  writtenSentence,
  type NeedFile,
  type Taxonomy,
} from '../scripts/skill-files.js';

const folders: string[] = [];

const folderWith = (files: string[]) => {
  const dir = mkdtempSync(path.join(tmpdir(), 'skill-files-'));
  folders.push(dir);
  for (const file of files) {
    mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
    writeFileSync(path.join(dir, file), '');
  }
  return dir;
};

afterEach(() => {
  for (const dir of folders.splice(0)) rmSync(dir, { recursive: true, force: true });
});

describe('filesUnder', () => {
  test('lists the files of every depth, sorted, with forward slashes, and no folder', () => {
    const dir = folderWith(['ui/references/show.md', 'ui.md', 'ui/references/compose.md']);
    expect(filesUnder(dir)).toEqual(['ui.md', 'ui/references/compose.md', 'ui/references/show.md']);
  });
});

describe('templateTargets', () => {
  test('a template is the SKILL.md of its skill, a file of its folder the same file in the skill', () => {
    const dir = folderWith(['review.md', 'ui.md', 'ui/references/compose.md']);
    expect(templateTargets(dir)).toEqual([
      { template: 'review.md', target: 'review/SKILL.md' },
      { template: 'ui.md', target: 'ui/SKILL.md' },
      { template: 'ui/references/compose.md', target: 'ui/references/compose.md' },
    ]);
  });

  test('a folder without the template of its skill stops the build', () => {
    expect(() => templateTargets(folderWith(['ui/references/compose.md']))).toThrow(
      'templates/ui/references/compose.md: no templates/ui.md for its skill',
    );
  });

  test('two templates that write the same file stop the build', () => {
    expect(() => templateTargets(folderWith(['ui.md', 'ui/SKILL.md']))).toThrow(
      'templates/ui/SKILL.md: another template writes skills/ui/SKILL.md',
    );
  });

  test('a file that is not Markdown stops the build', () => {
    expect(() => templateTargets(folderWith(['ui.md', 'ui/run.sh']))).toThrow(
      'templates/ui/run.sh: not a Markdown template',
    );
  });
});

describe('commonRules', () => {
  const lint = new Set(['no-false-boolean', 'no-raw-color', 'no-raw-palette-classes']);
  const file = 'docs/agents/mistakes.md';

  test('takes the rule in bold of each item, on one line, without its links', () => {
    const guide = [
      '# Mistakes',
      '',
      '> Scope: every component.',
      '',
      '- **Use the [`mds-*` component](conventions.md), never the raw element it replaces**: a',
      '  `<button>` where `mds-button` exists.',
      '- **Listen to the documented `mds*` events**, not to the native ones.',
      '- **Keep the focus styles of Magma.**',
    ].join('\n');
    expect(commonRules(guide, lint, file)).toBe(
      [
        '- Use the `mds-*` component, never the raw element it replaces',
        '- Listen to the documented `mds*` events',
        '- Keep the focus styles of Magma',
      ].join('\n'),
    );
  });

  test('names the rules of the lint the item names, once each, as the ones that catch it', () => {
    const guide = [
      '- **Paint with the roles**: `magma/no-raw-palette-classes` catches a palette class,',
      '  `magma/no-raw-color` a literal colour; `magma/no-raw-color` also reads CSS.',
    ].join('\n');
    expect(commonRules(guide, lint, file)).toBe(
      '- Paint with the roles (lint: `magma/no-raw-palette-classes`, `magma/no-raw-color`)',
    );
  });

  test('an item without its rule in bold stops the build', () => {
    expect(() => commonRules('- Setting a boolean to "false".', lint, file)).toThrow(
      'docs/agents/mistakes.md: the item "Setting a boolean to "false"...." does not open with its rule in bold',
    );
  });

  test('an item naming a rule the lint does not have stops the build', () => {
    expect(() =>
      commonRules('- **Name every control**: `magma/accessible-names`.', lint, file),
    ).toThrow(
      'docs/agents/mistakes.md: the item "Name every control" names magma/accessible-names, not a rule of the lint',
    );
  });

  test('a guide with no item stops the build', () => {
    expect(() => commonRules('# Mistakes\n\nNone yet.', lint, file)).toThrow(
      'docs/agents/mistakes.md: no item',
    );
  });
});

describe('categoriesOf', () => {
  const file = 'docs/COMPONENTS.md';

  test('reads the id and what it holds of each row of "Categories", in order', () => {
    const guide = [
      '# Components',
      '',
      '## Categories',
      '',
      'Every component sits in one category.',
      '',
      '| Category    | What it holds                    |',
      '| ----------- | -------------------------------- |',
      '| `actions`   | Controls that make something happen |',
      '| `forms`     | Fields that take a value         |',
      '',
      '## Component reference',
    ].join('\n');
    expect(categoriesOf(guide, file)).toEqual([
      { id: 'actions', holds: 'Controls that make something happen' },
      { id: 'forms', holds: 'Fields that take a value' },
    ]);
  });

  test('a guide without the section or its table stops the build', () => {
    expect(() => categoriesOf('# Components\n', file)).toThrow(
      'docs/COMPONENTS.md: no "## Categories" heading',
    );
    expect(() => categoriesOf('\n## Categories\n\nNone.\n\n## Next\n\n| a | b |\n', file)).toThrow(
      'docs/COMPONENTS.md: no table under "## Categories"',
    );
  });

  test('a row whose first cell is not an id in inline code stops the build', () => {
    const guide = '\n## Categories\n\n| Category | What |\n| --- | --- |\n| Actions | Controls |\n';
    expect(() => categoriesOf(guide, file)).toThrow('is not `<id>` | <what it holds>');
  });
});

describe('taxonomyOf and categoryOf', () => {
  const source = (jsdoc: string) =>
    `import { Component } from '@stencil/core';\n${jsdoc}\n@Component({ tag: 'mds-x', shadow: true })\nexport class MdsX {}\n`;

  test('reads @category and @parent from the comment of the class only', () => {
    expect(taxonomyOf(source('/**\n * @slot - Text\n * @category forms\n */'))).toEqual({
      category: 'forms',
      parents: [],
    });
    expect(taxonomyOf(source('/**\n * @parent mds-table-row mds-table-footer\n */'))).toEqual({
      category: undefined,
      parents: ['mds-table-row', 'mds-table-footer'],
    });
    expect(taxonomyOf(`/** @category forms */\nconst a = 1;\n${source('')}`)).toEqual({
      category: undefined,
      parents: [],
    });
  });

  test('a part takes the category of the component its first parent leads to', () => {
    const taxonomy = new Map<string, Taxonomy>([
      ['mds-table', { category: 'data', parents: [] }],
      ['mds-table-row', { parents: ['mds-table'] }],
      ['mds-table-cell', { parents: ['mds-table-row', 'mds-other'] }],
      ['mds-loop', { parents: ['mds-loop'] }],
    ]);
    expect(categoryOf('mds-table-cell', taxonomy)).toBe('data');
    expect(categoryOf('mds-loop', taxonomy)).toBeUndefined();
    expect(categoryOf('mds-missing', taxonomy)).toBeUndefined();
  });
});

describe('needsByCategory', () => {
  const categories = [
    { id: 'navigation', holds: 'Where the user is' },
    { id: 'tags', holds: 'Short markers' },
    { id: 'actions', holds: 'Controls' },
  ];
  const taxonomy = new Map<string, Taxonomy>([
    ['mds-tab', { category: 'navigation', parents: [] }],
    ['mds-stepper-bar', { category: 'navigation', parents: [] }],
    ['mds-chip', { category: 'tags', parents: [] }],
    ['mds-badge', { category: 'tags', parents: [] }],
    ['mds-button', { category: 'actions', parents: [] }],
  ]);
  const component = (id: string) => ({ kind: 'component' as const, id });
  const files = new Map<string, NeedFile>([
    [
      'mds-tab',
      {
        useFor: [{ text: 'The person must switch between [groups](a.md) of content | at once.' }],
        notFor: [
          // the stepper has its own file: its Use it for holds the need
          {
            need: 'Steps done once',
            answer: '`mds-stepper-bar`',
            answers: [component('mds-stepper-bar')],
          },
          {
            need: 'Starting an action',
            answer: '`mds-button`',
            answers: [component('mds-button')],
          },
          {
            need: 'The sections of the application',
            answer: '`app-shell`',
            answers: [{ kind: 'pattern', id: 'app-shell' }],
          },
          {
            need: 'A task list',
            answer: '`gap`, a task list',
            answers: [{ kind: 'gap', id: 'gap' }],
          },
        ],
      },
    ],
    [
      'mds-stepper-bar',
      {
        useFor: [{ text: 'The person must complete a task in steps' }],
        notFor: [
          {
            need: 'Starting an action',
            answer: '`mds-button`',
            answers: [component('mds-button')],
          },
        ],
      },
    ],
    [
      'mds-chip',
      {
        useFor: [{ text: 'The person must see a short piece of metadata' }],
        notFor: [
          {
            need: 'The status of a record',
            answer: '`mds-badge`',
            answers: [component('mds-badge')],
          },
          {
            need: 'Narrowing a list',
            answer: '`mds-tab` or `list-with-filters`',
            answers: [component('mds-tab'), { kind: 'pattern', id: 'list-with-filters' }],
          },
        ],
      },
    ],
  ]);

  test('every Use it for, and every Not for whose answer is not a component with its own file', () => {
    const tables = needsByCategory(files, taxonomy, categories);
    expect(tables.get('navigation')).toEqual({
      rows: [
        // the components in the order of their tags, then the patterns, then the gap
        { need: 'The person must complete a task in steps', use: '`mds-stepper-bar`' },
        { need: 'The person must switch between groups of content \\| at once', use: '`mds-tab`' },
        { need: 'Narrowing a list', use: '`mds-tab` or `list-with-filters`' },
        { need: 'The sections of the application', use: '`app-shell`' },
        { need: 'A task list', use: '`gap`, a task list' },
      ],
      written: ['mds-stepper-bar', 'mds-tab'],
    });
  });

  test('a Not for row goes to the category of the first component it names, once', () => {
    const tables = needsByCategory(files, taxonomy, categories);
    expect(tables.get('actions')).toEqual({
      rows: [{ need: 'Starting an action', use: '`mds-button`' }],
      written: [],
    });
    expect(tables.get('tags')!.rows).toEqual([
      { need: 'The status of a record', use: '`mds-badge`' },
      { need: 'The person must see a short piece of metadata', use: '`mds-chip`' },
    ]);
  });

  test('a file of a component with no category, or one outside the guide, stops the build', () => {
    const orphan = new Map([['mds-orphan', { useFor: [{ text: 'A need' }], notFor: [] }]]);
    expect(() =>
      needsByCategory(orphan, new Map([['mds-orphan', { parents: [] }]]), categories),
    ).toThrow(
      'mds-orphan/usage/4. When to use.md: mds-orphan has no @category, and no @parent that leads to one',
    );
    expect(() =>
      needsByCategory(
        orphan,
        new Map([['mds-orphan', { category: 'media', parents: [] }]]),
        categories,
      ),
    ).toThrow(
      'the category "media" of mds-orphan is not a row of "Categories" in docs/COMPONENTS.md',
    );
  });

  test('a Not for with no answer stops the build', () => {
    const none = new Map([
      ['mds-chip', { useFor: [], notFor: [{ need: 'Something', answer: 'nothing', answers: [] }] }],
    ]);
    expect(() => needsByCategory(none, taxonomy, categories)).toThrow(
      'mds-chip/usage/4. When to use.md: the Not for "Something" has no answer',
    );
  });
});

describe('the text around a table', () => {
  test('a table, or the sentence of a category with no row', () => {
    expect(needTable({ rows: [{ need: 'A need', use: '`mds-tab`' }], written: ['mds-tab'] })).toBe(
      '| Need | Use |\n| --- | --- |\n| A need | `mds-tab` |',
    );
    expect(needTable({ rows: [], written: [] })).toBe('No need of this category is written yet.');
  });

  test('the components a table holds, as a list in a sentence', () => {
    const three = { rows: [], written: ['mds-a', 'mds-b', 'mds-c'] };
    expect(writtenList(three)).toBe('`mds-a`, `mds-b` and `mds-c`');
    expect(writtenList({ rows: [], written: [] })).toBe('none yet');
    expect(writtenSentence({ rows: [], written: ['mds-tab'] })).toBe(
      'The table holds every need of `mds-tab`, and the needs other components send to this category.',
    );
    expect(writtenSentence({ rows: [], written: [] })).toMatch(/^No component of the category/);
  });
});
