import { describe, expect, it } from 'vitest';
import {
  aliasPatterns,
  findAliasedSpecifiers,
  findModuleSpecifiers,
  matchAlias,
  packageOf,
  packageProblem,
  specifierProblem,
  type PackageScope,
  type ResolvedTypes,
} from './public-types-lib';

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

// the shape of projects/stencil/package.json: dependencies, optional peers, and what stays out
const SCOPE: PackageScope = {
  self: '@maggioli-design-system/magma',
  installed: new Set(['@stencil/core', 'luxon', 'clsx', 'mustache', 'eslint', 'stylelint']),
};

// what ts.resolveModuleName (bundler) gives for these from projects/stencil/dist, in the monorepo
const RESOLVED: Record<string, ResolvedTypes> = {
  luxon: { extension: '.mjs', holder: 'luxon' },
  mustache: { extension: '.d.mts', holder: '@types/mustache' },
  clsx: { extension: '.d.mts', holder: 'clsx' },
  eslint: { extension: '.d.ts', holder: 'eslint' },
  '@stencil/core': { extension: '.d.ts', holder: '@stencil/core' },
  '@stencil/core/internal': { extension: '.d.ts', holder: '@stencil/core' },
  '@stencil/store': { extension: '.d.ts', holder: '@stencil/store' },
};
const resolve = (specifier: string): ResolvedTypes | undefined => RESOLVED[specifier];
const BROWSER = { nodeEntry: false };

describe('findModuleSpecifiers', () => {
  it('lists every module a declaration file names, aliases, packages and paths alike', () => {
    const text = [
      "import { EventEmitter } from '../../stencil-public-runtime';",
      "import { DateTime } from 'luxon';",
      "export * from '@dictionary/file-extensions';",
      "export declare const store: import('@stencil/store').ObservableMap<{}>;",
      "declare module '@stencil/core' {}",
      "// import { x } from 'in-a-comment';",
    ].join('\n');
    expect(findModuleSpecifiers('any.d.ts', text)).toEqual([
      { line: 1, specifier: '../../stencil-public-runtime' },
      { line: 2, specifier: 'luxon' },
      { line: 3, specifier: '@dictionary/file-extensions' },
      { line: 4, specifier: '@stencil/store' },
      { line: 5, specifier: '@stencil/core' },
    ]);
  });
});

describe('packageOf', () => {
  it('names the package of a bare specifier, scoped or not, with or without a subpath', () => {
    expect(packageOf('luxon')).toBe('luxon');
    expect(packageOf('luxon/src/datetime.js')).toBe('luxon');
    expect(packageOf('@stencil/core')).toBe('@stencil/core');
    expect(packageOf('@stencil/core/internal')).toBe('@stencil/core');
    expect(packageOf('@maggioli-design-system/magma/services')).toBe(
      '@maggioli-design-system/magma',
    );
  });

  it('names no package for a path or a node: built-in', () => {
    for (const specifier of ['./a', '../b/c', '/abs/d', 'C:/e', 'node:stream']) {
      expect(packageOf(specifier), specifier).toBeUndefined();
    }
  });
});

describe('packageProblem', () => {
  it('passes an installed package with its own declarations, at its root or a subpath', () => {
    expect(packageProblem('clsx', resolve('clsx'), SCOPE)).toBeUndefined();
    expect(
      packageProblem('@stencil/core', resolve('@stencil/core/internal'), SCOPE),
    ).toBeUndefined();
  });

  it('passes magma itself, which resolves through its own exports', () => {
    expect(packageProblem('@maggioli-design-system/magma', undefined, SCOPE)).toBeUndefined();
  });

  it('flags a package with JavaScript only, the luxon of #1360', () => {
    expect(packageProblem('luxon', resolve('luxon'), SCOPE)).toBe('no-declarations');
  });

  it('flags a package typed by an @types devDependency, which resolves in the monorepo only', () => {
    expect(packageProblem('mustache', resolve('mustache'), SCOPE)).toBe(
      'declarations-not-installed',
    );
    // the same @types in dependencies is what a consumer installs
    const withTypes = { ...SCOPE, installed: new Set([...SCOPE.installed, '@types/mustache']) };
    expect(packageProblem('mustache', resolve('mustache'), withTypes)).toBeUndefined();
  });

  it('flags a devDependency, however typed: a consumer does not install it', () => {
    expect(packageProblem('@stencil/store', resolve('@stencil/store'), SCOPE)).toBe(
      'not-installed',
    );
  });

  it('answers unresolved when TypeScript finds nothing, or a file of no package', () => {
    expect(packageProblem('eslint', undefined, SCOPE)).toBe('unresolved');
    expect(packageProblem('eslint', { extension: '.d.ts' }, SCOPE)).toBe('unresolved');
  });
});

describe('specifierProblem', () => {
  it('flags the import the declaration of mds-calendar shipped, the case of #1360', () => {
    // dist/types/components/mds-calendar/mds-calendar.d.ts before the fix
    const text = [
      "import { EventEmitter } from '../../stencil-public-runtime';",
      "import { DateTime } from 'luxon';",
      'export declare class MdsCalendar {',
      '    currentDate: DateTime;',
      '    weekDaysinMonth: DateTime[];',
      '}',
    ].join('\n');
    expect(
      findModuleSpecifiers('mds-calendar.d.ts', text).map(({ line, specifier }) => [
        line,
        specifierProblem(specifier, BROWSER, SCOPE, resolve),
      ]),
    ).toEqual([
      [1, undefined],
      [2, 'no-declarations'],
    ]);
  });

  it('allows a Node built-in in the hydrate app only, with or without the node: prefix', () => {
    for (const specifier of ['node:stream', 'stream']) {
      expect(specifierProblem(specifier, { nodeEntry: true }, SCOPE, resolve)).toBeUndefined();
      expect(specifierProblem(specifier, BROWSER, SCOPE, resolve)).toBe('node-built-in');
    }
  });

  it('leaves relative paths alone and judges a package by its name', () => {
    expect(specifierProblem('./components', BROWSER, SCOPE, resolve)).toBeUndefined();
    expect(specifierProblem('@stencil/core/internal', BROWSER, SCOPE, resolve)).toBeUndefined();
    expect(specifierProblem('@stencil/store', BROWSER, SCOPE, resolve)).toBe('not-installed');
  });
});
