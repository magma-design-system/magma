/*
  The Stylelint plugin: the rules of a consumer's own CSS and SCSS.
  - magma/no-raw-color: a hex, rgb(), hsl() or other colour literal where a role belongs;
  - magma/no-color-scheme-override: a hand-written @media (prefers-color-scheme), which
    follows the OS and not the mode the user picked in Magma.

    // stylelint.config.mjs
    export default { extends: ['@maggioli-design-system/magma/stylelint/recommended'] };

  The colour rule is the consumer side of magma/token-values, which holds the component
  sheets of this repository to the same roles (projects/stencil/scripts).
*/
import stylelint, { type Rule } from 'stylelint';
import { colorLiterals } from '../core/colors.js';

const {
  createPlugin,
  utils: { report, ruleMessages, validateOptions },
} = stylelint;

const DOCS = 'https://github.com/magma-design-system/magma/blob/main/docs/agents/lint.md';

/** A mask paints with the alpha of its image: black and white there are not colours. */
const MASK = /^(?:-webkit-)?mask(?:-image)?$/i;
const SHADOW = /shadow|filter/i;

const noRawColorName = 'magma/no-raw-color';
const noRawColorMessages = ruleMessages(noRawColorName, {
  rejected: (literal: string, hint: string) =>
    `Unexpected colour literal "${literal}": ${hint}, so it follows the mode, the named theme and the contrast preference (agents/color.md)`,
});

const noRawColor: Rule = (primary) => (root, result) => {
  if (!validateOptions(result, noRawColorName, { actual: primary })) return;
  root.walkDecls((decl) => {
    if (MASK.test(decl.prop)) return;
    // a registration cannot name a token: its initial value is a literal by definition
    if (decl.parent?.type === 'atrule' && (decl.parent as { name?: string }).name === 'property')
      return;
    for (const literal of colorLiterals(decl.value))
      report({
        ruleName: noRawColorName,
        result,
        node: decl,
        word: literal,
        message: noRawColorMessages.rejected(
          literal,
          SHADOW.test(decl.prop)
            ? 'draw a shadow with rgb(var(--magma-shadow-ink) / <alpha>)'
            : 'paint with a role, rgb(var(--magma-*))',
        ),
      });
  });
};
noRawColor.ruleName = noRawColorName;
noRawColor.messages = noRawColorMessages;
noRawColor.meta = { url: `${DOCS}#no-raw-color` };

const noColorSchemeName = 'magma/no-color-scheme-override';
const noColorSchemeMessages = ruleMessages(noColorSchemeName, {
  rejected: () =>
    'Unexpected prefers-color-scheme query: it follows the OS, not the mode the user picked in Magma (mds-pref-mode). The roles, rgb(var(--magma-*)), already follow both: paint with them; for a deliberate choice that differs per mode, use the dark variant of the Magma Tailwind theme (dark:, @variant dark), which follows the Magma mode (agents/theming.md)',
});

const noColorSchemeOverride: Rule = (primary) => (root, result) => {
  if (!validateOptions(result, noColorSchemeName, { actual: primary })) return;
  root.walkAtRules(/^(?:media|custom-media)$/i, (atRule) => {
    if (/prefers-color-scheme/i.test(atRule.params))
      report({
        ruleName: noColorSchemeName,
        result,
        node: atRule,
        word: 'prefers-color-scheme',
        message: noColorSchemeMessages.rejected(),
      });
  });
};
noColorSchemeOverride.ruleName = noColorSchemeName;
noColorSchemeOverride.messages = noColorSchemeMessages;
noColorSchemeOverride.meta = { url: `${DOCS}#no-color-scheme-override` };

const plugins = [
  createPlugin(noRawColorName, noRawColor),
  createPlugin(noColorSchemeName, noColorSchemeOverride),
];

export default plugins;
