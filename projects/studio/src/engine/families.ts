import bundledJson from '@maggioli-design-system/design-tokens/.magma-design-tokensrc.json';
import type {
  ColorConfig,
  MagmaConfig,
} from '@maggioli-design-system/design-tokens/src/lib/color.mjs';
import { hasHueShift } from '@maggioli-design-system/design-tokens/src/lib/hue-shift.mjs';
import { hasSaturation } from '@maggioli-design-system/design-tokens/src/lib/saturation.mjs';
import { semantic } from '@maggioli-design-system/design-tokens/semantic.config';
import { msg, type T } from '../shared/i18n/text.js';
import { groupOf, VARIANTS_GROUP } from './colour-order.js';
import type { ConfigTheme } from './scene-css.js';
import { ACCENT_ROLES, accentOfTheme } from './themes.js';
import type { ThemeChoices } from './theme-choices.js';

/*
  A family of the preset as Colours and Groups read it (#1403, out of app.tsx): a reference or a
  colour of its own, the colour it resolves to, the badge of its row, where each value it does not
  set comes from, whether its contrast scale holds the roles of Magma, and the name a new group may
  take. Pure: no Preact, no state, no document.
*/

/** A reference: a family that follows another instead of solving a ramp (`color` XOR `alias`). */
export const isAlias = (family: Pick<ColorConfig, 'alias'>): boolean =>
  typeof family.alias === 'string' && family.alias.length > 0;

/**
 * The references the preset of Magma ships, the built-in variants: their target changes, their
 * name and their place do not (as the built-in contrast scales are kept).
 */
export const BUILTIN_ALIAS_NAMES: ReadonlySet<string> = new Set(
  (bundledJson as unknown as MagmaConfig).colors.filter(isAlias).map((family) => family.name),
);

/** The colour a swatch shows: its own, or for a reference the one of the family it follows. */
export function resolveBaseColor(config: MagmaConfig, family: ColorConfig): string | undefined {
  if (family.color) return family.color;
  if (!family.alias) return undefined;
  return config.colors.find((one) => one.name === family.alias)?.color;
}

/**
 * What the badge of a row of the list says, and the title of its button: a reference (ref); a hue
 * shift of its own over a global one (hs+, vittorio 2026-11-05); a hue shift, its own or the global
 * one it inherits (hs); then, the same way, a saturation curve (sat+, sat, #1439), the two side by
 * side; nothing.
 */
export function badgeOf(
  t: T,
  config: MagmaConfig,
  family: ColorConfig,
): { label: string; title: string } | undefined {
  if (isAlias(family)) return { label: 'ref', title: `alias -> ${family.alias}` };
  const parts: { label: string; title: string }[] = [];
  if (hasHueShift(family.hueShift) && hasHueShift(config.hueShift))
    parts.push({ label: 'hs+', title: t('hue shifting of its own, over the global one') });
  else if (hasHueShift(family.hueShift ?? config.hueShift))
    parts.push({ label: 'hs', title: t('hue shifting active') });
  if (hasSaturation(family.saturation) && hasSaturation(config.saturation))
    parts.push({ label: 'sat+', title: t('saturation curve of its own, over the global one') });
  else if (hasSaturation(family.saturation ?? config.saturation))
    parts.push({ label: 'sat', title: t('saturation curve active') });
  if (parts.length === 0) return undefined;
  return {
    label: parts.map((part) => part.label).join(' '),
    title: parts.map((part) => part.title).join('; '),
  };
}

/** A preset with no saturation curve, global or of a family: the ramps before the curve. */
export function withoutSaturation(config: MagmaConfig): MagmaConfig {
  const flat = JSON.parse(JSON.stringify(config)) as MagmaConfig;
  delete flat.saturation;
  flat.colors.forEach((family) => delete family.saturation);
  return flat;
}

/**
 * The values a family takes from another entity when it does not set them (studio.object-model.md,
 * section 4, Family, "Stati di un campo", 2026-11-26), and from which, as design-tokens resolves
 * them (`resolveRatiosName`, `resolveFormula`, `resolveExport` of color.mts; the global settings
 * of the configuration for the rest):
 * - the contrast scale and the export from the group, which falls back on the engine (`default`,
 *   no export) when it sets none: the group is where the value is decided;
 * - the formula from the group when the group sets one, else from the preset;
 * - the colorspace, Smooth, the hue shifting and the saturation from the preset.
 */
export type InheritedField =
  'ratios' | 'export' | 'formula' | 'colorspace' | 'smooth' | 'hueShift' | 'saturation';

/** Where an inherited value is decided: a group, by its name, or the preset. */
export type InheritedFrom = { from: 'group'; group: string } | { from: 'preset' };

/** Where a value the family does not set comes from; undefined when the family sets it. */
export function inheritedFrom(
  config: MagmaConfig,
  family: ColorConfig,
  field: InheritedField,
): InheritedFrom | undefined {
  if (family[field] !== undefined) return undefined;
  const group = groupOf(family.name);
  if (field === 'ratios' || field === 'export') return { from: 'group', group };
  if (field === 'formula' && config.groups?.[group]?.formula !== undefined)
    return { from: 'group', group };
  return { from: 'preset' };
}

/** The number of steps the roles of Magma name (semantic `scaleSteps`, ten today). */
export const MAGMA_STEPS: number = semantic.scaleSteps;

/**
 * Whether a contrast scale holds the roles of Magma: as many steps as they name, since they name
 * the steps by number (the surface of a colour is its `09`, its text its `05`; semantic
 * `hueSteps`). Built-in does not mean compatible: `v1` has twenty (GLOSSARY.md, `magma-compatible`).
 */
export const isMagmaCompatible = (steps: readonly unknown[] | undefined): boolean =>
  Array.isArray(steps) && steps.length === MAGMA_STEPS;

/**
 * The groups the engine of design-tokens derives from the families, which a group of families never
 * takes as its name: `DERIVED_GROUPS` of `projects/design-tokens/src/lib/text-role.mts`, which does
 * not export it (families.test.mts holds the two equal).
 */
export const DERIVED_GROUPS: readonly string[] = [
  'surface',
  'border',
  'text',
  'wash',
  'emphasis',
  'inverse',
  'fg',
];

/**
 * A name typed for a group, as the studio writes it: trimmed, in lower case, the spaces turned into
 * hyphens (a name typed faster than chosen is normalised, never refused for its case).
 */
export const groupNameOf = (typed: string): string =>
  typed.trim().toLowerCase().replace(/\s+/g, '-');

/**
 * Why a group cannot take a name, or undefined when it can. The sources:
 * - a family is named `<group>.<name>` (the schema of design-tokens, `^[^.]+\.[^.]+$`), and the
 *   group is the first part of the name of the custom properties of its tokens
 *   (`--<group>-<name>-01`), so a name is a CSS identifier: a letter first, then letters, digits
 *   and hyphens (CSS Syntax, ident-token);
 * - never a group the engine derives (DERIVED_GROUPS above);
 * - `variant` holds the references alone (the dialog New color of today, app.tsx, A1 and A2).
 */
export function groupNameProblem(name: string, kind: 'color' | 'alias'): string | undefined {
  if (!name) return msg('Write the name of the group.');
  if (!/^[a-z][a-z0-9-]*$/.test(name))
    return msg('A letter first, then letters, digits and hyphens: it names the tokens.');
  if (DERIVED_GROUPS.includes(name))
    return msg('The engine makes a group by this name from the families: choose another.');
  if (kind === 'color' && name === VARIANTS_GROUP)
    return msg('The group variant holds references alone.');
  return undefined;
}

/** A theme that uses a family: as its tint, or as one of its accents (`accent`, `ai`). */
export interface ThemeUse {
  theme: string;
  /** `tint`, or the accent role the theme points at the family. */
  as: string;
}

/**
 * The themes of the preset that use a family (studio.object-model.md, section 5, Colours: "i temi
 * che la usano, nominati"): the theme drawn from it, its tint (a theme is keyed by the short name
 * of its family, scene-css.ts), and every theme whose accent points at it, through a variant that
 * is the family or follows it (variant.primary follows brand.maggioli). In the order of the themes,
 * the tint before the accents.
 */
export function themesUsing(
  config: MagmaConfig,
  name: string,
  themes: readonly ConfigTheme[],
  choices: ThemeChoices,
): ThemeUse[] {
  const short = (one: string) => one.split('.')[1] ?? one;
  const variants = [
    name,
    ...config.colors.filter((one) => one.alias === name).map((one) => one.name),
  ]
    .filter((one) => groupOf(one) === VARIANTS_GROUP)
    .map((one) => `variant-${short(one)}`);
  const uses: ThemeUse[] = [];
  for (const theme of themes) {
    if (theme.family === short(name) && groupOf(name) !== VARIANTS_GROUP)
      uses.push({ theme: theme.name, as: 'tint' });
    for (const role of ACCENT_ROLES)
      if (variants.includes(accentOfTheme(theme.family, role, choices)))
        uses.push({ theme: theme.name, as: role });
  }
  return uses;
}

/**
 * The preset with a family solved on a scale: the scale and the formula given, no hue shift of its
 * own (the sample of the page of a scale, its states solved on it).
 */
export function onScale(
  config: MagmaConfig,
  family: string,
  scale: string,
  formula: NonNullable<ColorConfig['formula']>,
): MagmaConfig {
  return {
    ...config,
    colors: config.colors.map((color) =>
      color.name === family ? { ...color, ratios: scale, formula, hueShift: undefined } : color,
    ),
  };
}
