import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import { includeIgnoreFile } from '@eslint/compat';
import { FlatCompat } from '@eslint/eslintrc';
import { fileURLToPath } from 'node:url';
import { baseConfig } from '../../eslint.config.mjs';
import stencil from '@stencil/eslint-plugin';
import tseslint from 'typescript-eslint';
import storybook from 'eslint-plugin-storybook';
import react from 'eslint-plugin-react';
import ts from 'typescript';

const gitignorePath = fileURLToPath(new URL('.gitignore', import.meta.url));

// The path aliases of tsconfig.json (`@type/*`, `@dictionary/*`, ...), the keys of `paths` that
// do not point into node_modules: Stencil rewrites them in the .d.ts it ships for an import, not
// for a re-export, which reaches the consumer as a module it cannot resolve (#1357).
// scripts/check-public-types.ts checks the built types; this rule names the cause in the source.
const { config: tsconfig } = ts.readConfigFile(
  fileURLToPath(new URL('tsconfig.json', import.meta.url)),
  ts.sys.readFile,
);
const aliasPrefixes = Object.entries(tsconfig?.compilerOptions?.paths ?? {})
  .filter(([, targets]) => !targets.some((target) => /(^|\/)node_modules(\/|$)/.test(target)))
  // an esquery regex ends at the first `/`, escaped or not: the slash goes in as \x2F
  .map(([key]) =>
    key
      .split('*')[0]
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replaceAll('/', '\\x2F'),
  );
const aliasedSource = `/^(${aliasPrefixes.join('|')})/`;
const aliasedReExport =
  'A re-export through a path alias of tsconfig.json reaches the shipped .d.ts as is: Stencil rewrites the alias of an import, not of an export ... from, and consumers cannot resolve it (#1357). Write the relative path.';

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  ...baseConfig,
  includeIgnoreFile(gitignorePath, 'Imported .gitignore patterns'),

  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          varsIgnorePattern: '^(h|Fragment)$',
        },
      ],
    },
  },
  {
    basePath: import.meta.dirname,
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: `ExportAllDeclaration[source.value=${aliasedSource}]`,
          message: aliasedReExport,
        },
        {
          selector: `ExportNamedDeclaration[source.value=${aliasedSource}]`,
          message: aliasedReExport,
        },
      ],
    },
  },
  // #region storybook
  ...storybook.configs['flat/recommended'],
  {
    // The stories are rendered by @storybook/react-webpack5, so they are React
    // components: a children array built in a story's own render function without a key
    // does not merely warn, it takes the story down with "Rendered more hooks than
    // during the previous render" and leaves the canvas empty (entry 20 of #680).
    files: ['**/*.stories.tsx'],
    plugins: { react },
    rules: {
      'react/jsx-key': 'error',
    },
  },
  {
    extends: [compat.extends('plugin:@typescript-eslint/recommended')],
  },
  // #endregion

  // #region stencil
  {
    // lint-staged runs ESLint from the root of the repository with this file as --config, and
    // patterns are relative to the working directory: without a base path the block never
    // matched there, and a commit skipped the stencil rules the lint target applies
    basePath: import.meta.dirname,
    extends: [stencil.configs.flat.recommended],
    files: ['src/components/**/*.tsx'],
    ignores: ['.storybook/**', '**/*.stories.*'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      'stencil/strict-mutable': 'off',
      'stencil/decorators-style': 'off',
      // autofocus/autoFocus props mirror the native attribute on purpose;
      // renaming them would break the public API
      'stencil/reserved-member-names': 'off',
    },
  },
  // #endregion
]);
