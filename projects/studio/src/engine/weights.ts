import bundledJson from '@maggioli-design-system/design-tokens/.magma-design-tokensrc.json';
import type { MagmaConfig } from '@maggioli-design-system/design-tokens/src/lib/color.mjs';
import type { ThemeConfig } from '@maggioli-design-system/design-tokens/src/lib/surface.mjs';

/*
  The weights of a preset (#1403; the balances of Semantic surface until then): the `theme` block
  of the configuration, the lightness of the five surfaces and the three borders in each mode, and
  the APCA Lc targets of the four texts, one for both modes as the engine of design-tokens holds
  them (text-role.mts). What the stage Weights edits and the pairs it touches measure
  (studio.object-model.md, section 4, Pesi). Pure: no Preact, no state, no document.
*/

/** A colour mode of the weights: the surfaces and the borders have one level per mode. */
export type Mode = 'light' | 'dark';
export const MODES: readonly Mode[] = ['light', 'dark'];

/**
 * The weights of a configuration that names none: the `theme` block of the configuration Magma
 * builds with (design-tokens `.magma-design-tokensrc.json`), its surface and border levels and the
 * APCA Lc targets of the text roles (A7, #632).
 */
export const DEFAULT_THEME = (bundledJson as { theme: ThemeConfig }).theme;

/** The weights a configuration holds: its own, else those of Magma. */
export const weightsOf = (config: MagmaConfig): ThemeConfig => config.theme ?? DEFAULT_THEME;

/** A level ("96%" | "96" | 0.96) as a 0..100 number, the value of its slider. */
export function percentOf(level: string | number | undefined): number {
  if (level === undefined) return 0;
  if (typeof level === 'number') return level > 1 ? level : level * 100;
  const n = Number.parseFloat(String(level).replace('%', ''));
  return Number.isNaN(n) ? 0 : n <= 1 ? n * 100 : n;
}

/**
 * The span of the slider of a level, per mode. Surfaces are confined to a band per mode (high in
 * light, low in dark) because they ARE the canvas. Borders are not: a border has to stand out FROM
 * the surface it sits on, and in dark `strong` has to climb well past the ceiling of the dark
 * surfaces to read at all, so they get the whole ramp in both modes. No guard keeps a level from
 * dissolving into the canvas: the contrast check is what catches that, not the bounds.
 */
export type LevelRange = Record<Mode, { min: number; max: number }>;
export const SURFACE_RANGE: LevelRange = {
  light: { min: 85, max: 100 },
  dark: { min: 1, max: 50 },
};
export const BORDER_RANGE: LevelRange = {
  light: { min: 0, max: 100 },
  dark: { min: 0, max: 100 },
};
/** A text target is an APCA Lc magnitude (0..~106), not a lightness. */
export const TEXT_TARGET_MAX = 106;

/*
  The order of depth of the surfaces (vittorio, 2026-11-27): in each mode a surface is never
  lighter than the one above it, sunken <= muted <= default <= raised <= overlay. Equal levels are
  allowed: a design may give every surface the same lightness. The direction is the same in both
  modes because the ladder rises toward white in light and toward the ink in dark
  (projects/styles/SEMANTIC_COLOR_SPEC.md, section 6). The slider of a surface moved past its
  neighbour pushes it along (vittorio, 2026-11-27, over stopping at the neighbour or allowing and
  flagging), so the stage never writes a preset out of order; a preset loaded out of order is
  flagged (surfaceOrderProblems). SURFACE_ROLES of design-tokens lists them from the deepest.
*/

/** The levels of the surfaces of one mode, by role. */
export type Levels = Record<string, string | number>;

/**
 * The levels of the surfaces of one mode with `role` set to `percent`: the deeper surfaces over it
 * come down to it, the higher ones under it go up to it, the others keep their level as written.
 * `order` is the roles from the deepest (SURFACE_ROLES).
 */
export function pushSurfaces(
  levels: Levels,
  order: readonly string[],
  role: string,
  percent: number,
): Levels {
  const next: Levels = { ...levels, [role]: `${percent}%` };
  const at = order.indexOf(role);
  for (let i = at - 1; i >= 0; i--) {
    const above = percentOf(next[order[i + 1]]);
    if (percentOf(next[order[i]]) > above) next[order[i]] = `${above}%`;
  }
  for (let i = at + 1; i < order.length; i++) {
    const below = percentOf(next[order[i - 1]]);
    if (percentOf(next[order[i]]) < below) next[order[i]] = `${below}%`;
  }
  return next;
}

/** A surface lighter than the one above it, in a preset written out of order. */
export interface OrderProblem {
  /** The deeper surface, and the one above it that it passes. */
  role: string;
  above: string;
  level: number;
  aboveLevel: number;
}

/** The surfaces of one mode that pass the one above them; none on a preset in order. */
export function surfaceOrderProblems(levels: Levels, order: readonly string[]): OrderProblem[] {
  return order.slice(0, -1).flatMap((role, i) => {
    const above = order[i + 1];
    const level = percentOf(levels[role]);
    const aboveLevel = percentOf(levels[above]);
    return level > aboveLevel ? [{ role, above, level, aboveLevel }] : [];
  });
}
