import { defineConfig, globalIgnores } from 'eslint/config';
import js from '@eslint/js';
import { includeIgnoreFile } from '@eslint/compat';
import { FlatCompat } from '@eslint/eslintrc';
import { fileURLToPath } from 'node:url';
import { baseConfig } from '../../eslint.config.mjs';
import stencil from '@stencil/eslint-plugin';
import tseslint from 'typescript-eslint';
import storybook from 'eslint-plugin-storybook';

const gitignorePath = fileURLToPath(new URL('.gitignore', import.meta.url));

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  ...baseConfig,
  globalIgnores(['react', 'angular']),
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
  // #region storybook
  ...storybook.configs['flat/recommended'],
  {
    extends: [
      compat.extends('plugin:storybook/recommended', 'plugin:@typescript-eslint/recommended'),
    ],
  },
  // #endregion

  // #region stencil
  {
    extends: [stencil.configs.flat.recommended],
    files: ['src/components/**/*.tsx'],
    ignores: ['.storybook/**', '**/*.stories.*'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        project: './tsconfig.json', // important for rules requiring type info
        tsconfigRootDir: import.meta.dirname, // ensure paths resolve correctly
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      'stencil/strict-mutable': 'off',
      'stencil/decorators-style': 'off',
    },
  },
  // #endregion
]);
