import { describe, expect, it } from 'vitest';
import { aliasPatterns, findAliasedSpecifiers, matchAlias } from './public-types-lib';

// the shape of projects/stencil/tsconfig.json: aliases of the sources, and a redirect to the
// hoisted copy of a package
const PATHS = {
  'src/*': ['./src/*'],
  '@dictionary/*': ['./src/dictionary/*'],
  '@type/*': ['./src/type/*'],
  '@icon/*': ['./assets/svg/*'],
  react: ['../../node_modules/react'],
  'react/jsx-runtime': ['../../node_modules/react/jsx-runtime.js'],
};
const patterns = aliasPatterns(PATHS);

describe('aliasPatterns', () => {
  it('keeps the keys that point into the project and leaves out the redirects to node_modules', () => {
    expect(patterns.map(({ key }) => key)).toEqual([
      'src/*',
      '@dictionary/*',
      '@type/*',
      '@icon/*',
    ]);
  });

  it('splits a key at its wildcard', () => {
    expect(aliasPatterns({ '@a/*.svg': ['./a/*.svg'], '#b': ['./b.ts'] })).toEqual([
      { key: '@a/*.svg', prefix: '@a/', suffix: '.svg', wildcard: true },
      { key: '#b', prefix: '#b', suffix: '', wildcard: false },
    ]);
  });
});

describe('matchAlias', () => {
  it('matches a specifier through an alias', () => {
    expect(matchAlias('@dictionary/file-extensions', patterns)?.key).toBe('@dictionary/*');
    expect(matchAlias('src/common/unit', patterns)?.key).toBe('src/*');
  });

  it('leaves relative paths, packages and lookalikes alone', () => {
    for (const specifier of [
      './type/file-types',
      '../dictionary/icon',
      '@stencil/core',
      'luxon',
      'react',
      '@types/node',
      '@typescript-eslint/parser',
    ]) {
      expect(matchAlias(specifier, patterns), specifier).toBeUndefined();
    }
  });

  it('honours the suffix and the exact keys', () => {
    const own = aliasPatterns({ '@a/*.svg': ['./a/*.svg'], '#b': ['./b.ts'] });
    expect(matchAlias('@a/x.svg', own)?.key).toBe('@a/*.svg');
    expect(matchAlias('@a/x.ts', own)).toBeUndefined();
    expect(matchAlias('#b', own)?.key).toBe('#b');
    expect(matchAlias('#b/c', own)).toBeUndefined();
  });
});

describe('findAliasedSpecifiers', () => {
  it('finds the re-exports Stencil leaves behind, the case of #1357', () => {
    // dist/types/type/file-types.d.ts as the stencil build shipped it
    const text = [
      "export declare const extensionSuffixDictionary: readonly ['7z', 'zip'];",
      'export type ExtensionSuffixType = (typeof extensionSuffixDictionary)[number];',
      "export * from '@dictionary/file-extensions';",
      "export { inputTipItemVariantDictionary } from '@type/input-tip';",
    ].join('\n');
    expect(findAliasedSpecifiers('file-types.d.ts', text, patterns)).toEqual([
      { line: 3, specifier: '@dictionary/file-extensions', alias: '@dictionary/*' },
      { line: 4, specifier: '@type/input-tip', alias: '@type/*' },
    ]);
  });

  it('finds every form a declaration file names a module in', () => {
    const text = [
      "import { A } from '@type/a';",
      "import type { B } from 'src/type/b';",
      "export type { C } from '@type/c';",
      "export declare const d: import('@type/d').D;",
      "import e = require('@type/e');",
      "declare module '@type/f' {}",
    ].join('\n');
    expect(
      findAliasedSpecifiers('all.d.ts', text, patterns).map(
        ({ line, specifier }) => `${line} ${specifier}`,
      ),
    ).toEqual(['1 @type/a', '2 src/type/b', '3 @type/c', '4 @type/d', '5 @type/e', '6 @type/f']);
  });

  it('passes a declaration file with relative paths and packages only', () => {
    const text = [
      "import { DateTime } from 'luxon';",
      "export * from '../dictionary/file-extensions';",
      "export declare const store: import('@stencil/store').ObservableMap<{}>;",
      "declare module '@stencil/core' {}",
      "// export * from '@type/in-a-comment';",
    ].join('\n');
    expect(findAliasedSpecifiers('clean.d.ts', text, patterns)).toEqual([]);
  });
});
