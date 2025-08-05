import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import rootConfig from '../../eslint.config.mjs'

export default defineConfig([
  globalIgnores(['**/node_modules/*', '**/dist/*', '**/build/*']),
  {
    extends: rootConfig,
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },

    rules: {
      'no-plusplus': 'off',
      'prefer-destructuring': 'off',
      'no-console': 'off',
    },
  },
])
