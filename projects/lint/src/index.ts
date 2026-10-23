/*
  @maggioli-design-system/lint: the rules that hold a consumer's code to the installed
  version of Magma. The plugins are the subpath exports `./eslint` and `./stylelint`
  (with `./stylelint/recommended` and `./stylelint/strict`); this entry exposes the core
  they share, for tools that want to run the same checks.
*/
export * from './core/data.js';
export * from './core/element.js';
export * from './core/checks.js';
export * from './core/colors.js';
