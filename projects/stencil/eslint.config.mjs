import { defineConfig, globalIgnores } from 'eslint/config'
import js from '@eslint/js'
import { includeIgnoreFile } from '@eslint/compat'
import { FlatCompat } from '@eslint/eslintrc'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import rootConfig from '../../eslint.config.mjs'
// import stencil from '@stencil/eslint'

import storybook from 'eslint-plugin-storybook'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const gitignorePath = fileURLToPath(new URL('.gitignore', import.meta.url))
const gitignorePathReact = fileURLToPath(
  new URL('react/.gitignore', import.meta.url),
)
const gitignorePathAngular = fileURLToPath(
  new URL('angular/.gitignore', import.meta.url),
)

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
})

export default defineConfig([
  ...storybook.configs['flat/recommended'],
  rootConfig,
  // rootConfig,
  // stencil.configs.flat.recommended,
  globalIgnores([
    '**/*.config.ts',
    '**/*.config.js',
    './.build',
    './dist',
    './src/componnts.d.ts',
    './template',
    '!.storybook',
  ]),
  includeIgnoreFile(gitignorePath, 'Imported .gitignore patterns'),
  {
    basePath: 'react',
    ignores: includeIgnoreFile(
      gitignorePathReact,
      'Imported React project .gitignore patterns',
    ).ignores,
  },
  {
    basePath: 'angular',
    ignores: includeIgnoreFile(
      gitignorePathAngular,
      'Imported Angular project .gitignore patterns',
    ).ignores,
  },
  {
    files: ['./**/*.tsx', './**/*.ts'],
    extends: [
      compat.extends(
        'plugin:storybook/recommended',
        'plugin:@typescript-eslint/recommended',
      ),
    ],
    rules: {
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

      'react/jsx-no-bind': 'off',
    },
  },
])
