import chroma from 'chroma-js';
import type { MagmaConfig } from '@maggioli-design-system/design-tokens/src/lib/color.mjs';
import type { ThemeConfig } from '@maggioli-design-system/design-tokens/src/lib/surface.mjs';
import type { Mode } from '@maggioli-design-system/design-tokens/src/lib/contrast-gate.js';
import { gateReport, type GateReport, type PairState } from './gate.js';
import { NO_THEME_CHOICES, type ThemeChoices } from './theme-choices.js';
import { DEFAULT_THEME, percentOf } from './weights.js';

/*
  The pairs of the contrast check a family touches (#1403): the pairs its change moves, which
  Colours keeps in view beside the family (studio.object-model.md, section 4, Family, "Sempre
  visibile": what it paints and the pairs of the check it touches). Measured, not mapped: the check
  runs again with the key colour of the family turned far away, in hue and in lightness, and every
  pair whose measure moves is one the family touches. So the answer comes from the engine of the
  check itself, every link of a role to a family included, and needs no table of its own. A
  reference touches what the family it follows touches: it paints what its source paints
  (color.mts, the alias re-exports the resolved ramp of its source).

  Pure: no Preact, no state, no document. Some 75 ms on the preset of Magma, so the view measures
  it after the render that changed the family.
*/

/** A pair in one theme and one mode: the key of a cell of the report. */
export const cellKey = (theme: string, fg: string, bg: string, mode: Mode): string =>
  `${theme}|${fg}|${bg}|${mode}`;

const MODES: Mode[] = ['light', 'dark'];

/** The measure of every cell of a report, by its key. */
function measures(report: GateReport): Map<string, number> {
  const cells = new Map<string, number>();
  for (const theme of report.themes)
    for (const pair of theme.pairs)
      for (const mode of MODES) {
        const cell = pair.cells[mode];
        if (cell) cells.set(cellKey(theme.name, pair.fg, pair.bg, mode), cell.achieved);
      }
  return cells;
}

/** A colour far from `hex`: the opposite hue, the lightness moved by a third, a vivid chroma. */
function farFrom(hex: string): string {
  const [lightness, , hue] = chroma(hex).oklch();
  const turned = Number.isNaN(hue) ? 300 : (hue + 180) % 360;
  return chroma.oklch(lightness > 0.5 ? lightness - 0.3 : lightness + 0.3, 0.15, turned).hex();
}

/**
 * The cells of the check a family moves: the keys of `cellKey`, empty for a family that touches
 * none (a label colour, which no pair of the check measures) or one with no colour to move.
 */
export function touchedCells(
  config: MagmaConfig,
  name: string,
  choices: ThemeChoices = NO_THEME_CHOICES,
): Set<string> {
  const family = config.colors.find((one) => one.name === name);
  // a reference moves with the family it follows
  const source = family?.alias ? config.colors.find((one) => one.name === family.alias) : family;
  if (!source?.color || !chroma.valid(source.color)) return new Set();
  const moved = JSON.parse(JSON.stringify(config)) as MagmaConfig;
  const target = moved.colors.find((one) => one.name === source.name)!;
  target.color = farFrom(source.color) as typeof target.color;
  return movedCells(config, moved, choices);
}

/** The cells whose measure differs between a preset and the same preset moved. */
function movedCells(config: MagmaConfig, moved: MagmaConfig, choices: ThemeChoices): Set<string> {
  const before = measures(gateReport(config, choices));
  const after = measures(gateReport(moved, choices));
  return new Set([...before.keys()].filter((key) => after.get(key) !== before.get(key)));
}

/**
 * The cells of the check a contrast scale moves: every target of its steps pulled a third of the
 * way toward the background, the families that use it solved again. A scale no family uses moves
 * nothing.
 */
export function touchedCellsOfScale(
  config: MagmaConfig,
  formula: NonNullable<MagmaConfig['formula']>,
  name: string,
  steps: readonly number[],
  choices: ThemeChoices = NO_THEME_CHOICES,
): Set<string> {
  const moved = JSON.parse(JSON.stringify(config)) as MagmaConfig;
  const ratios = (moved.ratios ?? {}) as Record<string, Record<string, number[] | null>>;
  ratios[formula] = { ...(ratios[formula] ?? {}), [name]: steps.map((step) => step * (2 / 3)) };
  moved.ratios = ratios as MagmaConfig['ratios'];
  return movedCells(config, moved, choices);
}

/** A level moved by `by` points of lightness, kept on the ramp. */
const shifted = (level: string | number | undefined, by: number): string =>
  `${Math.min(100, Math.max(0, percentOf(level) + by))}%`;

/**
 * The cells of the check the weights of one mode move (#1403, the stage Weights): the surfaces of
 * the mode pulled toward the middle of the ramp, its borders the same and further, every text
 * target lowered, the preset solved again, and only the cells of that mode kept. The text targets
 * are one for both modes; the view shows one mode at a time, so the cells of the other mode they
 * move are left to its own tab.
 */
export function touchedCellsOfWeights(
  config: MagmaConfig,
  mode: Mode,
  choices: ThemeChoices = NO_THEME_CHOICES,
): Set<string> {
  const moved = JSON.parse(JSON.stringify(config)) as MagmaConfig;
  const theme = (moved.theme ??= JSON.parse(JSON.stringify(DEFAULT_THEME)) as ThemeConfig);
  // toward the middle: down in light, up in dark
  const toward = mode === 'light' ? -1 : 1;
  const surfaces = theme.surfaces[mode] as Record<string, string | number>;
  for (const role of Object.keys(surfaces)) surfaces[role] = shifted(surfaces[role], 6 * toward);
  const borders = theme.borders[mode] as Record<string, string | number>;
  for (const role of Object.keys(borders)) borders[role] = shifted(borders[role], 15 * toward);
  const texts = (theme.text ?? {}) as Record<string, number | { step: number }>;
  for (const [role, target] of Object.entries(texts))
    if (typeof target === 'number') texts[role] = Math.max(0, target - 15);
  return new Set([...movedCells(config, moved, choices)].filter((key) => key.endsWith(`|${mode}`)));
}

/** The pairs a family touches, as the view counts them: per pair of roles in a theme. */
export interface TouchedPair {
  theme: string;
  fg: string;
  bg: string;
  /** The state of the pair in each mode it is touched in. */
  states: Partial<Record<Mode, PairState>>;
}

/** The pairs of a report among the cells a family touches, each with its state in each mode. */
export function touchedPairs(report: GateReport, cells: ReadonlySet<string>): TouchedPair[] {
  const pairs: TouchedPair[] = [];
  for (const theme of report.themes)
    for (const pair of theme.pairs) {
      const states: TouchedPair['states'] = {};
      for (const mode of MODES)
        if (cells.has(cellKey(theme.name, pair.fg, pair.bg, mode)) && pair.cells[mode])
          states[mode] = pair.cells[mode].state;
      if (Object.keys(states).length)
        pairs.push({ theme: theme.name, fg: pair.fg, bg: pair.bg, states });
    }
  return pairs;
}

/** How the pairs a family touches stand: how many, and how many fail, are accepted or below. */
export interface TouchedSummary {
  pairs: number;
  fail: number;
  accepted: number;
  below: number;
}

export function touchedSummary(pairs: readonly TouchedPair[]): TouchedSummary {
  const count = (state: PairState) =>
    pairs.filter((pair) => Object.values(pair.states).includes(state)).length;
  return {
    pairs: pairs.length,
    fail: count('fail'),
    accepted: count('accepted'),
    below: count('below'),
  };
}

/** Every cell of one theme, in both modes: the pairs the stage Themes measures a theme by (#1404). */
export function cellsOfTheme(report: GateReport, theme: string): Set<string> {
  const cells = new Set<string>();
  for (const one of report.themes)
    if (one.name === theme)
      for (const pair of one.pairs)
        for (const mode of MODES)
          if (pair.cells[mode]) cells.add(cellKey(one.name, pair.fg, pair.bg, mode));
  return cells;
}
