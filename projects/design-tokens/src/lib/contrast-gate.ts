/**
 * APCA contrast gate (issue #575, A3).
 *
 * Verifies that the semantic color pairs defined in the S0 spec meet their
 * contrast targets in BOTH modes, so a regression fails CI instead of shipping.
 * GitHub runs the equivalent APCA check on every Primer PR.
 *
 * Data source: the in-memory token model (`createColorTokens(config).tokens.color`),
 * NOT the generated `dist/css` (which can be stale relative to the source config).
 * The `--magma-*` -> primitive mapping is derived from `semantic.config.ts`
 * (the A9 contract) via `aliasesFromConfig`, so when a role is repointed to a
 * different step or family the gate re-verifies it automatically.
 *
 * Split by essentiality, matching spec section 9.1 / 9.2:
 *  - ENFORCED (severity `error`, fails the build): text-on-surface and
 *    on-emphasis pairs, against the explicit APCA Lc floors in the spec table.
 *  - REPORT-ONLY (`warn`/`info`, never fails): hue-fg (no numeric target in the
 *    spec) and borders (the spec de-emphasizes border contrast; decorative
 *    borders have no 3:1 floor). Surfaced so they can be tuned, not gated.
 *
 * Contrast bounds live in `contrast-range.ts` (A5, issue #578); the enforced
 * floors here are the per-role targets from section 9.1.
 */
import { APCAcontrast, sRGBtoY } from 'apca-w3';
import chroma from 'chroma-js';

export type Mode = 'light' | 'dark';
export type Severity = 'error' | 'warn' | 'info';
export type Metric = 'apca' | 'wcag2';
export type Category =
  | 'text-on-surface'
  | 'text-on-wash'
  | 'text-on-hue'
  | 'on-emphasis'
  | 'hue-fg'
  | 'border';

/** Shape of `createColorTokens(config).tokens.color`: color[group][name][mode][step] = { value }. */
export type ColorTree = Record<
  string,
  Record<string, Record<Mode, Record<string, { value: string }>>>
>;

/**
 * Enforced/target floors. Configurable so a consumer (or a future theme) can
 * override; the defaults are the spec section 9.1 values.
 */
export interface GateTargets {
  /** APCA Lc floor per text role (essential text cannot drop below its floor). */
  text: Record<'default' | 'muted' | 'subtle' | 'disabled', number>;
  /** APCA Lc floor for text on a solid emphasis fill. */
  onEmphasis: number;
  /** APCA Lc target for colored fg on a surface (report-only; spec gives no number). */
  hueFg: number;
  /** WCAG2 non-text ratio for state borders (report-only; WCAG 1.4.11). */
  borderState: number;
}

export const DEFAULT_TARGETS: GateTargets = {
  text: { default: 75, muted: 75, subtle: 45, disabled: 30 },
  onEmphasis: 75,
  hueFg: 60,
  borderState: 3,
};

const MODES: Mode[] = ['light', 'dark'];
const SURFACES = ['sunken', 'muted', 'default', 'raised', 'overlay'] as const;
const ELEVATED = ['default', 'raised'] as const;
// The two fixed accents (spec 8) plus the colored/neutral hues. Accents are a
// fixed set (semantic.config `accents`): the general `accent` (bare namespace, no
// infix) and `accent-ai`; their on-emphasis + fg pairs are gated like any other
// hue.
const HUES = ['accent', 'accent-ai', 'info', 'success', 'warning', 'danger', 'neutral'] as const;
const BORDERS = ['muted', 'default', 'strong', 'focus'] as const;
/**
 * The emphasis-band states a hue publishes, READ OFF the alias map instead of
 * listed here (spec 6.6): every `--magma-<hue>-emphasis-<state>` is a solid fill
 * that carries on-emphasis text, so a state added to the config is gated without
 * editing this file. The bare namespace never swallows an infixed one -
 * `accent-ai-emphasis-hover` does not start with `accent-emphasis-`. Surface-band
 * states (`surface-hover`/`-subtle`) add no new text-on-fill pair, and the
 * partial neutral publishes none at all.
 */
const emphasisStatesOf = (aliases: Record<string, string>, hue: string): string[] => {
  const prefix = `--magma-${hue}-emphasis-`;
  return Object.keys(aliases)
    .filter((token) => token.startsWith(prefix))
    .map((token) => token.slice(`--magma-${hue}-`.length));
};
// The colored hues (every hue that is neither an accent nor the partial neutral):
// the ones that publish a text ladder on their own wash levels.
const TINTED_HUES = ['info', 'success', 'warning', 'danger'] as const;
/**
 * Which text roles are ENFORCED on each wash level (spec 9.1) - for the colored
 * hues AND for the neutral band of 6.1b. This is the contract for a pill-shaped
 * background, and it is bounded by measurement, not taste: the more marked the
 * wash, the less of the text ladder it can carry.
 *  - `soft` (the lightest wash) carries the whole ladder;
 *  - `base` carries `text-default` only (`muted` measures 73-75 Lc on it,
 *    i.e. at or just under its 75 floor);
 *  - `strong` carries NO essential text: it is the graphic wash (chips,
 *    cockades, hover) and only has to keep icons legible, which the report-only
 *    target covers (`text-default` measures 74.5-76 Lc there).
 * Roles left out of a level are still measured and reported, just not gated.
 *
 * ONE table for both bands because the measurement says so, not for symmetry.
 * Measured on the neutral band the day it was added (#624): `soft` 95.3/96.8 Lc
 * for `default` down to 60.4/61.8 for `disabled` (light/dark, all above their
 * floors); `base` 88.4/89.5 for `default` but 73.1/74.0 for `muted`, under the
 * 75 floor exactly as on a hue; `strong` 78.7/79.9 for `default`, which clears
 * the icon target but leaves no headroom for a ladder.
 */
const WASH_TEXT_ENFORCED: Record<string, readonly string[]> = {
  soft: ['default', 'muted', 'subtle', 'disabled'],
  base: ['default'],
  strong: [],
};

// APCA is reported to <1 Lc precision; round display and compare on the rounded
// value so float noise never flips a verdict.
const round1 = (n: number) => Math.round(n * 10) / 10;

/**
 * Resolve a primitive var (e.g. `--tone-neutral-04`, `--surface-neutral-default`)
 * to its hex for a mode via the in-memory tree. Handles the step shapes:
 * named roles (surface/text/border), numeric steps (`04` -> tree key `4`), the
 * pure extreme of a SEEDED family (`--tone-*-seed` -> tree key `seed`), and the
 * bare base color of a non-seeded family (`--variant-primary` -> tree key `color`).
 */
export function resolvePrimitive(tree: ColorTree, varName: string, mode: Mode): string {
  const [group, name, ...rest] = varName.replace(/^--/, '').split('-');
  let step = rest.length ? rest.join('-') : 'color';
  if (/^\d+$/.test(step)) step = String(Number(step));
  const hex = tree?.[group]?.[name]?.[mode]?.[step]?.value;
  if (!hex) {
    throw new Error(
      `contrast-gate: cannot resolve ${varName} (${mode}) -> color.${group}.${name}.${mode}.${step}`,
    );
  }
  return hex;
}

/**
 * The slice of `semantic.config.ts` (the A9 contract) the gate needs.
 * Structurally typed so the lib stays generic - it takes any mapping, not the
 * concrete config; the CLI/test pass the real `semantic` object.
 */
export interface SemanticMapping {
  tint: string;
  surfaceRoles: readonly string[];
  borderRoles: readonly string[];
  textRoles: readonly string[];
  borderFocus: string;
  seed: string;
  hues: Record<string, { family: string; roles?: string; partial?: boolean }>;
  hueSteps: { surface: string; fg: string; border: string; emphasis: string };
  neutralHueSteps: { fg: string; border: string; emphasis: string };
  accents: Record<string, string>;
  /**
   * Solid-fill interaction-state steps (spec 6.6); optional. The `emphasis-*`
   * entries apply to the accents AND to the colored hues, the `surface-*` ones to
   * the accents only - see `emphasisStateSteps()` in semantic.config.
   */
  accentStateSteps?: Record<string, string>;
  /**
   * Wash levels, level -> ramp step: the neutral band (`--magma-wash-*`, spec
   * 6.1b, on the tint ramp) and every colored hue (`--magma-<hue>-wash-*`, spec
   * 6.4, on its own family). One map for both, so they cannot drift; optional.
   */
  washSteps?: Record<string, string>;
  /** Which published role each legacy quintet alias shortcuts to; optional. */
  hueRoles?: { surface: string; text: string; border: string };
  /**
   * Ramp family behind `--magma-tint-scale-*`, when it is not the tint's own tone
   * scale. Mirrors `scaleFamily()` in semantic.config, which the gate cannot
   * import: this type is deliberately the SLICE of the contract the gate needs,
   * not the config itself.
   */
  scale?: string;
}

/**
 * Build the `--magma-* -> primitive` map from the A9 semantic config, resolving
 * straight through the tint indirection to the concrete primitive the gate
 * verifies (surfaces/text/borders from the active tint family; hues per the
 * quintet steps). Mirrors what `scripts/semantic.ts` emits.
 */
export function aliasesFromConfig(m: SemanticMapping): Record<string, string> {
  const map: Record<string, string> = {};
  const set = (magma: string, primitive: string) => (map[`--magma-${magma}`] = `--${primitive}`);

  m.surfaceRoles.forEach((r) => set(`surface-${r}`, `surface-${m.tint}-${r}`));
  m.textRoles.forEach((r) => set(`text-${r}`, `text-${m.tint}-${r}`));
  set('text-on-emphasis', m.seed);
  m.borderRoles.forEach((r) => set(`border-${r}`, `border-${m.tint}-${r}`));
  // focus follows the accent named by borderFocus, at its emphasis step
  set('border-focus', `${m.accents[m.borderFocus]}-${m.hueSteps.emphasis}`);
  // the neutral wash band (spec 6.1b): named steps of the ACTIVE TINT ramp, which
  // is what `scaleFamily(tint)` resolves to - not the surface band, which is
  // elevation and cannot hold these values in both modes.
  const rampFamily = m.scale ?? `tone-${m.tint}`; // = scaleFamily(tint) in semantic.config
  Object.entries(m.washSteps ?? {}).forEach(([level, step]) =>
    set(`wash-${level}`, `${rampFamily}-${step}`),
  );

  // A colored hue publishes the same vocabulary as the neutral scaffolding on its
  // own family: wash levels from named ramp steps, text + border from the family's
  // GENERATED role scales. The quintet aliases are shortcuts onto those roles, so
  // the gate resolves them to the same primitive the layer does. A `partial` hue
  // (neutral) still borrows ramp steps and publishes no ladder of its own.
  Object.entries(m.hues).forEach(([hue, { family, roles, partial }]) => {
    if (partial || !roles) {
      const steps = partial ? m.neutralHueSteps : m.hueSteps;
      if (!partial) set(`${hue}-surface`, `${family}-${m.hueSteps.surface}`);
      set(`${hue}-fg`, `${family}-${steps.fg}`);
      set(`${hue}-border`, `${family}-${steps.border}`);
      set(`${hue}-emphasis`, `${family}-${steps.emphasis}`);
      set(`${hue}-on-emphasis`, m.seed);
      return;
    }
    Object.entries(m.washSteps ?? {}).forEach(([level, step]) =>
      set(`${hue}-wash-${level}`, `${family}-${step}`),
    );
    m.textRoles.forEach((r) => set(`${hue}-text-${r}`, `text-${roles}-${r}`));
    m.borderRoles.forEach((r) => set(`${hue}-border-${r}`, `border-${roles}-${r}`));
    set(`${hue}-emphasis`, `${family}-${m.hueSteps.emphasis}`);
    // the emphasis band's interaction states, shared with the accents (spec 6.6).
    // Same predicate as `emphasisStateSteps()` in semantic.config: the surface-band
    // states are accent-only, a hue says that with wash levels.
    Object.entries(m.accentStateSteps ?? {})
      .filter(([state]) => state.startsWith('emphasis-'))
      .forEach(([state, step]) => set(`${hue}-${state}`, `${family}-${step}`));
    set(`${hue}-on-emphasis`, m.seed);
    const shortcut = m.hueRoles;
    if (shortcut) {
      set(`${hue}-surface`, `${family}-${(m.washSteps ?? {})[shortcut.surface]}`);
      set(`${hue}-fg`, `text-${roles}-${shortcut.text}`);
      set(`${hue}-border`, `border-${roles}-${shortcut.border}`);
    }
  });

  // accents (variant): the standout quintet, one per fixed role (spec 8). They
  // share the colored-hue steps and resolve to the accent's mapped family. The
  // general `accent` role carries no infix (bare `--magma-accent-*`); others infix
  // their name - mirrors `accentInfix` in semantic.config and scripts/semantic.ts.
  Object.entries(m.accents).forEach(([role, family]) => {
    const infix = role === 'accent' ? '' : `${role}-`;
    set(`accent-${infix}surface`, `${family}-${m.hueSteps.surface}`);
    set(`accent-${infix}fg`, `${family}-${m.hueSteps.fg}`);
    set(`accent-${infix}border`, `${family}-${m.hueSteps.border}`);
    set(`accent-${infix}emphasis`, `${family}-${m.hueSteps.emphasis}`);
    set(`accent-${infix}on-emphasis`, m.seed);
    // interaction states (spec 6.6 accent exception): each names an existing ramp
    // step of the same family, mirroring scripts/semantic.ts.
    Object.entries(m.accentStateSteps ?? {}).forEach(([state, step]) =>
      set(`accent-${infix}${state}`, `${family}-${step}`),
    );
  });
  return map;
}

/** A contrast level's role promotions (role -> stronger same-family role). */
export type ContrastPromotions = {
  more?: { text?: Record<string, string>; border?: Record<string, string> };
};

/**
 * The `--magma-* -> primitive` map UNDER a contrast level: start from the base
 * aliases and repoint the promoted text/border roles to their STRONGER same-family
 * step, mirroring what `scripts/semantic.ts` emits for `:root.pref-contrast-<level>`.
 * Everything the gate looks up (surfaces, hues, accents) stays at the base value,
 * so the returned map can be fed straight to `evaluatePairs`.
 */
export function contrastAliasesFromConfig(
  m: SemanticMapping & { contrast?: ContrastPromotions },
  level: keyof ContrastPromotions = 'more',
): Record<string, string> {
  const map = aliasesFromConfig(m);
  const promo = m.contrast?.[level];
  if (!promo) return map;
  Object.entries(promo.text ?? {}).forEach(([role, stronger]) => {
    map[`--magma-text-${role}`] = `--text-${m.tint}-${stronger}`;
  });
  Object.entries(promo.border ?? {}).forEach(([role, stronger]) => {
    map[`--magma-border-${role}`] = `--border-${m.tint}-${stronger}`;
  });
  // Every colored hue promotes its own roles off the same table (spec 9.3): the
  // layer states them as roles because a hue does not resolve through a tint
  // pointer. The quintet shortcuts are var() of these roles, so `<hue>-border`
  // follows `<hue>-border-default` here exactly as it does in CSS.
  Object.entries(m.hues).forEach(([hue, { roles, partial }]) => {
    if (partial || !roles) return;
    Object.entries(promo.text ?? {}).forEach(([role, stronger]) => {
      map[`--magma-${hue}-text-${role}`] = `--text-${roles}-${stronger}`;
    });
    Object.entries(promo.border ?? {}).forEach(([role, stronger]) => {
      map[`--magma-${hue}-border-${role}`] = `--border-${roles}-${stronger}`;
    });
    if (m.hueRoles?.text && promo.text?.[m.hueRoles.text]) {
      map[`--magma-${hue}-fg`] = `--text-${roles}-${promo.text[m.hueRoles.text]}`;
    }
    if (m.hueRoles?.border && promo.border?.[m.hueRoles.border]) {
      map[`--magma-${hue}-border`] = `--border-${roles}-${promo.border[m.hueRoles.border]}`;
    }
  });
  return map;
}

const toY = (hex: string) => sRGBtoY(chroma(hex).rgb());
/** APCA Lc as a magnitude (Magma flips the sign in dark; the gate checks size). */
export const apcaLc = (fgHex: string, bgHex: string): number =>
  Math.abs(APCAcontrast(toY(fgHex), toY(bgHex)) as number);
export const wcag2Ratio = (aHex: string, bHex: string): number => chroma.contrast(aHex, bHex);

export interface PairResult {
  category: Category;
  /** Stable id for the baseline: `<fg>|<bg>|<mode>`. */
  key: string;
  fgToken: string;
  bgToken: string;
  fgHex: string;
  bgHex: string;
  mode: Mode;
  metric: Metric;
  achieved: number;
  target: number;
  pass: boolean;
  severity: Severity;
}

/**
 * Evaluate every semantic pair in both modes.
 * `aliases` is the `--magma-*` -> primitive map from `aliasesFromConfig`; `tree`
 * is `createColorTokens(config).tokens.color`.
 */
export function evaluatePairs(
  tree: ColorTree,
  aliases: Record<string, string>,
  targets: GateTargets = DEFAULT_TARGETS,
): PairResult[] {
  const out: PairResult[] = [];
  const short = (t: string) => t.replace(/^--magma-/, '');

  const resolveRole = (token: string, mode: Mode): string => {
    const prim = aliases[token];
    if (!prim) throw new Error(`contrast-gate: ${token} is not in the semantic config`);
    return resolvePrimitive(tree, prim, mode);
  };

  const push = (
    category: Category,
    severity: Severity,
    metric: Metric,
    fg: string,
    bg: string,
    target: number,
    mode: Mode,
  ) => {
    const fgHex = resolveRole(fg, mode);
    const bgHex = resolveRole(bg, mode);
    const achieved = round1(metric === 'apca' ? apcaLc(fgHex, bgHex) : wcag2Ratio(fgHex, bgHex));
    out.push({
      category,
      key: `${short(fg)}|${short(bg)}|${mode}`,
      fgToken: short(fg),
      bgToken: short(bg),
      fgHex,
      bgHex,
      mode,
      metric,
      achieved,
      target,
      pass: achieved >= target,
      severity,
    });
  };

  for (const mode of MODES) {
    // 1. every text role on every surface (enforced)
    for (const [role, target] of Object.entries(targets.text)) {
      for (const surf of SURFACES) {
        push(
          'text-on-surface',
          'error',
          'apca',
          `--magma-text-${role}`,
          `--magma-surface-${surf}`,
          target,
          mode,
        );
      }
    }
    // 2. every hue's on-emphasis text on its emphasis fill (enforced)
    for (const hue of HUES) {
      push(
        'on-emphasis',
        'error',
        'apca',
        `--magma-${hue}-on-emphasis`,
        `--magma-${hue}-emphasis`,
        targets.onEmphasis,
        mode,
      );
    }
    // 2b. hover/active fills carry on-emphasis text too (enforced), for accents and
    //     colored hues alike. They are more extreme than the base emphasis in the
    //     safe direction, so they pass by construction; gated for regression
    //     protection (e.g. a themed accent family, or a retuned ramp).
    for (const hue of HUES) {
      for (const state of emphasisStatesOf(aliases, hue)) {
        push(
          'on-emphasis',
          'error',
          'apca',
          `--magma-${hue}-on-emphasis`,
          `--magma-${hue}-${state}`,
          targets.onEmphasis,
          mode,
        );
      }
    }
    // 2c. every hue's text ladder on its OWN wash levels. This is the pair a
    //     banner, toast or badge actually renders, and the one that had no name in
    //     the contract before: previously the gate only checked colored ink on the
    //     NEUTRAL surfaces (section 3 below), which is a different question.
    //     Enforced per WASH_TEXT_ENFORCED; the rest is measured and reported.
    for (const hue of TINTED_HUES) {
      for (const [level, enforced] of Object.entries(WASH_TEXT_ENFORCED)) {
        for (const [role, floor] of Object.entries(targets.text)) {
          const gated = enforced.includes(role);
          push(
            'text-on-hue',
            gated ? 'error' : 'warn',
            'apca',
            `--magma-${hue}-text-${role}`,
            `--magma-${hue}-wash-${level}`,
            gated ? floor : targets.hueFg,
            mode,
          );
        }
      }
    }
    // 2d. the neutral text ladder on the NEUTRAL wash band (spec 6.1b). Same
    //     question as 2c one level down: a grey pill (a disabled switch track, a
    //     paginator hover, a zebra chip) is not an elevation surface, so section 1
    //     above never checked this pair. Enforced per WASH_TEXT_ENFORCED, the same
    //     table as the hues because the measurement came out the same.
    for (const [level, enforced] of Object.entries(WASH_TEXT_ENFORCED)) {
      for (const [role, floor] of Object.entries(targets.text)) {
        const gated = enforced.includes(role);
        push(
          'text-on-wash',
          gated ? 'error' : 'warn',
          'apca',
          `--magma-text-${role}`,
          `--magma-wash-${level}`,
          gated ? floor : targets.hueFg,
          mode,
        );
      }
    }
    // 3. colored fg on the elevated surfaces (report-only)
    for (const hue of HUES) {
      for (const surf of ELEVATED) {
        push(
          'hue-fg',
          'warn',
          'apca',
          `--magma-${hue}-fg`,
          `--magma-surface-${surf}`,
          targets.hueFg,
          mode,
        );
      }
    }
    // 4. borders vs the elevated surfaces (state = warn, decorative = info)
    for (const b of BORDERS) {
      const severity: Severity = b === 'strong' || b === 'focus' ? 'warn' : 'info';
      for (const surf of ELEVATED) {
        push(
          'border',
          severity,
          'wcag2',
          `--magma-border-${b}`,
          `--magma-surface-${surf}`,
          targets.borderState,
          mode,
        );
      }
    }
  }
  return out;
}

export interface BaselineEntry {
  achieved: number;
  target: number;
}
export type Baseline = Record<string, BaselineEntry>;

export interface GateOutcome {
  results: PairResult[];
  /** Enforced failures NOT covered by the baseline, or regressed below it: fail the build. */
  violations: PairResult[];
  /** Enforced failures accepted by the baseline (known offenders, to be tuned). */
  baselinedFailures: PairResult[];
  /** Baseline keys that no longer fail: the entry is stale and should be removed. */
  staleBaseline: string[];
}

// A baselined pair may not drop below its recorded value (float-noise tolerance only).
const REGRESSION_TOLERANCE = 0.05;

/**
 * Split enforced failures into accepted-by-baseline vs build-breaking. A pair is
 * accepted only if its key is baselined AND it has not regressed below the
 * recorded value, so a baselined offender getting worse still fails.
 */
export function applyBaseline(results: PairResult[], baseline: Baseline): GateOutcome {
  const enforcedFailures = results.filter((r) => r.severity === 'error' && !r.pass);
  const violations: PairResult[] = [];
  const baselinedFailures: PairResult[] = [];

  for (const r of enforcedFailures) {
    const b = baseline[r.key];
    if (b && r.achieved >= b.achieved - REGRESSION_TOLERANCE) baselinedFailures.push(r);
    else violations.push(r);
  }

  const failingKeys = new Set(enforcedFailures.map((r) => r.key));
  const staleBaseline = Object.keys(baseline).filter((k) => !failingKeys.has(k));

  return { results, violations, baselinedFailures, staleBaseline };
}

/** Build a baseline from the current enforced failures (for `--update-baseline`). */
export function buildBaseline(results: PairResult[]): Baseline {
  const baseline: Baseline = {};
  for (const r of results) {
    if (r.severity === 'error' && !r.pass)
      baseline[r.key] = { achieved: r.achieved, target: r.target };
  }
  return baseline;
}

// --- plain-text rendering (no color, so it is portable to CI logs and test messages) ---

const pad = (s: string, n: number) => (s.length >= n ? s : s + ' '.repeat(n - s.length));

/** A single aligned row, e.g. for the full table or a violations list. */
export function formatRow(r: PairResult, baselinedKeys: Set<string> = new Set()): string {
  const status = r.pass
    ? 'ok'
    : baselinedKeys.has(r.key)
      ? 'FAIL (baseline)'
      : r.severity === 'error'
        ? 'FAIL'
        : r.severity.toUpperCase();
  return [
    pad(r.category, 15),
    pad(r.fgToken, 18),
    pad(`on ${r.bgToken}`, 21),
    pad(r.mode, 5),
    pad(r.metric, 5),
    pad(`${r.achieved}`, 7),
    pad(`>= ${r.target}`, 7),
    status,
  ].join('  ');
}

/** The full report table, grouped with failures first within each category. */
export function formatTable(results: PairResult[], outcome?: GateOutcome): string {
  const baselinedKeys = new Set((outcome?.baselinedFailures ?? []).map((r) => r.key));
  const order: Category[] = ['text-on-surface', 'on-emphasis', 'hue-fg', 'border'];
  const lines: string[] = [];
  for (const cat of order) {
    const rows = results
      .filter((r) => r.category === cat)
      .sort((a, b) => Number(a.pass) - Number(b.pass) || a.achieved - b.achieved);
    if (!rows.length) continue;
    lines.push('', `# ${cat}`);
    for (const r of rows) lines.push('  ' + formatRow(r, baselinedKeys));
  }
  return lines.join('\n');
}
