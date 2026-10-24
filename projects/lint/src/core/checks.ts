/*
  The checks of the template rules, one per rule, on the element of ./element.ts and the
  data of ./data.ts. Each returns what it finds; the ESLint plugin reports it. The texts
  follow docs/agents (conventions.md, color.md), where each rule is written in prose.
*/
import type { ComponentInfo, PaletteInfo, StyleInfo } from './data.js';
import {
  attributeOf,
  customPropertiesOf,
  isSet,
  type Finding,
  type LintCustomProperty,
  type LintElement,
} from './element.js';

/** `<mds-banner tone="outline">`: a value outside the closed union of the prop. */
export const validAttributeValues = (element: LintElement, component: ComponentInfo): Finding[] => {
  const found: Finding[] = [];
  for (const attribute of element.attributes) {
    const prop = component.props.get(attribute.name);
    if (!prop?.values || prop.boolean) continue;
    if (typeof attribute.value !== 'string' && typeof attribute.value !== 'number') continue;
    const value = String(attribute.value);
    if (prop.values.includes(value)) continue;
    found.push({
      node: attribute.node,
      message: `"${value}" is not a value of ${attribute.name} on <${element.tag}>: use ${prop.values.map((one) => `"${one}"`).join(', ')}.`,
    });
  }
  return found;
};

/** `disabled="false"`: the attribute is there, so the boolean is not reliably off. */
export const noFalseBoolean = (element: LintElement, component: ComponentInfo): Finding[] =>
  element.attributes
    .filter((attribute) => {
      if (!component.props.get(attribute.name)?.boolean) return false;
      if (typeof attribute.value === 'string')
        return attribute.value.trim().toLowerCase() === 'false';
      // an attribute binding writes `false` as the attribute "false"
      return attribute.binding === 'attribute' && attribute.value === false;
    })
    .map((attribute) => ({
      node: attribute.node,
      message: `${attribute.name}="false" on <${element.tag}>: remove the attribute to turn ${attribute.name} off. A form-associated component reads any value as on, "false" included, as a native control does; from a framework, bind a real boolean to the property.`,
    }));

/** The props, attributes and properties that give an element its accessible name. */
const NAME = ['aria-label', 'aria-labelledby', 'ariaLabel', 'ariaLabelledby', 'title'];

/**
 * An icon-only control without a name, and an image without alt. A component that takes an
 * icon next to a label or a default slot is icon-only when it shows the icon alone; without
 * `label` or `aria-label` it is announced by the icon's slug, or not at all. An image without
 * `alt` is named after its file. An element with an `id` may be named from outside, by an
 * `mds-tooltip relation="label"` or an `aria-labelledby` elsewhere, which a check of one
 * element cannot see: it is left alone.
 */
export const accessibleName = (element: LintElement, component: ComponentInfo): Finding[] => {
  if (element.spread || isSet(attributeOf(element, 'id'))) return [];
  const has = (prop: string) => component.props.has(prop);
  const named = NAME.some((name) => isSet(attributeOf(element, name)));

  if (
    has('icon') &&
    (has('label') || component.defaultSlot) &&
    isSet(attributeOf(element, 'icon')) &&
    !isSet(attributeOf(element, 'label')) &&
    !element.content &&
    !named
  )
    return [
      {
        node: element.node,
        message: `<${element.tag}> shows only its icon and has no accessible name: give it a label${has('label') ? '' : ' in its content'}, or an aria-label that says the action.`,
      },
    ];

  // a component with a name of its own (the title of mds-book) is named without alt
  if (
    has('alt') &&
    has('src') &&
    !has('name') &&
    attributeOf(element, 'src') &&
    !attributeOf(element, 'alt') &&
    !named
  )
    return [
      {
        node: element.node,
        message: `<${element.tag}> has a src and no alt, so it is named after its file: describe the image in alt, or set alt="" when it is decorative.`,
      },
    ];
  return [];
};

/** Tailwind's own palette: `white`, `black` and the steps of its hues. */
const TAILWIND_PALETTE =
  /^(?:black|white|(?:slate|gray|zinc|neutral|stone|taupe|mauve|mist|olive|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|[1-9]00|950))$/;

/** `dark:hover:!bg-white/50` -> `bg-white`: no variants, no important, no opacity. */
export const utilityOf = (name: string): string => {
  let depth = 0;
  let start = 0;
  for (let index = 0; index < name.length; index++) {
    const char = name[index];
    if (char === '[' || char === '(') depth++;
    else if (char === ']' || char === ')') depth--;
    else if (char === ':' && depth === 0) start = index + 1;
  }
  return name
    .slice(start)
    .replace(/^!|!$/g, '')
    .replace(/\/[\w.[\]()%-]+$/, '');
};

/** A colour class that paints the interface with a raw palette instead of a role. */
export const noRawPaletteClasses = (element: LintElement, palette: PaletteInfo): Finding[] => {
  const found: Finding[] = [];
  for (const { name, node } of element.classes) {
    const utility = utilityOf(name);
    const root = palette.colorUtilities.find((one) => utility.startsWith(`${one}-`));
    if (!root) continue;
    const key = utility.slice(root.length + 1);
    if (palette.rawKeys.has(key))
      found.push({
        node,
        message: `${name} paints with a raw Magma step, which follows the mode only: use a role (bg-surface-*, text-fg-*, border-border-*), see agents/color.md; label-* and brand-* are for colour that encodes data.`,
      });
    else if (TAILWIND_PALETTE.test(key))
      found.push({
        node,
        message: `${name} paints with Tailwind's palette, which ignores Magma's mode, themes and contrast: use a role (bg-surface-*, text-fg-*, border-border-*), see agents/color.md.`,
      });
  }
  return found;
};

/**
 * What is wrong with setting or reading the custom property `name`, undefined when a
 * component promises it. Shared by the ESLint and the Stylelint rule.
 */
export const internalTokenMessage = (
  name: string,
  style: StyleInfo | undefined,
): string | undefined => {
  if (style?.visibility === 'public') return undefined;
  const instead = `set a public one (the component's AGENTS.md lists them), a prop, a part or a role (agents/conventions.md)`;
  return style
    ? `"${name}" is an internal custom property of ${style.tags.map((tag) => `<${tag}>`).join(', ')}: it may change in any release. Instead, ${instead}.`
    : `"${name}" is not a custom property any Magma component promises: ${instead}.`;
};

/**
 * The `--mds-*` names a class sets or reads through Tailwind, read through its variants and
 * `!` as `utilityOf` reads them: an arbitrary property (`dark:[--mds-x:red]`, also on a parent
 * that sets it for its descendants) or an arbitrary value (`bg-[var(--mds-x)]`, `bg-(--mds-x)`).
 */
export const classCustomPropertiesOf = (element: LintElement): LintCustomProperty[] =>
  element.classes.flatMap(({ name, node }) => customPropertiesOf(utilityOf(name), node));

/**
 * `style="--mds-chip-icon-color: ..."`, `class="[--mds-chip-icon-color:red]"`: an `--mds-*`
 * that no component promises, in every form the template writes one.
 */
export const noInternalTokens = (element: LintElement, styles: Map<string, StyleInfo>): Finding[] =>
  [...element.customProperties, ...classCustomPropertiesOf(element)].flatMap(({ name, node }) => {
    const message = internalTokenMessage(name, styles.get(name));
    return message ? [{ node, message }] : [];
  });
