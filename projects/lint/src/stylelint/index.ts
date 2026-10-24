/*
  The Stylelint plugin: the rules of a consumer's own CSS and SCSS.
  - magma/no-raw-color: a hex, rgb(), hsl() or other colour literal where a role belongs;
  - magma/no-color-scheme-override: a hand-written @media (prefers-color-scheme), which
    follows the OS and not the mode the user picked in Magma;
  - magma/no-internal-tokens: an `--mds-*` custom property set or read that no component
    promises, in a declaration or in a class of `@apply`: internal ones may change in any
    release;
  - magma/no-raw-palette-classes: a class of `@apply` that paints with Tailwind's palette or
    a raw Magma step, the check of the ESLint rule of the same name on the classes a sheet
    applies, as no-internal-tokens is.

    // stylelint.config.mjs
    export default { extends: ['@maggioli-design-system/magma/stylelint/recommended'] };

  The colour rule is the consumer side of magma/token-values, which holds the component
  sheets of this repository to the same roles (projects/stencil/scripts). It lets through
  the public custom properties marked static, which take a value of their own (the colours
  of an illustration), not a role.

  The rules that read the installed documentation.json find it beside them, inside magma,
  and the palette rule resolves design-tokens and styles from there; their secondary options
  `root`, `documentation`, `tokens` and `consumption` point elsewhere, as `settings.magma`
  does for the ESLint plugin.
*/
import stylelint, { type Rule, type RuleMeta } from 'stylelint';
import { colorLiterals } from '../core/colors.js';
import { internalTokenMessage, rawPaletteMessage, utilityOf } from '../core/checks.js';
import { customPropertiesOf } from '../core/element.js';
import {
  lintGuideUrl,
  loadPalette,
  loadStyles,
  type MagmaSettings,
  type PaletteInfo,
  type StyleInfo,
} from '../core/data.js';

const {
  createPlugin,
  utils: { report, ruleMessages, validateOptions },
} = stylelint;

/**
 * The meta of a rule: the section of the guide at the installed release and, as the ESLint
 * rules have in meta.docs, what the rule asks for. Stylelint's own meta has no description.
 */
const metaOf = (name: string, description: string): RuleMeta & { description: string } => ({
  url: lintGuideUrl(name),
  description,
});

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

/** The secondary options of the palette rule: the files of loadPalette. */
const PALETTE_OPTIONS = { root: [isString], tokens: [isString], consumption: [isString] };

/** The palette of the installed version, or undefined when its tokens or consumption map cannot be found. */
const paletteOf = (secondary: unknown): PaletteInfo | undefined => {
  const { root, tokens, consumption } = (secondary ?? {}) as MagmaSettings;
  try {
    return loadPalette({
      ...(root ? { root } : {}),
      ...(tokens ? { tokens } : {}),
      ...(consumption ? { consumption } : {}),
    });
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
noRawColor.meta = metaOf(
  'no-raw-color',
  'A stylesheet paints with a role, rgb(var(--magma-*)), not with a colour literal (hex, rgb(), hsl() and the other colour functions).',
);

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
noColorSchemeOverride.meta = metaOf(
  'no-color-scheme-override',
  'A stylesheet follows the mode the user picked in Magma, not the OS: no prefers-color-scheme query.',
);

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
noInternalTokens.meta = metaOf(
  'no-internal-tokens',
  'A declaration or a class of @apply sets or reads only the custom properties a Magma component promises.',
);

const noRawPaletteClassesName = 'magma/no-raw-palette-classes';
const noRawPaletteClassesMessages = ruleMessages(noRawPaletteClassesName, {
  rejected: (message: string) => message,
});

const noRawPaletteClasses: Rule = (primary, secondary) => (root, result) => {
  if (
    !validateOptions(
      result,
      noRawPaletteClassesName,
      { actual: primary },
      { actual: secondary, possible: PALETTE_OPTIONS, optional: true },
    )
  )
    return;
  const palette = paletteOf(secondary);
  // without the tokens of the installed version there is nothing to tell a raw step from a role
  if (!palette) return;
  // the classes a sheet applies, as the templates write them; the codemod migrates them too
  root.walkAtRules('apply', (rule) => {
    for (const name of rule.params.split(/\s+/).filter(Boolean)) {
      const message = rawPaletteMessage(name, palette);
      if (message)
        report({
          ruleName: noRawPaletteClassesName,
          result,
          node: rule,
          word: name,
          message: noRawPaletteClassesMessages.rejected(message),
        });
    }
  });
};
noRawPaletteClasses.ruleName = noRawPaletteClassesName;
noRawPaletteClasses.messages = noRawPaletteClassesMessages;
noRawPaletteClasses.meta = metaOf(
  'no-raw-palette-classes',
  "A class of @apply names a role, not Tailwind's palette or a raw Magma step.",
);

const plugins = [
  createPlugin(noRawColorName, noRawColor),
  createPlugin(noColorSchemeName, noColorSchemeOverride),
  createPlugin(noInternalTokensName, noInternalTokens),
  createPlugin(noRawPaletteClassesName, noRawPaletteClasses),
];

export default plugins;
