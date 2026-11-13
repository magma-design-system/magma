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
]);
