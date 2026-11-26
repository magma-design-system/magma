import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  componentNames,
  partTitle,
  positionals,
  readOption,
  storyTitleOf,
} from './generate-component-lib';

describe('generate-component-lib', () => {
  it('writes the names of a component from its tag', () => {
    expect(componentNames('mds-input-field')).toEqual({
      className: 'MdsInputField',
      name: 'Input Field',
      short: 'input-field',
    });
  });

  it('reads an option in both forms, and the positionals around them', () => {
    const args = ['mds-a', '--category', 'content', '--parent=mds-b'];

    expect(readOption(args, 'category')).toBe('content');
    expect(readOption(args, 'parent')).toBe('mds-b');
    expect(readOption(args, 'other')).toBeUndefined();
    expect(positionals(args, ['category', 'parent'])).toEqual(['mds-a']);
  });

  it('reads the title of a page from its stories file or its MDX page', () => {
    const dir = mkdtempSync(join(tmpdir(), 'generate-'));
    mkdirSync(join(dir, 'a'));
    mkdirSync(join(dir, 'b'));
    writeFileSync(
      join(dir, 'a/mds-a.stories.tsx'),
      "export default {\n  title: 'UI / Data / A',\n};",
    );
    writeFileSync(join(dir, 'b/mds-b.mdx'), '<Meta title="UI / Data / A / B" />');

    expect(storyTitleOf(join(dir, 'a'), 'mds-a')).toBe('UI / Data / A');
    expect(storyTitleOf(join(dir, 'b'), 'mds-b')).toBe('UI / Data / A / B');
    expect(storyTitleOf(dir, 'mds-c')).toBeUndefined();
  });

  it('puts a part under the page of its parent, named by the words it adds', () => {
    expect(partTitle('UI / Data / Table', 'mds-table', 'mds-table-cell')).toBe(
      'UI / Data / Table / Cell',
    );
    expect(partTitle('UI / Data / Table', 'mds-table', 'mds-row-group')).toBe(
      'UI / Data / Table / Row Group',
    );
  });
});
