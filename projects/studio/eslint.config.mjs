import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import { baseConfig } from '../../eslint.config.mjs'

export default defineConfig([
  ...baseConfig,
  // the builds: the app (dist) and the static site (dist-site, build.site)
  globalIgnores(['**/node_modules/*', '**/dist/*', '**/dist-site/*']),
  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },
  // The direction of the imports (#1397, #1399): the engine imports no file of the studio but the
  // texts (shared/i18n/text.ts) and the types of build/; shared imports the engine and the types
  // of build/, never a page. A specifier is matched as written, so the patterns count the folders
  // from where the files sit: src/engine/*, src/shared/<area>/*. A test beside its module may
  // import what it is tested with: the rules read the sources alone.
  {
    files: ['src/engine/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: '^\\.\\./(?!\\.\\./|shared/i18n/text\\.js$)',
              message:
                'The engine imports no file of the studio but shared/i18n/text.ts (README, Architecture).',
            },
            {
              regex: '^\\.\\./\\.\\./build/',
              allowTypeImports: true,
              message: 'The engine takes types alone from build/ (README, Architecture).',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/shared/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: '^\\.\\./\\.\\./(?!\\.\\./|engine/)',
              message: 'shared imports the engine and itself, never a page (README, Architecture).',
            },
            {
              regex: '^\\.\\./\\.\\./\\.\\./build/',
              allowTypeImports: true,
              message: 'shared takes types alone from build/ (README, Architecture).',
            },
          ],
        },
      ],
    },
  },
]);
