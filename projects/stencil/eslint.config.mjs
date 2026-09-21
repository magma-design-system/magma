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

const gitignorePath = fileURLToPath(new URL('.gitignore', import.meta.url));

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
      // autofocus/autoFocus props mirror the native attribute on purpose;
      // renaming them would break the public API
      'stencil/reserved-member-names': 'off',
    },
  },
  // #endregion
]);
