import {
  BackgroundColor,
  Color,
  InterpolationColorspace,
  Theme,
  type ContrastColor,
  type ContrastColorBackground,
  type RgbHexColor,
} from "./leonardo/index.js";
import chalk from "chalk";
import DEFAULTS from "../config/default-color.json" with { type: "json" };
import { deepMerge } from "./deep-merge.mjs";
import {
  groupStepsByAngle,
  hasHueShift,
  rotateHue,
  type HueShiftConfig,
  type ThemeMode,
} from "./hue-shift.mjs";
import { DesignToken, DesignTokens } from "style-dictionary";
import {
  createSurfaceTokens,
  type SurfaceOptIn,
  type ThemeConfig,
} from "./surface.mjs";
import { createTextTokens } from "./text-role.mjs";
import {
  hasSaturation,
  resolveStepSaturation,
  saturateContrastColor,
  type SaturationConfig,
} from "./saturation.mjs";
import {
  createEmphasisTokens,
  createWashTokens,
  type EmphasisOptIn,
} from "./state-color.mjs";
import { validateRatioScale } from "./contrast-range.js";
export interface SeedConfig {
  light: RgbHexColor;
  dark: RgbHexColor;
}
export interface ColorConfig {
  /**
   * Base color the palette is solved from. A family provides EITHER `color` (its
   * own palette) OR `alias` (a reference to another family); the config schema
   * enforces the XOR, so alias entries carry no `color` at runtime.
   */
  color: RgbHexColor;
  export?: string[];
  name: string;
  seed?: SeedConfig;
  disabled?: boolean;
  title?: string;
  /**
   * Reference another family as a `<group>.<name>` path (e.g. `brand.maggioli`)
   * instead of solving a palette: this family re-exports the source's already
   * resolved scale under its own name (a single-source alias). Mutually
   * exclusive with `color`.
   */
  alias?: string;
  ratios?: string;
  formula?: Formula;
  colorspace?: InterpolationColorspace;
  smooth?: boolean;
  hueShift?: HueShiftConfig;
  /**
   * The saturation curve of this family's scale (saturation.mts), over the global one: the
   * relative saturation of its darkest and lightest steps raised or lowered, the contrast kept.
   */
  saturation?: SaturationConfig;
  /**
   * Opt this family into lightness-based surface + border generation
   * (see surface.mts). `true` uses the global `theme` ramp; an object
   * overrides the levels per family.
   */
  surface?: SurfaceOptIn;
  /**
   * Opt this family into the band of a solid fill: washes, text roles and the emphasis band
   * (see state-color.mts); `{ dark: "lightness" }` places the band in dark by lightness.
   * Overrides the group's.
   */
  emphasis?: EmphasisOptIn;
}

export interface ColorTokenValue {
  value: string;
}

export interface ColorTokenSet {
  light: Record<string, ColorTokenValue>;
  dark: Record<string, ColorTokenValue>;
}

export interface ExportGroupTokens {
  // color: Record<string, Record<string, ColorTokenSet>>;
   [key: string]: DesignTokens | DesignToken;
}
export type ExportGroups = Record<string, ExportGroupTokens>;

export type Formula = "wcag2" | "wcag3";
export type RatioData = { [key: string]: number[] };

/**
 * Settings shared by every color of a token group (the part before the
 * dot in a color name). Per-color fields still win over these.
 */
export interface GroupConfig {
  ratios?: string;
  formula?: Formula;
  export?: string[];
  /**
   * Opt the WHOLE group into surface + border + text generation. The per-color
   * `surface` still wins over this (an object tunes one family's levels, an
   * explicit `false` opts that family back out), so the group is a default and
   * not a lock. Resolved by `resolveSurfaceOptIn` in surface.mts.
   *
   * This is the group-level counterpart of the per-color flag: `status` opts in
   * as a group because every status family needs a tinted surface with text
   * guaranteed legible on it, whereas `tone` stays per-family - there only the
   * tints meant to be THEMES opt in.
   */
  surface?: SurfaceOptIn;
  /**
   * Opt the WHOLE group into the band of a solid fill (state-color.mts): `status` and
   * `variant`, the families the status hues and the accents are painted with. The per-color
   * `emphasis` wins, as for `surface`.
   */
  emphasis?: EmphasisOptIn;
}

export interface MagmaConfig {
  colorspace?: string;
  smooth?: boolean;
  formula?: Formula;
  hueShift?: HueShiftConfig;
  /** The saturation curve of every scale; a family's own one overrides it (saturation.mts). */
  saturation?: SaturationConfig;
  ratios?: { [K in Formula]: RatioData };
  groups?: Record<string, GroupConfig>;
  /**
   * Global lightness ramp for surface + border generation (OKLCH). Shared by
   * every family that opts in via `surface`; see surface.mts.
   */
  theme?: ThemeConfig;
  colors: ColorConfig[];
}

export type ThemeContrastColor = [ContrastColorBackground, ...ContrastColor[]];
export type ColorTokensMap = Record<string, Record<string, ColorTokenSet>>;

export interface ColorTokens {
  // color: ColorTokensMap;
  [key: string]: DesignTokens | DesignToken;
}

function getBackgroundColor(
  config: MagmaConfig,
  formula: Formula = "wcag3",
): BackgroundColor {
  return new BackgroundColor({
    colorKeys: ["#000000"],
    colorspace: config.colorspace as InterpolationColorspace,
    name: "background",
    ratios: config.ratios![formula].tone,
    smooth: config.smooth,
  });
}

export function formatColortoTokens(
  contrastColors: ContrastColor[],
  colorName: string,
  colorValue: RgbHexColor,
  seed?: SeedConfig,
  colorMode?: keyof SeedConfig,
) {
  const palette: { [key: string]: { value: string } } = {};

  contrastColors.forEach((element) => {
    if (element.name === colorName) {
      const paletteSource = element.values;
      paletteSource.toReversed().forEach((element, index) => {
        let codeIndex = 0;
        codeIndex = index + 1;

        const colorCode = codeIndex;
        palette[colorCode] = { value: element.value };

        if (paletteSource.length === index + 1) {
          // A color with a seed emits an explicit off-scale `-seed` token (issue
          // #572): the palette key `seed` flows through the `leadZero` else-branch
          // of every template as `--<group>-<name>-seed`. Without a seed the bare
          // `--<group>-<name>` base token stays (the brand anchor).
          if (seed !== undefined && colorMode !== undefined) {
            palette.seed = { value: seed[colorMode] };
          } else {
            palette.color = { value: colorValue };
          }
        }
      });
    }
  });
  return palette;
}

function groupOf(colorItem: ColorConfig, config: MagmaConfig): GroupConfig {
  return config.groups?.[colorItem.name.split(".")[0]] ?? {};
}

/**
 * Resolution order: color, then its group, then the config root, falling
 * back to the built-in default so the helper also works on raw (unmerged)
 * configurations.
 */
export function resolveFormula(
  colorItem: ColorConfig,
  config: MagmaConfig,
): Formula {
  return (
    colorItem.formula ??
    groupOf(colorItem, config).formula ??
    config.formula ??
    (DEFAULTS.formula as Formula)
  );
}

/** Resolution order: color, then its group, then the default scale. */
export function resolveRatiosName(
  colorItem: ColorConfig,
  config: MagmaConfig,
): string {
  return colorItem.ratios ?? groupOf(colorItem, config).ratios ?? "default";
}

/**
 * Export groups a color belongs to. A per-color `export` overrides the
 * group default entirely (it is not merged), matching how ratios/formula
 * resolve; undefined means the color is not exported to any group file.
 */
export function resolveExport(
  colorItem: ColorConfig,
  config: MagmaConfig,
): string[] | undefined {
  return colorItem.export ?? groupOf(colorItem, config).export;
}

// resolveRatios runs once per color per mode; warn about a given scale only
// once per process so out-of-range targets surface without spamming the log
const warnedRatioScales = new Set<string>();

export function resolveRatios(
  colorItem: ColorConfig,
  config: MagmaConfig,
): number[] {
  const formula = resolveFormula(colorItem, config);
  const scaleName = resolveRatiosName(colorItem, config);
  const scale = config.ratios?.[formula]?.[scaleName];
  if (scale === undefined) {
    const available = Object.keys(config.ratios?.[formula] ?? {}).join(", ") || "none";
    throw new Error(
      `Color "${colorItem.name}" references the ratios scale "${scaleName}" for formula "${formula}", which is not defined. Available scales: ${available}.`,
    );
  }

  // Flag targets outside the formula's usable band (issue #578) so they are
  // caught instead of silently clamping to a pure extreme.
  const warnKey = `${formula}:${scaleName}`;
  if (!warnedRatioScales.has(warnKey)) {
    // only truly out-of-range targets are logged; near-ceiling (info) is left
    // to the band the studio shows so normal scales (top step ~102) do not spam
    const issues = validateRatioScale(scale, formula).filter(
      (issue) => issue.severity === "warn",
    );
    if (issues.length > 0) {
      warnedRatioScales.add(warnKey);
      console.warn(
        chalk.yellow(
          `Ratio scale "${scaleName}" (${formula}) has out-of-range targets:\n` +
            issues
              .map((issue) => `  step ${issue.index + 1} (${issue.value}): ${issue.message}`)
              .join("\n"),
        ),
      );
    }
  }

  return scale;
}

export function createColor(
  colorItem: ColorConfig,
  config: MagmaConfig,
): Color {
  return new Color({
    colorKeys: [colorItem.color],
    colorspace:
      colorItem.colorspace !== undefined
        ? colorItem.colorspace
        : (config.colorspace as InterpolationColorspace),
    name: colorItem.name,
    ratios: resolveRatios(colorItem, config),
    smooth: colorItem.smooth ?? config.smooth,
  });
}

export interface ColorVariant {
  color: Color;
  /** Indices into the resolved ratios array covered by this variant. */
  stepIndices: number[];
}

/**
 * Expand a config color into the Leonardo colors needed for one theme mode.
 *
 * Without hue shift this is a single color covering the whole ratio scale,
 * exactly as before. With hue shift, steps are grouped by effective hue
 * rotation and each group becomes a virtual color whose seed is the base
 * color rotated in OKLCH before scale generation, so every step is still
 * contrast-solved by Leonardo on its own scale and the target ratios are
 * preserved by construction.
 */
export function createColorVariants(
  colorItem: ColorConfig,
  config: MagmaConfig,
  mode: ThemeMode,
): ColorVariant[] {
  const ratios = resolveRatios(colorItem, config);
  const hueShift = colorItem.hueShift ?? config.hueShift;

  if (!hasHueShift(hueShift)) {
    return [
      {
        color: createColor(colorItem, config),
        stepIndices: ratios.map((_, index) => index),
      },
    ];
  }

  const colorspace =
    colorItem.colorspace !== undefined
      ? colorItem.colorspace
      : (config.colorspace as InterpolationColorspace);
  const smooth = colorItem.smooth ?? config.smooth;

  return groupStepsByAngle(hueShift!, ratios.length, mode).map(
    (group, index) => ({
      color: new Color({
        colorKeys: [rotateHue(colorItem.color, group.angle)],
        colorspace,
        name:
          group.angle === 0
            ? colorItem.name
            : `${colorItem.name}__hs${index}`,
        ratios: group.stepIndices.map((stepIndex) => ratios[stepIndex]),
        smooth,
      }),
      stepIndices: group.stepIndices,
    }),
  );
}

/**
 * Reassemble the full ratio scale of a config color from the theme results
 * of its variants, restoring the original step order.
 */
export function assembleContrastColor(
  contrastColors: ContrastColor[],
  variants: ColorVariant[],
  colorName: string,
): ContrastColor {
  const values: ContrastColor["values"] = [];
  variants.forEach(({ color, stepIndices }) => {
    const entry = contrastColors.find((element) => element.name === color.name);
    if (entry === undefined) {
      throw new Error(
        `Missing theme result for color variant "${color.name}" of "${colorName}"`,
      );
    }
    entry.values.forEach((value, index) => {
      values[stepIndices[index]] = value;
    });
  });
  return { name: colorName, values };
}

/**
 * Create color tokens from co
 * @param magmaConfig
 * @returns
 */
export function createColorTokens(magmaConfig: MagmaConfig) {
  // deepMerge mutates its target: merge into a clone so the module-level
  // DEFAULTS are never contaminated and repeated calls stay independent
  const config = deepMerge(
    structuredClone(DEFAULTS) as unknown as Record<string, unknown>,
    magmaConfig as unknown as Record<string, unknown>,
  ) as unknown as MagmaConfig;

  const palette: { [key: string]: { light: Color[]; dark: Color[] } } = {
    wcag2: { light: [], dark: [] },
    wcag3: { light: [], dark: [] },
  };
  // per formula and mode, the variants covering each config color
  const variants: {
    [key: string]: { light: ColorVariant[]; dark: ColorVariant[] };
  } = {};
  config.colors.forEach((element) => {
    // alias entries reference another family and generate no palette of their own
    if (element.alias) return;
    const formula = resolveFormula(element, config);
    const light = createColorVariants(element, config, "light");
    // hue shift sides are anchored to physical lightness, so the two theme
    // modes need different groupings; without hue shift the same Leonardo
    // color (and its lazily generated scale) is shared by both themes
    const dark = hasHueShift(element.hueShift ?? config.hueShift)
      ? createColorVariants(element, config, "dark")
      : light;
    palette[formula].light.push(...light.map((variant) => variant.color));
    palette[formula].dark.push(...dark.map((variant) => variant.color));
    variants[element.name] = { light, dark };
  });

  const backgroundColor = getBackgroundColor(config);
  const backgroundColorWcag2 = getBackgroundColor(config, "wcag2");

  // it doesnt matter backgroundColor color in this case because the lightness is 100 or 0
  // so the background color is basically #ffffff for light theme and #000000 for dark theme
  // create four theme, light and dark for each contrast type wcag
  const themeLight = new Theme({
    colors: palette.wcag3.light,
    backgroundColor,
    lightness: 100,
    formula: "wcag3",
  });

  const themeDark = new Theme({
    colors: palette.wcag3.dark,
    backgroundColor,
    lightness: 0,
    formula: "wcag3",
  });

  const themeToneLight = new Theme({
    colors: palette.wcag2.light,
    backgroundColor: backgroundColorWcag2,
    lightness: 100,
  });

  const themeToneDark = new Theme({
    colors: palette.wcag2.dark,
    backgroundColor: backgroundColorWcag2,
    lightness: 0,
  });

  const theme = {
    wcag2: {
      light: themeToneLight,
      dark: themeToneDark,
    },
    wcag3: {
      light: themeLight,
      dark: themeDark,
    },
  };

  console.info("Formatting color palette to JSON Design Tokens format");

  const tokens: ColorTokens = {
    color: {},
  };

  const exportGroups: ExportGroups = {};

  config.colors.forEach((element) => {
    const groupIndex = 0;
    const nameIndex = 1;
    const group = element.name.split(".")[groupIndex];
    const name = element.name.split(".")[nameIndex];

    // alias entries carry no palette: RESERVE their tree + export slot here so the
    // config order is preserved, then fill the values from the source family in the
    // post-pass below (reassigning a reserved key keeps its insertion position).
    if (element.alias && !element.disabled) {
      if (!Object.hasOwn(tokens.color, group)) tokens.color[group] = {};
      tokens.color[group][name] = {};
      const exportTargets = resolveExport(element, config);
      if (exportTargets !== undefined) {
        exportTargets.forEach((exportElement) => {
          if (exportGroups[exportElement] === undefined) {
            exportGroups[exportElement] = { color: {} };
          }
          if (exportGroups[exportElement].color[group] === undefined) {
            exportGroups[exportElement].color[group] = {};
          }
          exportGroups[exportElement].color[group][name] = {};
        });
      }
      return;
    }

    if (!element.disabled) {
      if (!Object.hasOwn(tokens.color, group)) {
        console.info(`Creating ${chalk.magenta("group")} ${group}`);
        tokens.color[group] = {};
      }
      if (!Object.hasOwn(tokens.color[group], name)) {
        console.info(`Creating ${chalk.blue("color")} ${name}`);
        const formula = resolveFormula(element, config);
        const saturation = element.saturation ?? config.saturation;
        // the scale of a mode as Leonardo solved it, then its saturation curve, if any: each step
        // moved toward the most vivid or toward grey, at the contrast of its target (saturation.mts)
        const scaleOf = (mode: ThemeMode): ContrastColor => {
          const [background, ...contrastColors] = theme[formula][mode].contrastColors as [
            ContrastColorBackground,
            ...ContrastColor[],
          ];
          const scale = assembleContrastColor(
            contrastColors,
            variants[element.name][mode],
            `${group}.${name}`,
          );
          if (!hasSaturation(saturation)) return scale;
          return saturateContrastColor(
            scale,
            resolveStepSaturation(saturation!, scale.values.length, mode),
            String(background.background),
            formula,
            element.color,
          );
        };
        tokens.color[group][name] = {
          light: formatColortoTokens(
            [scaleOf("light")],
            `${group}.${name}`,
            element.color,
            element.seed,
            "light",
          ),
          dark: formatColortoTokens(
            [scaleOf("dark")],
            `${group}.${name}`,
            element.color,
            element.seed,
            "dark",
          ),
        };
      }

      const exportTargets = resolveExport(element, config);
      if (exportTargets !== undefined) {
        exportTargets.forEach((exportElement) => {
          if (exportGroups[exportElement] === undefined) {
            exportGroups[exportElement] = { color: {} };
          }
          if (exportGroups[exportElement].color[group] === undefined) {
            exportGroups[exportElement].color[group] = {};
          }
          exportGroups[exportElement].color[group][name] = {
            light: tokens.color[group][name].light,
            dark: tokens.color[group][name].dark,
          };
        });
      }
    }
  });

  // Alias families (e.g. variant.primary -> brand.maggioli) are REFERENCES, not
  // their own palette: they carry no `color` and solve nothing. Instead they
  // re-export the source family's already-built (resolved) subtree under their
  // own name. Runs AFTER the main loop so the source is present, and copies the
  // resolved tree so contrast-gate/figma keep seeing hex, never a reference.
  config.colors.forEach((element) => {
    if (!element.alias || element.disabled) return;
    const [group, name] = element.name.split(".");
    const [srcGroup, srcName] = element.alias.split(".");
    const source = tokens.color[srcGroup]?.[srcName];
    if (source === undefined) {
      throw new Error(
        `Color "${element.name}" aliases "${element.alias}", which is not a generated family ` +
          `(it must be a non-alias color declared in the same config).`,
      );
    }
    if (!Object.hasOwn(tokens.color, group)) tokens.color[group] = {};
    tokens.color[group][name] = structuredClone(source);

    const exportTargets = resolveExport(element, config);
    if (exportTargets !== undefined) {
      exportTargets.forEach((exportElement) => {
        if (exportGroups[exportElement] === undefined) {
          exportGroups[exportElement] = { color: {} };
        }
        if (exportGroups[exportElement].color[group] === undefined) {
          exportGroups[exportElement].color[group] = {};
        }
        exportGroups[exportElement].color[group][name] = {
          light: tokens.color[group][name].light,
          dark: tokens.color[group][name].dark,
        };
      });
    }
  });

  // Surface + border families are generated by lightness (OKLCH), not by the
  // APCA contrast solver above. They slot into the same token tree so they ship
  // as `--surface-<family>-<role>` / `--border-<family>-<role>` and flip per
  // mode through the existing css-vars-rgb template, and export together into
  // the `theme` group file. Injected only when a color opts in, so runs with no
  // surface families produce byte-identical output to before.
  const { surface, border } = createSurfaceTokens(config);
  if (Object.keys(surface).length > 0) {
    tokens.color.surface = surface as unknown as DesignTokens;
    tokens.color.border = border as unknown as DesignTokens;
    exportGroups.theme = {
      color: { surface, border } as unknown as DesignTokens,
    };
  }

  // The states of a family (state-color.mts, #1427): washes generated by lightness for every
  // family with surfaces or a solid fill, the emphasis band of the solid fills, the selected
  // level of the inverse pair of the tints. After the aliases and the ramps, which the band
  // reads; before the text, which is solved against the washes. They ship as
  // `--wash-<family>-<level>`, `--emphasis-<family>-<state>`, `--inverse-<family>-selected`,
  // and the ink of an accent on a neutral surface as `--fg-<family>-default` (#1496).
  const wash = createWashTokens(config);
  const { emphasis, inverse, fg } = createEmphasisTokens(
    config,
    tokens.color as unknown as Parameters<typeof createEmphasisTokens>[1],
  );
  const states = { wash, emphasis, inverse, fg };
  Object.entries(states).forEach(([group, families]) => {
    if (Object.keys(families).length === 0) return;
    tokens.color[group] = families as unknown as DesignTokens;
    exportGroups.theme = exportGroups.theme ?? { color: {} as unknown as DesignTokens };
    (exportGroups.theme.color as Record<string, unknown>)[group] = families;
  });

  // Text roles are chosen BY APCA TARGET (text-role.mts) against surface-default,
  // so they run AFTER tones (the candidate steps), surfaces (the reference) and washes are
  // in the tree. They ship as `--text-<family>-<role>` and join the `theme` group.
  const { text } = createTextTokens(config, tokens.color as unknown as Parameters<typeof createTextTokens>[1]);
  if (Object.keys(text).length > 0) {
    tokens.color.text = text as unknown as DesignTokens;
    exportGroups.theme = exportGroups.theme ?? { color: {} as unknown as DesignTokens };
    (exportGroups.theme.color as Record<string, unknown>).text = text;
  }

  return { tokens, exportGroups };
}
