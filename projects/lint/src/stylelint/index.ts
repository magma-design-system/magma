/*
  The Stylelint plugin: the rules of a consumer's own CSS and SCSS.
  - magma/no-raw-color: a hex, rgb(), hsl() or other colour literal where a role belongs;
  - magma/no-color-scheme-override: a hand-written @media (prefers-color-scheme), which
    follows the OS and not the mode the user picked in Magma;
  - magma/no-internal-tokens: an `--mds-*` custom property set or read that no component
    promises, in a declaration or in a class of `@apply`: internal ones may change in any
    release.

    // stylelint.config.mjs
    export default { extends: ['@maggioli-design-system/magma/stylelint/recommended'] };

  The colour rule is the consumer side of magma/token-values, which holds the component
  sheets of this repository to the same roles (projects/stencil/scripts). It lets through
  the public custom properties marked static, which take a value of their own (the colours
  of an illustration), not a role.

  The rules that read the installed documentation.json find it beside them, inside magma;
  their secondary options `root` and `documentation` point elsewhere, as `settings.magma`
  does for the ESLint plugin.
*/
import stylelint, { type Rule } from 'stylelint';
import { colorLiterals } from '../core/colors.js';
import { internalTokenMessage, utilityOf } from '../core/checks.js';
import { customPropertiesOf } from '../core/element.js';
import { loadStyles, type MagmaSettings, type StyleInfo } from '../core/data.js';

const {
  createPlugin,
  utils: { report, ruleMessages, validateOptions },
} = stylelint;

const DOCS = 'https://github.com/magma-design-system/magma/blob/main/docs/agents/lint.md';

const isString = (value: unknown) => typeof value === 'string';
/** The secondary options that point the data elsewhere (core/data.ts). */
const DATA_OPTIONS = { root: [isString], documentation: [isString] };

/** The custom properties of the installed components, or undefined when there is no documentation.json to read. */
const stylesOf = (secondary: unknown): Map<string, StyleInfo> | undefined => {
  const { root, documentation } = (secondary ?? {}) as MagmaSettings;
  try {
    return loadStyles({ ...(root ? { root } : {}), ...(documentation ? { documentation } : {}) });
  } catch {
    return undefined;
  }
};

const COMPONENT_VAR = /--mds-[\w-]+/g;

/** A mask paints with the alpha of its image: black and white there are not colours. */
const MASK = /^(?:-webkit-)?mask(?:-image)?$/i;
const SHADOW = /shadow|filter/i;

const noRawColorName = 'magma/no-raw-color';
const noRawColorMessages = ruleMessages(noRawColorName, {
  rejected: (literal: string, hint: string) =>
    `Unexpected colour literal "${literal}": ${hint}, so it follows the mode, the named theme and the contrast preference (agents/color.md)`,
});

const noRawColor: Rule = (primary, secondary) => (root, result) => {
  if (
    !validateOptions(
      result,
      noRawColorName,
      { actual: primary },
      { actual: secondary, possible: DATA_OPTIONS, optional: true },
    )
  )
    return;
  let styles: Map<string, StyleInfo> | undefined | null = null;
  root.walkDecls((decl) => {
    if (MASK.test(decl.prop)) return;
    // a static custom property takes a colour of its own, not a role (the skin of an illustration)
    if (decl.prop.startsWith('--mds-')) {
      if (styles === null) styles = stylesOf(secondary);
      if (styles?.get(decl.prop)?.static) return;
    }
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

const noInternalTokensName = 'magma/no-internal-tokens';
const noInternalTokensMessages = ruleMessages(noInternalTokensName, {
  rejected: (message: string) => message,
});

const noInternalTokens: Rule = (primary, secondary) => (root, result) => {
  if (
    !validateOptions(
      result,
      noInternalTokensName,
      { actual: primary },
      { actual: secondary, possible: DATA_OPTIONS, optional: true },
    )
  )
    return;
  const styles = stylesOf(secondary);
  // without the documentation of the installed version there is nothing to hold the names to
  if (!styles) return;
  const check = (node: Parameters<typeof report>[0]['node'], names: Set<string>) => {
    for (const name of names) {
      const message = internalTokenMessage(name, styles.get(name));
      if (message)
        report({
          ruleName: noInternalTokensName,
          result,
          node,
          word: name,
          message: noInternalTokensMessages.rejected(message),
        });
    }
  };
  root.walkDecls((decl) => {
    const names = new Set(decl.value.match(COMPONENT_VAR) ?? []);
    if (decl.prop.startsWith('--mds-')) names.add(decl.prop);
    check(decl, names);
  });
  // the classes a sheet applies, as the templates write them: `@apply [--mds-x:red]`
  root.walkAtRules('apply', (rule) =>
    check(
      rule,
      new Set(
        rule.params
          .split(/\s+/)
          .flatMap((name) => customPropertiesOf(utilityOf(name), rule).map((one) => one.name)),
      ),
    ),
  );
};
noInternalTokens.ruleName = noInternalTokensName;
noInternalTokens.messages = noInternalTokensMessages;
noInternalTokens.meta = { url: `${DOCS}#no-internal-tokens` };

const plugins = [
  createPlugin(noRawColorName, noRawColor),
  createPlugin(noColorSchemeName, noColorSchemeOverride),
  createPlugin(noInternalTokensName, noInternalTokens),
];

export default plugins;
