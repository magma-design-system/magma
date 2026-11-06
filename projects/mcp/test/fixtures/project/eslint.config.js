import html from '@html-eslint/parser';
import magma from '@maggioli-design-system/magma/eslint';

export default [
  { files: ['**/*.html'], languageOptions: { parser: html }, ...magma.configs.recommended },
];
