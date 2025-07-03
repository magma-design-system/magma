/** @type {import('stylelint').Config} */
export default {
  extends: ['../../stylelint.config.mjs'],
  ignoreFiles: ['**/dist/*.css', '**/*.js', '**/*.jsx', '**/*.svg'],
  rules: {
    'import-notation': 'string',
  },
}
