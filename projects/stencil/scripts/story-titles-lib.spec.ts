import { describe, expect, it } from 'vitest';
import type { ComponentTaxonomy } from './agent-docs-lib';
import { COMPONENTS_DIR } from './meta';
import fs from 'node:fs';
import {
  readComponentStories,
  readStoryId,
  readStoryTitle,
  storybookDocsIds,
  storyTitleErrors,
} from './story-titles-lib';

describe('readStoryTitle', () => {
  it('reads the title of the meta of a stories file', () => {
    const source = `export default {
  title: 'UI / Forms / Input',
  id: 'form-input',
  args: { title: 'Not the meta' },
};`;
    expect(readStoryTitle('mds-input.stories.tsx', source)).toBe('UI / Forms / Input');
  });

  it('reads the title of the Meta block of an MDX page', () => {
    const source = `import { Meta } from '@storybook/addon-docs/blocks';

<Meta title="UI / Data / Table / Cell" id="layout-table-cell" />`;
    expect(readStoryTitle('mds-table-cell.mdx', source)).toBe('UI / Data / Table / Cell');
  });
});

describe('readStoryId', () => {
  it('reads the id of the meta of a stories file, and of the Meta block of an MDX page', () => {
    expect(
      readStoryId('mds-input.stories.tsx', "  title: 'UI / Forms / Input',\n  id: 'form-input',"),
    ).toBe('form-input');
    expect(
      readStoryId(
        'mds-table-cell.mdx',
        '<Meta title="UI / Data / Table / Cell" id="layout-table-cell" />',
      ),
    ).toBe('layout-table-cell');
  });

  it('reads nothing when the page sets no id', () => {
    expect(
      readStoryId('mds-pref-mode.stories.tsx', "  title: 'UI / Preferences / Mode',"),
    ).toBeUndefined();
  });
});

// #1148: what the published Storybook answers for these pages (its index.json, 2026-10-25)
describe('storybookDocsIds', () => {
  const ids = storybookDocsIds([
    { tag: 'mds-img', file: 'mds-img.stories.tsx', title: 'UI / Content / Image', id: 'ui-image' },
    {
      tag: 'mds-img',
      file: 'mds-img-accessibility.stories.tsx',
      title: 'UI / Content / Image / ARIA',
      id: 'ui-image-aria',
    },
    { tag: 'mds-pref-mode', file: 'mds-pref-mode.stories.tsx', title: 'UI / Preferences / Mode' },
    {
      tag: 'mds-policy-ai',
      file: 'mds-policy.stories.tsx',
      title: 'UI / Tags / Policy AI',
      id: 'ui-policy-ai',
    },
    {
      tag: 'mds-table-row',
      file: 'mds-table-row.mdx',
      title: 'UI / Data / Table / Row',
      id: 'layout-table-row',
    },
  ]);

  it('takes the id of the page named after the component, not of its other pages', () => {
    expect(ids.get('mds-img')).toBe('ui-image--docs');
  });

  it('makes an id of the title when the page sets none, as Storybook does', () => {
    expect(ids.get('mds-pref-mode')).toBe('ui-preferences-mode--docs');
  });

  it('reads a stories file with a shorter name, and an MDX page when there is no stories file', () => {
    expect(ids.get('mds-policy-ai')).toBe('ui-policy-ai--docs');
    expect(ids.get('mds-table-row')).toBe('layout-table-row--docs');
  });
});

describe('storyTitleErrors', () => {
  const components: ComponentTaxonomy[] = [
    { tag: 'mds-table', category: 'data', parents: [] },
    { tag: 'mds-table-row', parents: ['mds-table'] },
    { tag: 'mds-table-cell', parents: ['mds-table-row'] },
    { tag: 'mds-tree', category: 'navigation', parents: [] },
  ];

  it('accepts a page per category, each part and extra page under its component', () => {
    expect(
      storyTitleErrors(components, [
        { tag: 'mds-table', file: 'mds-table.stories.tsx', title: 'UI / Data / Table' },
        { tag: 'mds-table-cell', file: 'mds-table-cell.mdx', title: 'UI / Data / Table / Cell' },
        { tag: 'mds-tree', file: 'mds-tree.stories.tsx', title: 'UI / Navigation / Tree' },
        {
          tag: 'mds-tree',
          file: 'mds-tree-apk.stories.tsx',
          title: 'UI / Navigation / Tree / Usecase hyperSIC',
        },
      ]),
    ).toEqual([]);
  });

  it('names every page outside its category or its compound', () => {
    expect(
      storyTitleErrors(components, [
        { tag: 'mds-table', file: 'mds-table.stories.tsx', title: 'Layout / Table' },
        { tag: 'mds-table-row', file: 'mds-table-row.mdx', title: 'UI / Data / Row' },
        { tag: 'mds-tree', file: 'mds-tree-apk.stories.tsx', title: 'UI / Tree / Usecase' },
      ]),
    ).toEqual([
      'mds-table/test/mds-table.stories.tsx: title "Layout / Table" is not "UI / Data / <name>" (@category data)',
      'mds-tree: no stories file named after it in mds-tree/test/',
      'mds-table-row/test/mds-table-row.mdx: title "UI / Data / Row" is not under "Layout / Table", the page of mds-table',
    ]);
  });
});

// The real tree: every component has a docs page to link to
it('gives every component the id of a Storybook docs page', () => {
  const tags = fs.readdirSync(COMPONENTS_DIR).filter((name) => name.startsWith('mds-'));
  const ids = storybookDocsIds(readComponentStories(COMPONENTS_DIR).pages);
  expect(tags.filter((tag) => !ids.has(tag))).toEqual([]);
});

// The real tree: the pages of every component against its @category and @parent tags
it('every component page sits under its category, every part under its compound', () => {
  const { components, pages } = readComponentStories(COMPONENTS_DIR);
  expect(storyTitleErrors(components, pages)).toEqual([]);
});
