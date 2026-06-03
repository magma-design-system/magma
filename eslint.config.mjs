// @ts-check
import { globalIgnores } from 'eslint/config'
import { includeIgnoreFile } from '@eslint/compat'
import tseslint from 'typescript-eslint'
import globals from 'globals'
import { fileURLToPath } from 'node:url'
import eslint from '@eslint/js'

const gitignorePath = fileURLToPath(new URL('.gitignore', import.meta.url))


export const baseConfig = tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      ecmaVersion: 12,
      sourceType: 'module',
    }
  },
)

export default tseslint.config(
  globalIgnores(['**/node_modules', '**/dist', '**/.cache', '**/*.config.*js']),
  includeIgnoreFile(gitignorePath, 'Imported .gitignore patterns'),
  ...baseConfig,
)
