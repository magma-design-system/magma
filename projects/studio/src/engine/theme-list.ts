import { APCAcontrast, sRGBtoY } from 'apca-w3';
import chroma from 'chroma-js';
import type { MagmaConfig } from '@maggioli-design-system/design-tokens/src/lib/color.mjs';
import { createColorTokens } from '@maggioli-design-system/design-tokens/src/lib/color.mjs';
import { ACCENT_FG_STEPS } from '@maggioli-design-system/design-tokens/src/lib/emphasis.js';
import { semantic } from '@maggioli-design-system/design-tokens/semantic.config';
import type { ColorMode } from '@maggioli-design-system/design-tokens/src/lib/theme-manifest.mjs';
import { chromaticOrder, groupOf, VARIANTS_GROUP } from './colour-order.js';
import { isAlias } from './families.js';
import { NO_SURFACE_GROUPS, RESERVED_GROUPS } from './groups.js';
import { scaleOfFamily, themeFamilies } from './scene-css.js';
import {
  givenNamesOf,
  modesOfTheme,
  nameOfTheme,
  SHIPPED_BY_FAMILY,
  themeNameProblem,
  themesExportCss,
} from './themes.js';
import type { ThemeChoices } from './theme-choices.js';

/*
  The themes of a preset as the stage Themes lists them (#1404; themes.tsx until then), with no
  Preact and no state: each theme with what it is (the base, a ready theme Magma ships, a theme of
  the product), the families a theme of the product may take its tint from, and the colours the
  stage samples (the surfaces of a theme, its accents applied), solved by the real generator.
*/

/** What a theme is: the base (`:root`), a ready theme Magma ships, or a theme of the product. */
export type ThemeKind = 'base' | 'ready' | 'product';

export const kindOfTheme = (family: string): ThemeKind =>
  family === semantic.tint ? 'base' : SHIPPED_BY_FAMILY.has(family) ? 'ready' : 'product';

/** A theme of the preset, as the list of the stage shows it. */
export interface ThemeRow {
  /** The family it is drawn from, by its short name (themes are keyed by it, scene-css.ts). */
  family: string;
  /** The family by its full name (`tone.bisque`), for Colours. */
  fullName: string;
  name: string;
  kind: ThemeKind;
  modes: readonly ColorMode[];
  /** Why its name cannot be used, or null: such a theme is not painted nor judged until fixed. */
  nameProblem: string | null;
}

/**
 * The themes of a preset, the base first, then in the order of the configuration: every family
 * that generates surfaces and text, save the status colours (themeFamilies, scene-css.ts). A theme
 * whose name the model refuses is listed too, with why, since the stage is where it is renamed.
 */
export function themeRows(
  config: MagmaConfig,
  color: Record<string, unknown>,
  choices: ThemeChoices,
): ThemeRow[] {
  const { extras, ordered } = themeFamilies(config, color);
  const given = givenNamesOf(extras, choices);
  return ordered.map((family) => {
    const kind = kindOfTheme(family);
    const name = nameOfTheme(family, choices);
    return {
      family,
      fullName: config.colors.find((one) => one.name.split('.')[1] === family)?.name ?? family,
      name,
      kind,
      modes: modesOfTheme(family, choices),
      nameProblem: kind === 'product' ? themeNameProblem(name, family, given) : null,
    };
  });
}

/**
 * The families a theme of the product may take its tint from, by their full names, in the
 * chromatic order of Colours: a family with a colour of its own (a reference follows another), not
 * a status colour (RESERVED_GROUPS: a theme in a status colour would mix with its messages) nor a
 * variant (NO_SURFACE_GROUPS: the variants are references), backing no other theme; the family of
 * the theme first among them, as the current choice.
 */
export function tintChoices(
  config: MagmaConfig,
  themes: readonly ThemeRow[],
  current: string,
): string[] {
  const taken = new Set(themes.map((one) => one.family).filter((one) => one !== current));
  return chromaticOrder(
    config.colors.filter(
      (one) =>
        !isAlias(one) &&
        !RESERVED_GROUPS.has(groupOf(one.name)) &&
        !NO_SURFACE_GROUPS.has(groupOf(one.name)) &&
        groupOf(one.name) !== VARIANTS_GROUP &&
        !taken.has(one.name.split('.')[1]),
    ),
  ).map((one) => one.name);
}

type Mode = 'light' | 'dark';
const MODES: Mode[] = ['light', 'dark'];
type RoleSet = Record<string, { value: string }>;
type FamilyModes = { light: RoleSet; dark: RoleSet };

/** The role sets of the families, per mode, as the generator writes them. */
export interface ThemeSets {
  surfaces: Record<string, FamilyModes>;
  texts: Record<string, FamilyModes>;
  borders: Record<string, FamilyModes>;
  /** The variant families, each with its ramp, its solid fill (`emphasis`) and its base wash. */
  variants: Record<string, FamilyModes>;
  /** The seed of the neutral family per mode: the ink of a solid fill in light. */
  seeds: Record<Mode, string>;
}

/** The colour of a role in a set, black when it is missing. */
export const hexOf = (set: RoleSet | undefined, role: string): string =>
  set?.[role]?.value ?? '#000000';

/** The role sets of a preset and the tree they come from, or why the generator refuses it. */
export function themeSetsOf(config: MagmaConfig): {
  sets: ThemeSets | null;
  color: Record<string, unknown> | null;
  error: string | null;
} {
  try {
    const { tokens } = createColorTokens(JSON.parse(JSON.stringify(config)));
    const color = (tokens as { color: Record<string, unknown> }).color;
    const tones = (color.tone as Record<string, FamilyModes>) ?? {};
    // a variant with the states generated for it (#1427): the rest of its solid fill and its base
    // wash, what --magma-accent-emphasis and --magma-accent-surface name, beside its ramp
    const emphasis = (color.emphasis as Record<string, FamilyModes>) ?? {};
    const wash = (color.wash as Record<string, FamilyModes>) ?? {};
    const variants = Object.fromEntries(
      Object.entries((color.variant as Record<string, FamilyModes>) ?? {}).map(([key, ramp]) => [
        key,
        Object.fromEntries(
          MODES.map((mode) => [
            mode,
            {
              ...ramp[mode],
              ...(emphasis[key] ? { emphasis: emphasis[key][mode].default } : {}),
              ...(wash[key] ? { wash: wash[key][mode].base } : {}),
            },
          ]),
        ) as FamilyModes,
      ]),
    );
    return {
      sets: {
        surfaces: (color.surface as Record<string, FamilyModes>) ?? {},
        texts: (color.text as Record<string, FamilyModes>) ?? {},
        borders: (color.border as Record<string, FamilyModes>) ?? {},
        variants,
        seeds: {
          light: hexOf(tones.neutral?.light, 'seed'),
          dark: hexOf(tones.neutral?.dark, 'seed'),
        },
      },
      color,
      error: null,
    };
  } catch (error) {
    return { sets: null, color: null, error: String(error) };
  }
}

/** APCA Lc as a magnitude: Magma flips the sign per mode, the sample shows the size. */
export const apcaLc = (fg: string, bg: string): number =>
  Math.abs(APCAcontrast(sRGBtoY(chroma(fg).rgb()), sRGBtoY(chroma(bg).rgb())) as number);

/** An accent applied on the surface of a theme, in one mode: what its sample paints. */
export interface AccentSample {
  /** The solid fill and its ink, with their APCA Lc. */
  fill: string;
  ink: string;
  lc: number;
  /** The soft wash and the ink of the accent on a neutral surface. */
  wash: string;
  fg: string;
}

/**
 * How an accent paints on a theme in a mode (#1427, #1496): the fill of its variant with the ink
 * of a fill (the seed in light, the canvas of the theme in dark, spec 6.5), its base wash, and its
 * ink on a neutral surface, a step per mode as the layer generates it.
 */
export function accentSample(
  sets: ThemeSets,
  family: string,
  variant: string,
  mode: Mode,
): AccentSample {
  const ramp = sets.variants[variant.replace('variant-', '')]?.[mode];
  const fill = hexOf(ramp, 'emphasis');
  const ink =
    mode === 'dark' && semantic.onEmphasisDark
      ? hexOf(sets.surfaces[family]?.[mode], semantic.onEmphasisDark)
      : sets.seeds[mode];
  return {
    fill,
    ink,
    lc: Math.round(apcaLc(ink, fill)),
    wash: hexOf(ramp, 'wash'),
    fg: hexOf(ramp, String(Number(ACCENT_FG_STEPS[mode]))),
  };
}

/** The variant families an accent may point at, as the CSS names them (`variant-primary`). */
export const accentChoices = (sets: ThemeSets): string[] =>
  Object.keys(sets.variants).map((key) => `variant-${key}`);

/**
 * The CSS of the themes of a preset, as a theme file of styles takes it: the accents the base
 * theme repoints in `:root`, then the block of each other theme (themesExportCss, printed by the
 * code that writes themes.css). The menu of the exit downloads it (#1404; Copy CSS of the Themes
 * page until then).
 */
export function themesCssOf(config: MagmaConfig, choices: ThemeChoices): string {
  const { tokens } = createColorTokens(JSON.parse(JSON.stringify(config)));
  const color = (tokens as { color: Record<string, unknown> }).color;
  const { extras } = themeFamilies(config, color);
  return themesExportCss(extras, choices, scaleOfFamily(config));
}
