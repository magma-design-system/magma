import committedConfig from '@maggioli-design-system/design-tokens/.magma-design-tokensrc.json';
import DEFAULT_COLOR_CONFIG from '@maggioli-design-system/design-tokens/src/config/default-color.json';
import type {
  ColorConfig,
  Formula,
  MagmaConfig,
} from '@maggioli-design-system/design-tokens/src/lib/color.mjs';
import {
  resolveFormula,
  resolveRatiosName,
} from '@maggioli-design-system/design-tokens/src/lib/color.mjs';
import { semantic } from '@maggioli-design-system/design-tokens/semantic.config';
import {
  TEXT_ROLES,
  type TextRole,
} from '@maggioli-design-system/design-tokens/src/lib/text-role.mjs';
import { gateReport, type GateCell, type GateVerdict } from './gate.js';
import { sceneStyle } from './scene-css.js';
import { msg } from './i18n.js';

/*
  The demo of the hero of the Start page (start.tsx): the configuration Magma builds with, drawn
  pale, then brought back to its own, step by step. Each step runs what the pages of Colors run on
  an edit: the generator solves every ramp and picks the step of each role (text-role.mts), the
  contrast gate judges every pair in every theme and mode (gate.ts), and the palette and the
  themes are printed as the frame of the Theme section paints them (scene-css.ts). Nothing is
  drawn by hand: what the hero shows is what the studio computes.

  Two things are drawn pale, at two levels of the studio: the text targets (`theme.text`, the
  balances of Semantic surface), lowered under the floors of the gate, and the ramp of the accent
  family, its contrast ratios scaled down (a scale of Contrast scales), which pales the ink of the
  icons and the fill of the main action. The surfaces and the borders stay the ones of Magma.
*/

type Targets = Record<TextRole, number>;

/**
 * The targets the demo starts from, under the floors of the gate (DEFAULT_TARGETS of
 * contrast-gate.ts: 75, 75, 45 and 30) for every role: the text reads faint, and the gate counts
 * the pairs below their floor.
 */
export const POOR_TARGETS: Targets = { default: 45, muted: 30, subtle: 22, disabled: 15 };

/** The targets of Magma, from the configuration it builds with. */
export const MAGMA_TARGETS: Targets = Object.fromEntries(
  TEXT_ROLES.map((role) => [role, Number(committedConfig.theme.text[role])]),
) as Targets;

/**
 * How much of its contrast the ramp of the accent keeps at the start: 0.6 puts the ink of the
 * icons and the fill of the main action under their floors (Lc 46 of 60, 49 of 75), and brings
 * them back over at different steps, the icons before the action (measured on the committed
 * configuration, test/start.test.mts).
 */
export const PALE_RAMP = 0.6;

/** The scale the demo gives the accent family while it is pale, a scale of the configuration. */
export const PALE_SCALE = 'start-pale';

/** The steps between the two: few enough to compute each on its own frame. */
export const DEMO_STEPS = 8;

const fraction = (step: number): number => Math.min(Math.max(step, 0), DEMO_STEPS) / DEMO_STEPS;

/** The targets at a step, 0 the poor ones, DEMO_STEPS those of Magma; a target is a whole Lc. */
export function targetsAt(step: number): Targets {
  const t = fraction(step);
  return Object.fromEntries(
    TEXT_ROLES.map((role) => [
      role,
      Math.round(POOR_TARGETS[role] + (MAGMA_TARGETS[role] - POOR_TARGETS[role]) * t),
    ]),
  ) as Targets;
}

/** How much of its contrast the ramp of the accent keeps at a step: PALE_RAMP, then all of it. */
export const rampAt = (step: number): number => PALE_RAMP + (1 - PALE_RAMP) * fraction(step);

/**
 * The family the accent of the base theme is drawn from: the variant semantic.config names
 * (`accents.accent`, `variant-primary`, the family `variant.primary` of the configuration), down
 * its aliases to the family that has a ramp of its own (`brand.maggioli`).
 */
function accentFamily(config: MagmaConfig): ColorConfig | undefined {
  const variant = semantic.accents.accent;
  let family = config.colors.find((color) => color.name.replace('.', '-') === variant);
  const seen = new Set<string>();
  while (family?.alias && !seen.has(family.name)) {
    seen.add(family.name);
    const alias = family.alias;
    family = config.colors.find((color) => color.name === alias);
  }
  return family;
}

/**
 * A contrast of a ramp, kept at `share` of itself: an Lc (wcag3) toward 0, a ratio (wcag2)
 * toward 1, so a step moves toward the background it is solved against.
 */
const fade = (value: number, formula: Formula, share: number): number =>
  formula === 'wcag2'
    ? Math.round((1 + (value - 1) * share) * 100) / 100
    : Math.round(value * share);

/**
 * The configuration of Magma at a step: its text targets, and the ramp of its accent faded. At
 * the last step it is the committed configuration, unchanged.
 */
export function demoConfig(step: number): MagmaConfig {
  const config = JSON.parse(JSON.stringify(committedConfig)) as MagmaConfig & {
    theme: { text: Targets };
  };
  if (step >= DEMO_STEPS) return config;
  config.theme.text = targetsAt(step);
  const family = accentFamily(config);
  if (!family) return config;
  // the configuration is merged over the defaults of design-tokens (createColorTokens): the
  // formula and the scale of the family are read the same way
  const defaults = DEFAULT_COLOR_CONFIG as unknown as MagmaConfig;
  const merged = { ...defaults, ...config };
  const formula = resolveFormula(family, merged);
  const ratios = { ...defaults.ratios, ...config.ratios } as NonNullable<MagmaConfig['ratios']>;
  const scale = ratios[formula]?.[resolveRatiosName(family, merged)];
  if (!scale) return config;
  config.ratios = {
    ...ratios,
    [formula]: {
      ...ratios[formula],
      [PALE_SCALE]: scale.map((value) => fade(value, formula, rampAt(step))),
    },
  };
  family.ratios = PALE_SCALE;
  return config;
}

/**
 * What the indicators under the banner of the hero read (hero.html): a pair of the gate each, the
 * one that holds what the banner paints, in the base theme, light mode. Where the gate measures
 * no pair for exactly what the banner paints, the nearest it measures, written beside it.
 */
export const CHECKS = [
  // the text of the banner on its ground: --mds-banner-color on --mds-banner-background
  // (mds-banner-variant.css, primary, weak)
  { id: 'texts', label: msg('Texts'), fg: 'text-default', bg: 'surface-overlay' },
  // the icon of the banner, --mds-banner-icon-color: the gate measures the ink of a hue on the
  // surfaces default and raised only (ELEVATED of contrast-gate.ts), raised the nearest to the
  // overlay of the banner and darker than it in light mode, so never kinder than the banner
  { id: 'icons', label: msg('Icons'), fg: 'accent-fg', bg: 'surface-raised' },
  // the main action, mds-button strong: its ink on its fill (mds-button-variant.css)
  { id: 'actions', label: msg('Actions'), fg: 'accent-on-emphasis', bg: 'accent-emphasis' },
] as const;

export type Check = (typeof CHECKS)[number];

export interface DemoReading {
  check: Check;
  /** The pair as the gate judges it: achieved Lc, the floor, its state. */
  cell: GateCell;
}

/** The tone of the bar of the hero (start.tsx), one of the states of Magma. */
export type DemoTone = 'error' | 'warning' | 'success';

export interface DemoStep {
  step: number;
  targets: Targets;
  /** The base theme, the one the page of the hero is painted in. */
  theme: string;
  /** The palette and the themes, for the frame (applyFrame). */
  css: string;
  verdict: GateVerdict;
  readings: DemoReading[];
  /**
   * The share of the pairs the gate counts under their floor at the start (step 0) that the step
   * has brought back over it: 0 the pale page, 1 the gate passing. What the bar fills to, so the
   * bar and the count over it say the same thing.
   */
  solved: number;
  /**
   * The tone of the bar, from what the gate says: `error` while every indicator of the banner is
   * under its floor, `warning` once one of them meets it and the gate still counts pairs under
   * theirs, `success` when the gate passes.
   */
  tone: DemoTone;
}

/** The pairs under their floor in a verdict; none when the gate passes or could not measure. */
const failingOf = (verdict: GateVerdict): number =>
  verdict.state === 'fail' ? verdict.violations : 0;

/** The pairs under their floor on the pale page, counted once: what `solved` is a share of. */
let poorFailing: number | undefined;

/**
 * The steps computed so far, each once while the page lives: the configurations of the demo never
 * change, so Replay, a return to the Start page and every test of a file share them, and the
 * engine runs nine times, not nine at every play.
 */
const computedSteps = new Map<number, DemoStep | undefined>();

/**
 * Everything the hero shows at a step, computed by the engine of the studio once (computedSteps).
 * Undefined when the configuration cannot be generated, which the committed one always can.
 */
export function demoStep(step: number): DemoStep | undefined {
  if (!computedSteps.has(step)) computedSteps.set(step, computeStep(step));
  return computedSteps.get(step);
}

function computeStep(step: number): DemoStep | undefined {
  const config = demoConfig(step);
  const scene = sceneStyle(config);
  if (!scene) return undefined;
  const report = gateReport(config);
  const base = report.themes.find((theme) => theme.base);
  const readings = CHECKS.flatMap((check): DemoReading[] => {
    const pair = base?.pairs.find((one) => one.fg === check.fg && one.bg === check.bg);
    return pair ? [{ check, cell: pair.cells.light }] : [];
  });
  const { verdict } = report;
  poorFailing ??= failingOf(step <= 0 ? verdict : gateReport(demoConfig(0)).verdict);
  const solved =
    verdict.state === 'pass'
      ? 1
      : verdict.state === 'fail' && poorFailing
        ? Math.max(0, 1 - verdict.violations / poorFailing)
        : 0;
  const tone: DemoTone =
    verdict.state === 'pass'
      ? 'success'
      : readings.some(({ cell }) => cell.state === 'pass')
        ? 'warning'
        : 'error';
  return {
    step,
    targets: targetsAt(step),
    theme: scene.themes[0].name,
    css: scene.css,
    verdict,
    readings,
    solved,
    tone,
  };
}
