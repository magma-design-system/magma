/*
  The lint of Magma on the sheets of the studio (#1401), as a product with Magma runs it
  (docs/agents/lint.md): `strict`, for a new product. Like eslint.magma.config.mjs it reads the
  Magma that is built, so it runs in `nx run studio:check.lint`, after a build.
*/
/** @type {import('stylelint').Config} */
export default {
  extends: ['@maggioli-design-system/magma/stylelint/strict'],
};
