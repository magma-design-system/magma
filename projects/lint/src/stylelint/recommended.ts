/*
  For a product that already exists: overriding the mode the user picked is an error, a raw
  colour a warning. `strict` (./strict.ts) makes both errors.
*/
import type { Config } from 'stylelint';
import plugins from './index.js';

const config: Config = {
  plugins,
  rules: {
    'magma/no-color-scheme-override': true,
    'magma/no-raw-color': [true, { severity: 'warning' }],
  },
};

export default config;
