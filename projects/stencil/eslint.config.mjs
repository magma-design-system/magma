import { defineConfig, globalIgnores } from 'eslint/config'
import js from '@eslint/js'
import { includeIgnoreFile } from '@eslint/compat'
import { FlatCompat } from '@eslint/eslintrc'
import { fileURLToPath } from 'node:url'
import rootConfig from '../../eslint.config.mjs'
import stencil from '@stencil/eslint-plugin'
import tseslint from 'typescript-eslint'
import storybook from 'eslint-plugin-storybook'


const gitignorePath = fileURLToPath(new URL('.gitignore', import.meta.url))

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
})

export default defineConfig([
  rootConfig,
  globalIgnores([
    'react',
    'angular'
  ]),
  includeIgnoreFile(gitignorePath, 'Imported .gitignore patterns'),

  // #region storybook
  ...storybook.configs['flat/recommended'],
  {
    extends: [
      compat.extends(
        'plugin:storybook/recommended',
        'plugin:@typescript-eslint/recommended',
      ),
    ],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          varsIgnorePattern: '^h$',
        },
      ],
    }
  },
  // #endregion

  // #region stencil
  {
    files: ['./**/src/components/*.tsx', './**/src/components/*.ts'],
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
     plugins: {
      '@typescript-eslint': tseslint.plugin,
      'stencil': stencil
    },
    rules: {
      ...tseslint.configs.recommendedTypeChecked[0].rules,
      ...stencil.configs.recommended.rules,
      "@typescript-eslint/strict-boolean-expressions": 0,
      '@typescript-eslint/explicit-module-boundary-types': [
        'error',
        {
          allowedNames: ['render'],
        },
      ],

      // '@typescript-eslint/prefer-nullish-coalescing': 'error',

      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          varsIgnorePattern: '^h$',
        },
      ],

      // disable rule due to incompatibility stencil plugin, waitinf for update
      'stencil/strict-boolean-conditions': 'off',
      'react/jsx-no-bind': 'off',
    },
  },
  // #endregion
])
