import type { MagmaConfig } from '@maggioli-design-system/design-tokens/src/lib/color.mjs';
import { createColorTokens } from '@maggioli-design-system/design-tokens/src/lib/color.mjs';
import {
  applyBaseline,
  gatePairs,
  type Baseline,
  type Category,
  type ColorTree,
  type Metric,
  type Mode,
  type PairResult,
  type Severity,
  type ThemeDefLike,
} from '@maggioli-design-system/design-tokens/src/lib/contrast-gate.js';
import { semantic } from '@maggioli-design-system/design-tokens/semantic.config';
import type { ColorMode } from '@maggioli-design-system/design-tokens/src/lib/theme-manifest.mjs';
import baselineFile from '@maggioli-design-system/design-tokens/contrast-baseline.json';
import { configThemes, scaleOfFamily } from './scene-css.js';
import { NO_THEME_CHOICES, type ThemeChoices } from './theme-choices.js';
import { accentOfTheme } from './themes.js';

/*
  The APCA contrast gate of design-tokens, run in the browser on the configuration being edited
  (#698): the pairs `nx run design-tokens:contrast` measures, with its targets and its baseline,
  through its own engine (contrast-gate.ts, driven by semantic.config.ts), so the studio and the
  CI judge the same pairs the same way. What differs is which themes: the CI judges the themes
  Magma ships (`semantic.themes`), the studio the themes of the configuration it edits, as the
  Themes page defines and exports them (scene-css.ts, `configThemes`): their families, the
  accents they repoint and the colour modes they are used in.
*/

/** What the contrast gate says of a configuration, in one line: the badge of the Colors menu. */
export type GateVerdict =
  | { state: 'pass'; accepted: number }
  | { state: 'fail'; violations: number }
  | { state: 'error'; message: string };

/**
 * The verdict of a pair in one mode:
 * - `pass`: it meets its target;
 * - `fail`: an enforced pair under its target, not accepted by the baseline: it fails the build;
 * - `accepted`: an enforced pair under its target that the baseline of design-tokens accepts;
 * - `below`: a report-only pair under its target (the gate reports it, never fails on it);
 * - `info`: a decorative border under the ratio, which has no floor (WCAG 1.4.11 is for state);
 * - `off`: a mode the theme is not used in (#1274): measured, never judged, since mds-pref-theme
 *   never paints the theme in it.
 */
export type PairState = 'pass' | 'fail' | 'accepted' | 'below' | 'info' | 'off';

export interface GateCell extends PairResult {
  state: PairState;
}

/** A pair of roles, as the gate measures it, in both modes. */
export interface GatePair {
  category: Category;
  /** The roles, as the gate names them: `text-muted` on `surface-raised`. */
  fg: string;
  bg: string;
  severity: Severity;
  metric: Metric;
  cells: Record<Mode, GateCell>;
}

/** A theme of the configuration and every pair the gate measures in it. */
export interface GateTheme {
  name: string;
  family: string;
  /** The base theme, `:root`: the base layer of the gate. */
  base: boolean;
  modes: readonly ColorMode[];
  pairs: GatePair[];
  /** The pairs that fail the gate, per mode. */
  failing: Record<Mode, number>;
}

export interface GateReport {
  verdict: GateVerdict;
  themes: GateTheme[];
}

/** A pair that fails the gate, with the theme it fails in: what an export asks about. */
export interface GateFailure {
  theme: string;
  cell: GateCell;
}

const MODES: Mode[] = ['light', 'dark'];
const ACCENT_ROLES = Object.keys(semantic.accents);

/**
 * The accents a theme repoints, as the export prints them (`themesExportCss`): the roles whose
 * variant is not the one of the layer. A role the theme leaves alone follows `:root`, which the
 * base theme may repoint, so the gate measures what the page paints.
 */
const accentsOf = (family: string, choices: ThemeChoices): Record<string, string> =>
  Object.fromEntries(
    ACCENT_ROLES.map((role) => [role, accentOfTheme(family, role, choices)]).filter(
      ([role, variant]) => variant !== semantic.accents[role],
    ),
  );

const stateOf = (
  result: PairResult,
  offered: boolean,
  violations: Set<string>,
  accepted: Set<string>,
): PairState => {
  if (!offered) return 'off';
  if (result.pass) return 'pass';
  if (violations.has(result.key)) return 'fail';
  if (accepted.has(result.key)) return 'accepted';
  return result.severity === 'info' ? 'info' : 'below';
};

/** The results of one theme as pairs, the two modes of each side by side, in the gate's order. */
function pairsOf(
  results: PairResult[],
  modes: readonly ColorMode[],
  violations: Set<string>,
  accepted: Set<string>,
): GatePair[] {
  const pairs = new Map<string, GatePair>();
  for (const result of results) {
    const id = `${result.fgToken}|${result.bgToken}`;
    const cell = {
      ...result,
      state: stateOf(result, modes.includes(result.mode), violations, accepted),
    };
    const pair = pairs.get(id);
    if (pair) pair.cells[result.mode] = cell;
    else
      pairs.set(id, {
        category: result.category,
        fg: result.fgToken,
        bg: result.bgToken,
        severity: result.severity,
        metric: result.metric,
        cells: { [result.mode]: cell } as Record<Mode, GateCell>,
      });
  }
  return [...pairs.values()];
}

/**
 * The report of the gate on a configuration and the choices of the Themes page: every pair of
 * every theme in both modes, and the verdict. The base theme is the base layer of the gate, its
 * accents repointed when the Themes page repoints them; every other theme is a theme of the gate
 * (`gatePairs`), its family, its ramp and the accents it repoints, keyed `<theme>:<pair>` as the
 * CLI keys it, so the baseline of design-tokens accepts the same offenders. Only the modes a theme
 * is used in are judged.
 */
export function gateReport(
  config: MagmaConfig,
  choices: ThemeChoices = NO_THEME_CHOICES,
): GateReport {
  try {
    const { tokens } = createColorTokens(JSON.parse(JSON.stringify(config)) as MagmaConfig);
    const tree = (tokens as { color: ColorTree }).color;
    const themes = configThemes(config, tree, choices);
    const base = themes.find((theme) => theme.family === semantic.tint);
    if (!base) throw new Error(`the base family, ${semantic.tint}, generates no surface`);
    const scaleOf = scaleOfFamily(config);
    const defs: Record<string, ThemeDefLike> = Object.fromEntries(
      themes
        .filter((theme) => theme !== base)
        .map((theme) => {
          const scale = scaleOf(theme.family);
          const accents = accentsOf(theme.family, choices);
          return [theme.name, { surface: theme.family, accents, ...(scale && { scale }) }];
        }),
    );
    const mapping = {
      ...semantic,
      accents: { ...semantic.accents, ...accentsOf(semantic.tint, choices) },
    };
    const measured = gatePairs(tree, mapping, defs);
    const resultsOf = (name: string): PairResult[] =>
      name === base.name
        ? measured.base
        : (measured.themes.find((theme) => theme.name === name)?.results ?? []);

    // the baseline judges the pairs of the modes each theme is used in, the others are off
    const judged = themes.flatMap((theme) =>
      resultsOf(theme.name).filter((result) => theme.modes.includes(result.mode)),
    );
    const baseline = ((baselineFile as { pairs?: Baseline }).pairs ?? {}) as Baseline;
    const outcome = applyBaseline(judged, baseline);
    const violations = new Set(outcome.violations.map((result) => result.key));
    const accepted = new Set(outcome.baselinedFailures.map((result) => result.key));

    const report = themes.map((theme): GateTheme => {
      const pairs = pairsOf(resultsOf(theme.name), theme.modes, violations, accepted);
      const failing = Object.fromEntries(
        MODES.map((mode) => [
          mode,
          pairs.filter((pair) => pair.cells[mode]?.state === 'fail').length,
        ]),
      ) as Record<Mode, number>;
      return { ...theme, base: theme === base, pairs, failing };
    });
    return {
      verdict: outcome.violations.length
        ? { state: 'fail', violations: outcome.violations.length }
        : { state: 'pass', accepted: outcome.baselinedFailures.length },
      themes: report,
    };
  } catch (error) {
    return {
      verdict: { state: 'error', message: error instanceof Error ? error.message : String(error) },
      themes: [],
    };
  }
}

/** The verdict of the gate alone. */
export const gateVerdict = (
  config: MagmaConfig,
  choices: ThemeChoices = NO_THEME_CHOICES,
): GateVerdict => gateReport(config, choices).verdict;

/** Every pair that fails the gate, theme by theme, light before dark. */
export const gateFailures = (report: GateReport): GateFailure[] =>
  report.themes.flatMap((theme) =>
    MODES.flatMap((mode) =>
      theme.pairs
        .filter((pair) => pair.cells[mode]?.state === 'fail')
        .map((pair) => ({ theme: theme.name, cell: pair.cells[mode] })),
    ),
  );
