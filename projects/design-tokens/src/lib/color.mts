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
export interface SeedConfig {
  light: RgbHexColor;
  dark: RgbHexColor;
}
export interface ColorConfig {
  color: RgbHexColor;
  export?: string[];
  name: string;
  seed?: SeedConfig;
  disabled?: boolean;
  title?: string;
  alias?: string;
  ratios?: string;
  formula?: Formula;
  colorspace?: InterpolationColorspace;
  smooth?: boolean;
  hueShift?: HueShiftConfig;
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
}

export interface MagmaConfig {
  colorspace?: string;
  smooth?: boolean;
  formula?: Formula;
  hueShift?: HueShiftConfig;
  ratios?: { [K in Formula]: RatioData };
  groups?: Record<string, GroupConfig>;
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
    name: "backgroud",
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
          palette.color = { value: colorValue };

          if (seed !== undefined && colorMode !== undefined) {
            palette.color = { value: seed[colorMode] };
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

export function resolveRatios(
  colorItem: ColorConfig,
  config: MagmaConfig,
): number[] {
  const formula = resolveFormula(colorItem, config);
  return config.ratios![formula][resolveRatiosName(colorItem, config)];
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

    if (!element.disabled) {
      if (!Object.hasOwn(tokens.color, group)) {
        console.info(`Creating ${chalk.magenta("group")} ${group}`);
        tokens.color[group] = {};
      }
      if (!Object.hasOwn(tokens.color[group], name)) {
        console.info(`Creating ${chalk.blue("color")} ${name}`);
        const formula = resolveFormula(element, config);
        tokens.color[group][name] = {
          light: formatColortoTokens(
            [
              assembleContrastColor(
                theme[formula].light.contrastColors.slice(
                  1,
                ) as ContrastColor[],
                variants[element.name].light,
                `${group}.${name}`,
              ),
            ],
            `${group}.${name}`,
            element.color,
            element.seed,
            "light",
          ),
          dark: formatColortoTokens(
            [
              assembleContrastColor(
                theme[formula].dark.contrastColors.slice(
                  1,
                ) as ContrastColor[],
                variants[element.name].dark,
                `${group}.${name}`,
              ),
            ],
            `${group}.${name}`,
            element.color,
            element.seed,
            "dark",
          ),
        };
      }

      if (element.export !== undefined) {
        element.export.forEach((exportElement) => {
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

  return { tokens, exportGroups };
}
