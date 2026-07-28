import chroma from "chroma-js";
import chalk from "chalk";
import type { ColorConfig, ColorTokenSet, MagmaConfig } from "./color.mjs";
import type { TextConfig } from "./text-role.mjs";

/**
 * Surface / border generation engine (issue #571, spec:
 * projects/styles/SEMANTIC_COLOR_SPEC.md sections 4.3 and 5).
 *
 * Surfaces and borders are NOT contrast-solved by Leonardo (APCA); they are
 * placed by a direct perceptual LIGHTNESS in OKLCH, per mode and per role:
 *
 *   surface(family, mode, role) = oklch( L[mode][role], C_family * taper(L), H_family )
 *
 * APCA is the right tool for foreground (high contrast, cross-mode parity) and
 * the wrong tool for near-background colors, where it clamps low contrast and
 * collapses the usable band - the mechanism behind the "too black" dark mode.
 * Lightness placement gives a controlled elevation ladder that keeps a fixed
 * perceptual step between roles in both modes.
 */

export const SURFACE_ROLES = [
  "sunken",
  "muted",
  "default",
  "raised",
  "overlay",
] as const;
export const BORDER_ROLES = ["muted", "default", "strong"] as const;

export type SurfaceRole = (typeof SURFACE_ROLES)[number];
export type BorderRole = (typeof BORDER_ROLES)[number];
export type Mode = "light" | "dark";

/** A per-mode table of role -> lightness (e.g. `"96%"` or `0.96`). */
export interface ModeLevels<Role extends string> {
  light: Record<Role, string | number>;
  dark: Record<Role, string | number>;
}

export interface ThemeConfig {
  /** Kept for symmetry with the root `colorspace`; the engine always uses OKLCH. */
  colorspace?: string;
  surfaces: ModeLevels<SurfaceRole>;
  borders: ModeLevels<BorderRole>;
  /** Text roles, by APCA target vs surface-default (A7, text-role.mts). Optional. */
  text?: TextConfig;
}

/** Per-color surface opt-in: `true` uses the global ramp; an object overrides levels. */
export type SurfaceOptIn =
  | boolean
  | { surfaces?: ModeLevels<SurfaceRole>; borders?: ModeLevels<BorderRole> };

/**
 * Parse a lightness level into the 0..1 range chroma-js expects. Accepts a
 * percentage string (`"96%"`), a bare 0..100 string (`"96"`), or a 0..1 number.
 */
export function parseLightness(level: string | number): number {
  if (typeof level === "number") {
    return level > 1 ? level / 100 : level;
  }
  const trimmed = level.trim();
  const numeric = Number.parseFloat(trimmed.replace("%", ""));
  if (Number.isNaN(numeric)) {
    throw new Error(`Invalid lightness level: ${JSON.stringify(level)}`);
  }
  // "96%" and "96" both mean 0.96; a bare "0.96" is already normalized
  return trimmed.endsWith("%") || numeric > 1 ? numeric / 100 : numeric;
}

/**
 * Chroma taper: full chroma at mid lightness, reduced toward the extremes so
 * near-white / near-black surfaces do not carry an unnatural saturated cast.
 * Quadratic and symmetric; ininfluent for the neutral family (C ~= 0).
 */
export function taper(lightness: number): number {
  const distanceFromMid = Math.abs(2 * lightness - 1);
  return 1 - distanceFromMid * distanceFromMid;
}

/**
 * One OKLCH surface/border color as a hex string. Chroma and hue come from the
 * family key color; lightness is imposed from the level table and the chroma is
 * tapered by lightness. Achromatic keys (neutral) resolve to a pure grey.
 */
export function lightnessColor(keyColor: string, lightness: number): string {
  const [, keyChroma, keyHue] = chroma(keyColor).oklch();
  const hue = Number.isNaN(keyHue) ? 0 : keyHue;
  const adjustedChroma = keyChroma * taper(lightness);
  return chroma.oklch(lightness, adjustedChroma, hue).hex();
}

function buildRoleSet<Role extends string>(
  keyColor: string,
  roles: readonly Role[],
  levels: Record<Role, string | number>,
): Record<string, { value: string }> {
  const set: Record<string, { value: string }> = {};
  roles.forEach((role) => {
    set[role] = { value: lightnessColor(keyColor, parseLightness(levels[role])) };
  });
  return set;
}

/** The `neutral` in `tone.neutral` - the family segment used for `--surface-<family>-*`. */
function familyOf(colorItem: ColorConfig): string {
  return colorItem.name.split(".")[1];
}

function resolveLevels<Role extends string>(
  optIn: SurfaceOptIn | undefined,
  global: ModeLevels<Role>,
  key: "surfaces" | "borders",
): ModeLevels<Role> {
  if (optIn && typeof optIn === "object" && optIn[key] !== undefined) {
    return optIn[key] as unknown as ModeLevels<Role>;
  }
  return global;
}

export interface SurfaceTokens {
  /** family -> { light, dark } role sets, ready to slot into `color.surface` */
  surface: Record<string, ColorTokenSet>;
  /** family -> { light, dark } role sets, ready to slot into `color.border` */
  border: Record<string, ColorTokenSet>;
}

/**
 * Generate surface + border tokens for every color that opts in via `surface`.
 * Returns empty maps when no `theme` block is configured or no color opts in,
 * so callers can skip injecting the groups and existing output stays identical.
 */
export function createSurfaceTokens(config: MagmaConfig): SurfaceTokens {
  const surface: Record<string, ColorTokenSet> = {};
  const border: Record<string, ColorTokenSet> = {};

  const opted = config.colors.filter(
    (color) => !color.disabled && Boolean(color.surface),
  );
  if (opted.length === 0) return { surface, border };

  if (config.theme === undefined) {
    console.warn(
      chalk.yellow(
        `Colors opt into "surface" but no "theme" block is configured; skipping surface/border generation.`,
      ),
    );
    return { surface, border };
  }

  const { surfaces: globalSurfaces, borders: globalBorders } = config.theme;

  opted.forEach((color) => {
    const family = familyOf(color);
    const surfaceLevels = resolveLevels(color.surface, globalSurfaces, "surfaces");
    const borderLevels = resolveLevels(color.surface, globalBorders, "borders");

    console.info(`Creating ${chalk.cyan("surface")} ${family}`);
    surface[family] = {
      light: buildRoleSet(color.color, SURFACE_ROLES, surfaceLevels.light),
      dark: buildRoleSet(color.color, SURFACE_ROLES, surfaceLevels.dark),
    };
    border[family] = {
      light: buildRoleSet(color.color, BORDER_ROLES, borderLevels.light),
      dark: buildRoleSet(color.color, BORDER_ROLES, borderLevels.dark),
    };
  });

  return { surface, border };
}
