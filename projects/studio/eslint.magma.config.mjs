import magma from '@maggioli-design-system/magma/eslint';
import studio from './eslint.config.mjs';

/*
  The lint of Magma on the pages of the studio (#1401): the rules a product with Magma runs
  (docs/agents/lint.md), on the markup the pages write, `class` included. They read the Magma that
  is built (its documentation.json, the token data of design-tokens and styles), so they run after
  a build, `nx run studio:check.lint`, and in the magma-lint job of the studio workflow, not in
  `nx run studio:lint`, which the lint workflow runs with nothing built. The preset is `strict`,
  for a new product: every rule is an error.
*/
export default [...studio, { files: ['src/**/*.tsx'], ...magma.configs.strict }];
