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

/*
  The way forward of a stepper names the step it leads to: "5. Placement context" of
  mds-stepper-bar, "the way forward last, on the edge, named after the step it leads to", and
  its main action at the last step "names what it does (Invia la domanda), not Avanti". The
  check sees a file, not an element: a button is reported only when the file holds an
  mds-stepper-bar, and only when its label is a bare word for "next", which names no step.
  Criterion of the words: the generic labels of a forward button in the four languages Magma
  ships its own strings in (it, en, es, el, the locale files of the components); any other
  label may name a step, so it passes.
*/
const GENERIC_FORWARD = new Set([
  'avanti',
  'continua',
  'prosegui',
  'procedi',
  'prossimo',
  'successivo',
  'next',
  'continue',
  'proceed',
  'siguiente',
  'continuar',
  // the Greek ones, escaped: the sources are ASCII
  '\u03b5\u03c0\u03cc\u03bc\u03b5\u03bd\u03bf', // epomeno
  '\u03c3\u03c5\u03bd\u03ad\u03c7\u03b5\u03b9\u03b1', // synecheia
]);
const genericForward = (label: unknown): boolean =>
  typeof label === 'string' &&
  GENERIC_FORWARD.has(label.toLocaleLowerCase('it').replace(/^[^\p{L}]+|[^\p{L}]+$/gu, ''));

const stepperForwardNamed: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'The way forward of a stepper names the step it leads to, not a bare "Avanti".',
      url: lintGuideUrl('stepper-forward-named'),
    },
    schema: [],
  },
  create(context) {
    let stepper = false;
    const generic: Finding[] = [];
    const run = (element: LintElement | undefined) => {
      if (!element) return;
      if (element.tag === 'mds-stepper-bar') stepper = true;
      if (element.tag !== 'mds-button') return;
      const label = element.attributes.find(({ name }) => name === 'label');
      if (label && genericForward(label.value))
        generic.push({
          node: label.node,
          message:
            `<mds-button label="${String(label.value)}"> in a page with mds-stepper-bar: name the way ` +
            'forward after the step it leads to ("Avanti: Preferenze", "Vai a Preferenze"), and the ' +
            'main action of the last step after what it does ("Invia la domanda"); ' +
            'mds-stepper-bar, 5. Placement context.',
        });
    };
    return {
      Tag: (node: unknown) => run(fromHtml(node as Parameters<typeof fromHtml>[0])),
      JSXOpeningElement: (node: unknown) => run(fromJsx(node as Parameters<typeof fromJsx>[0])),
      Element: (node: unknown) => run(fromAngular(node as Parameters<typeof fromAngular>[0])),
      'Program:exit': () => {
        if (stepper)
          for (const { node, message } of generic)
            context.report({ node: node as Rule.Node, message });
      },
    } as Rule.RuleListener;
  },
};

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
  'stepper-forward-named': stepperForwardNamed,
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
    'magma/stepper-forward-named': 'warn',
  },
};
plugin.configs.strict = {
  name: '@maggioli-design-system/magma/eslint/strict',
  plugins: { magma: plugin },
  rules: Object.fromEntries(Object.keys(rules).map((rule) => [`magma/${rule}`, 'error'])),
};

export { rules };
export default plugin;
