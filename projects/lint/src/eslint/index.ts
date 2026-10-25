/*
  The ESLint plugin: the template rules, on HTML (@html-eslint/parser), JSX and Angular
  templates (@angular-eslint/template-parser). A rule listens to the element node of each
  parser; the one the file is parsed with is the only one that fires.

    import magma from '@maggioli-design-system/magma/eslint';
    export default [magma.configs.recommended];

  The data comes from the installed packages (../core/data.ts); `settings.magma` points
  elsewhere: { root, documentation, tokens, consumption }.
*/
import path from 'node:path';
import type { ESLint, Linter, Rule } from 'eslint';
import {
  lintGuideUrl,
  loadComponents,
  loadPalette,
  loadStyles,
  type ComponentInfo,
  type MagmaSettings,
  type PaletteInfo,
  type StyleInfo,
} from '../core/data.js';
import {
  accessibleName,
  noDeprecated,
  noFalseBoolean,
  noInternalTokens,
  noRawPaletteClasses,
  validAttributeValues,
} from '../core/checks.js';
import type { Finding, LintElement } from '../core/element.js';
import { fromAngular, fromHtml, fromJsx } from './adapters.js';

interface Data {
  component: (tag: string) => ComponentInfo | undefined;
  palette: () => PaletteInfo;
  styles: () => Map<string, StyleInfo>;
}

type Check = (element: LintElement, data: Data) => Finding[];

/** A check that applies to the Magma components only. */
const onComponents =
  (check: (element: LintElement, component: ComponentInfo) => Finding[]): Check =>
  (element, data) => {
    if (!element.tag.startsWith('mds-')) return [];
    const component = data.component(element.tag);
    return component ? check(element, component) : [];
  };

const createRule = (name: string, description: string, check: Check): Rule.RuleModule => ({
  meta: {
    type: 'problem',
    docs: { description, url: lintGuideUrl(name) },
    schema: [],
  },
  create(context) {
    const own = (context.settings as { magma?: MagmaSettings }).magma ?? {};
    const settings: MagmaSettings = { ...own, root: path.resolve(context.cwd, own.root ?? '.') };
    const data: Data = {
      component: (tag) => loadComponents(settings).get(tag),
      palette: () => loadPalette(settings),
      styles: () => loadStyles(settings),
    };
    const run = (element: LintElement | undefined) => {
      if (!element) return;
      for (const { node, message } of check(element, data))
        context.report({ node: node as Rule.Node, message });
    };
    // the element node of each parser: the one this file is parsed with fires
    return {
      Tag: (node: unknown) => run(fromHtml(node as Parameters<typeof fromHtml>[0])),
      JSXOpeningElement: (node: unknown) => run(fromJsx(node as Parameters<typeof fromJsx>[0])),
      Element: (node: unknown) => run(fromAngular(node as Parameters<typeof fromAngular>[0])),
    } as Rule.RuleListener;
  },
});

const rules: Record<string, Rule.RuleModule> = {
  'valid-attribute-values': createRule(
    'valid-attribute-values',
    'A Magma prop takes one of the values of its union.',
    onComponents(validAttributeValues),
  ),
  'no-false-boolean': createRule(
    'no-false-boolean',
    'A boolean prop is turned off by removing its attribute, never with "false".',
    onComponents(noFalseBoolean),
  ),
  'accessible-name': createRule(
    'accessible-name',
    'An icon-only Magma control has a label or an aria-label, a Magma image an alt.',
    onComponents(accessibleName),
  ),
  'no-deprecated': createRule(
    'no-deprecated',
    'A deprecated Magma prop is replaced before the next major removes it.',
    onComponents(noDeprecated),
  ),
  'no-raw-palette-classes': createRule(
    'no-raw-palette-classes',
    "Colour classes name a role, not Tailwind's palette or a raw Magma step.",
    (element, data) => (element.classes.length ? noRawPaletteClasses(element, data.palette()) : []),
  ),
  'no-internal-tokens': createRule(
    'no-internal-tokens',
    'An inline style or a Tailwind class sets or reads only the custom properties a Magma component promises.',
    (element, data) =>
      element.customProperties.length || element.classes.some(({ name }) => name.includes('--mds-'))
        ? noInternalTokens(element, data.styles())
        : [],
  ),
};

const plugin: ESLint.Plugin & { configs: Record<'recommended' | 'strict', Linter.Config> } = {
  meta: { name: '@maggioli-design-system/magma/eslint' },
  rules,
  configs: {} as Record<'recommended' | 'strict', Linter.Config>,
};

/**
 * `recommended`: what is broken or not accessible is an error, the palette, an internal
 * custom property and a deprecated prop a warning, for a product that already exists;
 * `strict`: everything an error, for a new one.
 */
plugin.configs.recommended = {
  name: '@maggioli-design-system/magma/eslint/recommended',
  plugins: { magma: plugin },
  rules: {
    'magma/valid-attribute-values': 'error',
    'magma/no-false-boolean': 'error',
    'magma/accessible-name': 'error',
    'magma/no-deprecated': 'warn',
    'magma/no-raw-palette-classes': 'warn',
    'magma/no-internal-tokens': 'warn',
  },
};
plugin.configs.strict = {
  name: '@maggioli-design-system/magma/eslint/strict',
  plugins: { magma: plugin },
  rules: Object.fromEntries(Object.keys(rules).map((rule) => [`magma/${rule}`, 'error'])),
};

export { rules };
export default plugin;
