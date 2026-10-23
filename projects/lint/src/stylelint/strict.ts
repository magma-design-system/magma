/* For a new product: every rule of the plugin is an error. */
import type { Config } from 'stylelint';
import plugins from './index.js';

const config: Config = {
  plugins,
  rules: {
    'magma/no-color-scheme-override': true,
    'magma/no-raw-color': true,
  },
};

export default config;
