import { describe, expect, it } from 'vitest';
import type { ComponentTaxonomy } from './agent-docs-lib';
import { COMPONENTS_DIR } from './meta';
import { readComponentStories, readStoryTitle, storyTitleErrors } from './story-titles-lib';

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

// The real tree: the pages of every component against its @category and @parent tags
it('every component page sits under its category, every part under its compound', () => {
  const { components, pages } = readComponentStories(COMPONENTS_DIR);
  expect(storyTitleErrors(components, pages)).toEqual([]);
});
