import chroma from "chroma-js";
import chalk from "chalk";
import { APCAcontrast, sRGBtoY } from "apca-w3";
import { DEFAULT_TARGETS } from "./contrast-gate.js";
import type { ColorConfig, ColorTokenSet, MagmaConfig } from "./color.mjs";
import {
  familySurfaceLevels,
  groupOf,
  parseLightness,
  resolveSurfaceOptIn,
  taper,
} from "./surface.mjs";
import { WASH_LEVELS, type WashLevel } from "./wash.js";
import { ACCENT_FG_STEPS, EMPHASIS_STEPS, INVERSE_STEPS } from "./emphasis.js";

/**
 * The colours of the states of a family (#1427): its wash levels, the band of its solid fill and
 * the selected level of its inverse pair. They used to be steps of the family's ramp, named by the
 * semantic layer; they are generated here because no step of a ramp lies where they must:
 *  - a wash sits at a fixed distance from the page (`WASH_LEVELS`), which a ramp solved by
 *    contrast does not follow, and the ramp of an accent generated in HSL is grey there;
 *  - a selected state lies between the rest and the hover, and no step does (#1269).
 * They ship as `--wash-<family>-<level>`, `--emphasis-<family>-<state>` and
 * `--inverse-<family>-selected`, and flip per mode like the surfaces. In Magma 3 the selected
 * states become `color-mix()` of the rest and the hover, with the same look (#918).
 */

type Mode = "light" | "dark";
type StepSet = Record<string, { value: string }>;
type FamilyScales = Record<string, Record<Mode, StepSet>>;
type ColorTree = Record<string, FamilyScales | undefined>;

/**
 * Opt a family into the band of a solid fill (an accent, a status hue): its washes, its text
 * roles and its emphasis band are generated. `{ dark: "lightness" }` also places the band in
 * dark by lightness instead of taking the steps of the ramp (see `createEmphasisTokens`).
 */
export type EmphasisOptIn = boolean | { dark?: "lightness" };

/** The `primary` in `variant.primary`: the family segment of the derived groups. */
export const familyOf = (colorItem: ColorConfig): string => colorItem.name.split(".")[1];

/**
 * The emphasis opt-in that applies to a color: its own, else its group's; `false` opts one family
 * of an opted group back out. Mirrors `resolveSurfaceOptIn`.
 */
export function resolveEmphasisOptIn(
  config: MagmaConfig,
  colorItem: ColorConfig,
): EmphasisOptIn | undefined {
  const own = colorItem.emphasis;
  const inherited = config.groups?.[groupOf(colorItem)]?.emphasis;
  const resolved = own === undefined ? inherited : own;
  return resolved === undefined || resolved === false ? undefined : resolved;
}

/**
 * The key colour of a family: its own `color`, or the one of the family it aliases (an alias
 * carries none: `variant.primary` is `brand.maggioli`).
 */
export function keyColorOf(config: MagmaConfig, colorItem: ColorConfig): string {
  const seen = new Set<string>();
  let current: ColorConfig | undefined = colorItem;
  while (current && !current.color && current.alias && !seen.has(current.name)) {
    seen.add(current.name);
    const target = current.alias;
    current = config.colors.find((one) => one.name === target);
  }
  if (!current?.color) {
    throw new Error(`state-color: "${colorItem.name}" resolves to no key colour`);
  }
  return current.color;
}

/** Every family that has washes: the ones with surfaces (tints, status hues) and the accents. */
export function washedColors(config: MagmaConfig): ColorConfig[] {
  return config.colors.filter(
    (one) =>
      !one.disabled &&
      (resolveSurfaceOptIn(config, one) !== undefined ||
        resolveEmphasisOptIn(config, one) !== undefined),
  );
}

/** APCA Lc as a magnitude, as the contrast gate measures it. */
const apcaLc = (fg: string, bg: string): number =>
  Math.abs(APCAcontrast(sRGBtoY(chroma(fg).rgb()), sRGBtoY(chroma(bg).rgb())) as number);

const oklchOf = (hex: string): [number, number, number] => {
  const [l, c, h] = chroma(hex).oklch();
  return [l, Number.isNaN(c) ? 0 : c, h];
};

/**
 * The OKLCH midpoint of two colours: lightness and chroma halfway, the hue halfway along the
 * shorter arc; an achromatic end takes the hue of the other. The selected state of a band.
 */
export function midpoint(a: string, b: string): string {
  const [l1, c1, h1] = oklchOf(a);
  const [l2, c2, h2] = oklchOf(b);
  let hue = 0;
  if (Number.isNaN(h1) && !Number.isNaN(h2)) hue = h2;
  else if (!Number.isNaN(h1) && Number.isNaN(h2)) hue = h1;
  else if (!Number.isNaN(h1) && !Number.isNaN(h2)) {
    let delta = h2 - h1;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    hue = h1 + delta / 2;
  }
  return chroma.oklch((l1 + l2) / 2, (c1 + c2) / 2, hue).hex();
}

/**
 * An OKLCH colour as a hex in the sRGB gamut, keeping its lightness and hue: out of the gamut the
 * chroma is reduced until it fits (the gamut mapping of CSS Color 4, by chroma at a fixed
 * lightness). Clipping the channels instead moves the lightness, by 0.6 for a wash of the error
 * hue, and the lightness is what places a wash (#1427).
 */
export function oklchInGamut(lightness: number, chromaValue: number, hue: number): string {
  const fits = (c: number) => !chroma.oklch(lightness, c, hue).clipped();
  if (fits(chromaValue)) return chroma.oklch(lightness, chromaValue, hue).hex();
  let low = 0;
  let high = chromaValue;
  for (let i = 0; i < 24; i++) {
    const mid = (low + high) / 2;
    if (fits(mid)) low = mid;
    else high = mid;
  }
  return chroma.oklch(lightness, low, hue).hex();
}

/**
 * One colour placed by lightness in both modes, from a key colour: the lightness given per mode,
 * the hue of the key, the chroma of the key times the taper of the PALER end, `min(taper(L
 * light), taper(L dark))`. The taper of `surface.mts` is symmetric around L 0.5, so the dark end
 * alone would give a dark wash almost the full chroma of the key: the brick of the board of
 * mds-button (#1427). Bounded by the paler end, a colour carries the same chroma in both modes.
 */
export function pairByLightness(
  keyColor: string,
  lightness: Record<Mode, number>,
): Record<Mode, string> {
  const [, keyChroma, keyHue] = oklchOf(keyColor);
  const hue = Number.isNaN(keyHue) ? 0 : keyHue;
  const c = keyChroma * Math.min(taper(lightness.light), taper(lightness.dark));
  return {
    light: oklchInGamut(lightness.light, c, hue),
    dark: oklchInGamut(lightness.dark, c, hue),
  };
}

/**
 * The washes of every family that has them (`washedColors`): each level of `WASH_LEVELS` at its
 * distance from the page of the family (`theme.surfaces.<mode>.default`), below it in light and
 * mirrored above it in dark, so a wash weighs the same in both modes.
 */
export function createWashTokens(config: MagmaConfig): Record<string, ColorTokenSet> {
  const wash: Record<string, ColorTokenSet> = {};
  if (config.theme === undefined) return wash;
  washedColors(config).forEach((colorItem) => {
    const levels = familySurfaceLevels(config, colorItem)!;
    const page = {
      light: parseLightness(levels.light.default),
      dark: parseLightness(levels.dark.default),
    };
    const key = keyColorOf(config, colorItem);
    const set: ColorTokenSet = { light: {}, dark: {} };
    (Object.entries(WASH_LEVELS) as [WashLevel, number][]).forEach(([level, distance]) => {
      const pair = pairByLightness(key, {
        light: page.light - distance / 100,
        dark: page.dark + distance / 100,
      });
      set.light[level] = { value: pair.light };
      set.dark[level] = { value: pair.dark };
    });
    console.info(`Creating ${chalk.cyan("wash")} ${familyOf(colorItem)}`);
    wash[familyOf(colorItem)] = set;
  });
  return wash;
}

/** A step of a family's ramp in the tree: `04` is keyed `4`. */
const stepOf = (scale: Record<Mode, StepSet>, mode: Mode, step: string): string => {
  const value = scale[mode]?.[String(Number(step))]?.value;
  if (!value) throw new Error(`state-color: no step ${step} (${mode}) in the ramp`);
  return value;
};

export interface StateTokens {
  /** family -> { light, dark } emphasis band: default, hover, active, selected */
  emphasis: Record<string, ColorTokenSet>;
  /** family -> { light, dark } inverse pair: selected */
  inverse: Record<string, ColorTokenSet>;
  /** accent family -> { light, dark } ink on a neutral surface: default (#1496) */
  fg: Record<string, ColorTokenSet>;
}

/**
 * The band of the solid fill of every family that opts into it (`emphasis`), and the selected
 * level of the inverse pair of every other family with surfaces (a tint: neutral, porcelain...).
 *
 * The band takes the steps of `EMPHASIS_STEPS` from the family's ramp, plus `selected` at the
 * midpoint of the rest and the hover. A family opted with `{ dark: "lightness" }` places the
 * band in dark by lightness instead: each state at the lightness of its dark step, with the hue
 * of the key and the chroma of the washes (`pairByLightness` on the lightness of the step in
 * both modes). Criterion: the ramp of the brand accent, generated in HSL (`smooth`), puts its
 * dark band at L 84-89 with chroma 0.015-0.031, a grey fill (#1427); placed by lightness the rest
 * is `#accaff`, C 0.082, and its ink keeps Lc 70.7 on it, over the floor of the gate in dark. The
 * AI accent keeps its ramp: its dark band is coloured already (C 0.085), and placed by lightness
 * its ink would fall to Lc 69.5.
 *
 * The ink of a fill in dark is the page (`onEmphasisDark` of semantic.config, #739), and the page
 * is the one of the active theme: placed at the lightness of its step, the rest of
 * `variant.secondary` kept Lc 70.2 on the neutral page and 69.2 on the bisque page of editorial.
 * So a state placed by lightness rises, from the lightness of its step, until its ink keeps the
 * floor of the gate in dark (`DEFAULT_TARGETS.onEmphasis.dark`) on the page of every tint, as
 * the text-role engine holds a text to its floor on every surface it can sit on.
 */
export function createEmphasisTokens(config: MagmaConfig, tree: ColorTree): StateTokens {
  const emphasis: Record<string, ColorTokenSet> = {};
  const inverse: Record<string, ColorTokenSet> = {};
  const fg: Record<string, ColorTokenSet> = {};
  // the pages a fill can sit on in dark, which are its ink: the page of every tint
  const darkPages = washedColors(config)
    .filter((one) => resolveEmphasisOptIn(config, one) === undefined)
    .map((one) => tree.surface?.[familyOf(one)]?.dark?.default?.value)
    .filter((value): value is string => Boolean(value));
  const floor = DEFAULT_TARGETS.onEmphasis.dark;
  const keepsFloor = (fill: string) =>
    darkPages.every((page) => Math.round(apcaLc(page, fill) * 10) / 10 >= floor);
  washedColors(config).forEach((colorItem) => {
    const family = familyOf(colorItem);
    const scale = tree[groupOf(colorItem)]?.[family];
    if (!scale) throw new Error(`state-color: no ramp for "${colorItem.name}"`);
    const optIn = resolveEmphasisOptIn(config, colorItem);

    if (optIn === undefined) {
      // a tint: only the selected level of its inverse pair
      const set: ColorTokenSet = { light: {}, dark: {} };
      (["light", "dark"] as Mode[]).forEach((mode) => {
        set[mode].selected = {
          value: midpoint(
            stepOf(scale, mode, INVERSE_STEPS.default),
            stepOf(scale, mode, INVERSE_STEPS.muted),
          ),
        };
      });
      inverse[family] = set;
      return;
    }

    const byLightness = typeof optIn === "object" && optIn.dark === "lightness";
    const key = keyColorOf(config, colorItem);
    const set: ColorTokenSet = { light: {}, dark: {} };
    // a state placed by lightness in dark: from the lightness of its step, up until its ink keeps
    // the floor on every page (a fill in dark is lighter than its ink, so lighter is more contrast)
    const placed = (light: string, dark: string): string => {
      const lightL = chroma(light).oklch()[0];
      let darkL = chroma(dark).oklch()[0];
      let fill = pairByLightness(key, { light: lightL, dark: darkL }).dark;
      while (!keepsFloor(fill) && darkL < 1) {
        darkL = Math.min(1, darkL + 0.001);
        fill = pairByLightness(key, { light: lightL, dark: darkL }).dark;
      }
      return fill;
    };
    Object.entries(EMPHASIS_STEPS).forEach(([state, step]) => {
      const light = stepOf(scale, "light", step);
      const dark = stepOf(scale, "dark", step);
      set.light[state] = { value: light };
      set.dark[state] = { value: byLightness ? placed(light, dark) : dark };
    });
    (["light", "dark"] as Mode[]).forEach((mode) => {
      set[mode].selected = { value: midpoint(set[mode].default.value, set[mode].hover.value) };
    });
    console.info(`Creating ${chalk.magenta("emphasis")} ${family}`);
    emphasis[family] = set;

    // an accent (a solid fill with no surfaces of its own, as text-role.mts reads it): its ink on
    // a neutral surface takes the step of ACCENT_FG_STEPS in each mode (#1496)
    if (!tree.surface?.[family]) {
      fg[family] = {
        light: { default: { value: stepOf(scale, "light", ACCENT_FG_STEPS.light) } },
        dark: { default: { value: stepOf(scale, "dark", ACCENT_FG_STEPS.dark) } },
      };
    }
  });
  return { emphasis, inverse, fg };
}
