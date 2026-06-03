import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import { baseConfig } from '../../eslint.config.mjs'

export default defineConfig([
  ...baseConfig,
  globalIgnores(['**/node_modules/*', '**/dist/*', '**/build/*']),
  {
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
  },
]);
