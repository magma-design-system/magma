import { fileURLToPath } from 'node:url';

/** @type {import('stylelint').Config} */
export default {
  extends: ['../../stylelint.config.mjs'],
  ignoreFiles: ['**/dist/*.css', '**/*.js', '**/*.jsx', '**/*.svg'],
  plugins: ['./scripts/stylelint-token-values.mjs', './scripts/stylelint-host-knobs.mjs'],
  rules: {
    'import-notation': 'string',
  },
  overrides: [
    {
      // lengths and durations come from the tokens, and every value of the look from a knob on
      // :host, the sheets not there yet held at their count (SPEC.md, Authoring rules)
      files: ['src/components/**/*.css'],
      rules: {
        'magma/host-knobs': [
          true,
          { pending: fileURLToPath(new URL('./scripts/host-knobs-pending.json', import.meta.url)) },
        ],
        'magma/token-values': true,
      },
    },
  ],
}
