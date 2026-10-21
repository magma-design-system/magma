/** @type {import('stylelint').Config} */
export default {
  extends: ['../../stylelint.config.mjs'],
  ignoreFiles: ['**/dist/*.css', '**/*.js', '**/*.jsx', '**/*.svg'],
  plugins: ['./scripts/stylelint-token-values.mjs'],
  rules: {
    'import-notation': 'string',
  },
  overrides: [
    {
      // lengths and durations come from the tokens (SPEC.md, Authoring rules)
      files: ['src/components/**/*.css'],
      rules: {
        'magma/token-values': true,
      },
    },
  ],
}
