import type { MagmaConfig } from '@maggioli-design-system/design-tokens/src/lib/color.mjs';
import type { ColorMode } from '@maggioli-design-system/design-tokens/src/lib/theme-manifest.mjs';
import { nearestColorName } from './color-names.js';
import type { ThemeChoices } from './theme-choices.js';
import { SHIPPED_BY_FAMILY } from './themes.js';

/*
  What the opening opens (#1402, studio.object-model.md, section 5, Opening), pure: no Preact, no
  state. The opening starts from Magma's preset, a preset of a project, a ready theme or a brand
  colour; the last two add a theme of the product to Magma's preset (vittorio, 2026-11-27, on the
  renders: "a theme of the product", "a theme from the colour"):

  - from a ready theme (business, editorial): a copy of the family of its tint, its own family, so
    the product changes it without touching the ready theme, with the accents and the modes of the
    ready theme; the theme named `my-<ready theme>`, renamed on the Themes page (one click, the
    name given by the studio);
  - from a brand colour: the colour as a family of the `brand` group, a `variant` that points at it
    (an accent always points at a variant, semantic.config.ts), and a theme of the product drawn
    from a copy of the tint of business, its accent on that variant, named `my-brand`. The
    candidates of a brand colour, alternatives generated and measured, are new work of the engine,
    left to an issue of their own.

  The copy of a tint stays a neutral, in the `tone` group, so it inherits its scale, its formula and
  its export. Its short name is its own, from the name of its theme with no hyphen: the themes and
  their surfaces are keyed by the short name of the family (scene-css.ts, the surface tree of the
  generator), so `product.bisque` would meet `tone.bisque`, and a hyphen in the name of a family
  with surfaces keeps the gate from resolving its text roles (found in #1400, `neutral-copy`).
*/

/** A theme Magma ships that a product may start from: its name, its tint, its accents, its modes. */
export interface ReadyTheme {
  name: string;
  /** The short name of the family of its tint, as the themes key it: `bisque`. */
  tint: string;
  /** Accent role -> the variant it points at, beyond the base: `{ accent: 'variant-secondary' }`. */
  accents: Record<string, string>;
  modes: readonly ColorMode[];
}

/** The ready themes, in the order Magma ships them (semantic.config.ts), the deprecated ones out. */
export const READY_THEMES: readonly ReadyTheme[] = [...SHIPPED_BY_FAMILY.entries()].map(
  ([tint, { name, accents, modes }]) => ({ name, tint, accents, modes }),
);

type Family = MagmaConfig['colors'][number];

/** The family of a configuration by its short name (`bisque` -> `tone.bisque`), if it has one. */
export const familyByShortName = (config: MagmaConfig, short: string): Family | undefined =>
  config.colors.find((one) => one.name.split('.')[1] === short);

/** The colour a family shows: its own, else the one of the family it is an alias of. */
export function baseColourOf(config: MagmaConfig, name: string): string | undefined {
  const seen = new Set<string>();
  let family = config.colors.find((one) => one.name === name);
  while (family && !family.color && family.alias && !seen.has(family.name)) {
    seen.add(family.name);
    family = config.colors.find((one) => one.name === family!.alias);
  }
  return family?.color;
}

/** `base`, else `base2`, `base3`... : the first not taken. */
function free(base: string, taken: (name: string) => boolean, joiner = ''): string {
  if (!taken(base)) return base;
  let n = 2;
  while (taken(`${base}${joiner}${n}`)) n += 1;
  return `${base}${joiner}${n}`;
}

/** The short names of the families of a configuration, in any group. */
const shortNames = (config: MagmaConfig): Set<string> =>
  new Set(config.colors.map((one) => one.name.split('.')[1]));

/** The names of the themes taken: those Magma ships and those the person gave. */
const themeNames = (choices: ThemeChoices): Set<string> =>
  new Set([...READY_THEMES.map(({ name }) => name), ...Object.values(choices.names)]);

/** What an opening that adds a theme hands back: the preset, and the family to select. */
export interface Opened {
  config: MagmaConfig;
  choices: ThemeChoices;
  /** The family the work goes on, in Colours: the copy of the tint, or the brand colour. */
  family: string;
}

/**
 * Adds a theme of the product to a preset: a copy of the family of `tint` in the `tone` group, its
 * name from the theme with no hyphen, and the choices of its theme (name, accents, modes). Returns
 * the full name of the copy, or undefined when the preset has no family of that tint.
 */
function addProductTheme(
  config: MagmaConfig,
  choices: ThemeChoices,
  { tint, name, accents, modes }: ReadyTheme,
): string | undefined {
  const source = familyByShortName(config, tint);
  if (!source) return undefined;
  const themeName = free(name, (one) => themeNames(choices).has(one), '-');
  const short = free(themeName.replace(/-/g, ''), (one) => shortNames(config).has(one));
  const copy: Family = { ...JSON.parse(JSON.stringify(source)), name: `tone.${short}` };
  // a reference keeps following its source; the copy is a family of its own, with its colour
  if (!copy.color && copy.alias) {
    copy.color = baseColourOf(config, source.name) as Family['color'];
    delete copy.alias;
  }
  // the scale of its group of before, written, when the copy leaves it for tone
  const group = source.name.split('.')[0];
  const groupRatios = config.groups?.[group]?.ratios;
  if (group !== 'tone' && !copy.ratios && groupRatios) copy.ratios = groupRatios;
  copy.surface = true;
  config.colors.push(copy);
  choices.names[short] = themeName;
  if (Object.keys(accents).length) choices.accents[short] = { ...accents };
  choices.modes[short] = [...modes];
  return copy.name;
}

/** A copy of its own, that later edits leave alone. */
function copyOf<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/** Magma's preset with a theme of the product drawn from a ready theme. */
export function fromReadyTheme(
  preset: MagmaConfig,
  choices: ThemeChoices,
  ready: ReadyTheme,
): Opened | undefined {
  const config = copyOf(preset);
  const next = copyOf(choices);
  const family = addProductTheme(config, next, { ...ready, name: `my-${ready.name}` });
  return family ? { config, choices: next, family } : undefined;
}

/**
 * Magma's preset with a brand colour: the colour as `brand.<its name>` (the name of the colour, as
 * Colours names a new family), a `variant.<the same name>` that points at it, and a theme of the
 * product drawn from a copy of the tint of the base theme, its accent on that variant.
 */
export function fromBrandColour(
  preset: MagmaConfig,
  choices: ThemeChoices,
  hex: string,
): Opened | undefined {
  const config = copyOf(preset);
  const next = copyOf(choices);
  const named = nearestColorName(hex) || 'brand';
  const short = free(named, (one) => shortNames(config).has(one), '-');
  const brand = `brand.${short}`;
  config.colors.push({ name: brand, color: hex } as Family);
  config.colors.push({ name: `variant.${short}`, alias: brand } as Family);
  const base = READY_THEMES[0];
  const themed = addProductTheme(config, next, {
    ...base,
    name: 'my-brand',
    accents: { ...base.accents, accent: `variant-${short}` },
  });
  return themed ? { config, choices: next, family: brand } : undefined;
}
