import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { COMPONENTS_DIR } from './meta';
import { sheetImports, styleUrls, unreachableSheets } from './unreachable-sheets-lib';

describe('styleUrls', () => {
  it('reads styleUrl and both forms of styleUrls', () => {
    expect(styleUrls(`@Component({ tag: 'mds-a', styleUrl: 'mds-a.css', shadow: true })`)).toEqual([
      'mds-a.css',
    ]);
    expect(styleUrls(`styleUrls: ['a.css', "b.css"]`)).toEqual(['a.css', 'b.css']);
    expect(styleUrls(`styleUrls: { ios: 'a.ios.css', md: 'a.md.css' }`)).toEqual([
      'a.ios.css',
      'a.md.css',
    ]);
  });
});

describe('sheetImports', () => {
  it('follows relative @import and @reference, not packages or comments', () => {
    const css = `@reference './css/utilities.css';
@import "./css/a-fouc.css";
@import url('../../tailwind/fouc.css');
@import '~@maggioli-design-system/styles/dist/css/animations.css';
/* @import './css/a-commented.css'; */`;

    expect(sheetImports(css)).toEqual([
      './css/utilities.css',
      './css/a-fouc.css',
      '../../tailwind/fouc.css',
    ]);
  });
});

describe('unreachableSheets', () => {
  let root: string;
  const write = (path: string, content = ''): void => {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), content);
  };

  afterEach(() => rmSync(root, { recursive: true, force: true }));

  it('reports the sheets no styleUrl reaches, through any chain of imports', () => {
    root = mkdtempSync(join(tmpdir(), 'unreachable-sheets-'));
    write('mds-a/mds-a.tsx', `@Component({ tag: 'mds-a', styleUrl: 'mds-a.css' })`);
    write('mds-a/mds-a.css', `@reference './css/utilities.css';\n@import './css/mds-a-fouc.css';`);
    write('mds-a/css/utilities.css');
    write('mds-a/css/mds-a-fouc.css', `@import './mds-a-nested.css';`);
    write('mds-a/css/mds-a-nested.css');
    write('mds-a/css/mds-a-property.css', '@property --mds-a-color {}');
    write('mds-a/css/mds-a-lost.css');
    write('mds-b/css/mds-b-draft.css');

    expect(unreachableSheets(root)).toEqual([
      'mds-a/css/mds-a-lost.css',
      'mds-b/css/mds-b-draft.css',
    ]);
  });
});

// The real tree. An unreachable sheet is either dead (delete it) or a lost import (wire it
// back): #1004 found both kinds, among them three FOUC sheets, the animation preference of
// mds-text and the dark contrast shadow of mds-tooltip, all written and never compiled.
it('every component sheet is reached by a styleUrl, except the -property.css files', () => {
  expect(unreachableSheets(COMPONENTS_DIR)).toEqual([]);
});
