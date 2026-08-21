import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { expect, test } from 'vitest';

import { getColorsConfig } from '../src/lib/utils.mjs';
import { createColorTokens, type MagmaConfig } from '../src/lib/color.mjs';
import { contrastTintOverride, emphasisStateSteps, semantic } from '../semantic.config.js';
import {
  aliasesFromConfig,
  applyBaseline,
  contrastAliasesFromConfig,
  evaluatePairs,
  formatRow,
  resolvePrimitive,
  type Baseline,
  type ColorTree,
} from '../src/lib/contrast-gate.js';

const baseline = (): Baseline =>
  JSON.parse(
    readFileSync(fileURLToPath(new URL('../contrast-baseline.json', import.meta.url)), 'utf8'),
  ).pairs;

const loadTree = async (): Promise<ColorTree> => {
  const rc = await getColorsConfig();
  return (createColorTokens(rc!.config as MagmaConfig).tokens as { color: ColorTree }).color;
};

// --- unit: the primitive resolver handles every step shape ---

const TREE: ColorTree = {
  surface: {
    neutral: { light: { default: { value: '#f2f2f2' } }, dark: { default: { value: '#161616' } } },
  },
  tone: {
    neutral: {
      light: { '4': { value: '#636363' }, seed: { value: '#ffffff' } },
      dark: { '4': { value: '#9b9b9b' }, seed: { value: '#000000' } },
    },
  },
  variant: {
    primary: {
      light: { '5': { value: '#3279ff' }, color: { value: '#00379e' } },
      dark: { '5': { value: '#3279ff' }, color: { value: '#00379e' } },
    },
  },
} as unknown as ColorTree;

test('resolvePrimitive maps named roles, numeric steps, seed and bare', () => {
  expect(resolvePrimitive(TREE, '--surface-neutral-default', 'light')).toBe('#f2f2f2');
  expect(resolvePrimitive(TREE, '--surface-neutral-default', 'dark')).toBe('#161616');
  expect(resolvePrimitive(TREE, '--tone-neutral-04', 'light')).toBe('#636363'); // "04" -> tree key "4"
  expect(resolvePrimitive(TREE, '--tone-neutral-seed', 'light')).toBe('#ffffff'); // seeded family -> "seed"
  expect(resolvePrimitive(TREE, '--tone-neutral-seed', 'dark')).toBe('#000000');
  expect(resolvePrimitive(TREE, '--variant-primary-05', 'light')).toBe('#3279ff');
  expect(resolvePrimitive(TREE, '--variant-primary', 'dark')).toBe('#00379e'); // non-seeded bare -> "color"
});

test('resolvePrimitive throws on an unresolvable var (no silent pass)', () => {
  expect(() => resolvePrimitive(TREE, '--tone-neutral-99', 'light')).toThrow(/cannot resolve/);
});

test('aliasesFromConfig maps every --magma-* role to its primitive (A9 contract)', () => {
  const map = aliasesFromConfig(semantic);
  // surfaces/text/border resolve through the active tint family (neutral)
  expect(map['--magma-surface-default']).toBe('--surface-neutral-default');
  expect(map['--magma-text-muted']).toBe('--text-neutral-muted'); // A7 by-target primitive
  expect(map['--magma-text-on-emphasis']).toBe('--tone-neutral-seed');
  // focus follows the general accent's emphasis step (theme-aware)
  expect(map['--magma-border-focus']).toBe('--variant-primary-04');
  // A colored hue publishes the neutral vocabulary on its OWN family: wash levels
  // name ramp steps (they must mode-flip), text/border come from the generated
  // role scales. `danger` also proves the three names are independent: hue key
  // `danger`, ramp family `status-error`, role family `error`.
  expect(map['--magma-danger-wash-strong']).toBe('--status-error-08');
  expect(map['--magma-danger-text-muted']).toBe('--text-error-muted');
  expect(map['--magma-danger-border-strong']).toBe('--border-error-strong');
  // the legacy quintet aliases are shortcuts onto those roles, not steps of their own
  expect(map['--magma-danger-fg']).toBe('--text-error-default');
  expect(map['--magma-danger-surface']).toBe('--status-error-09'); // unchanged value
  // the solid fill keeps naming a ramp step (the role scales model tints, not fills),
  // and so do its interaction states - the same band as an accent, so the same steps
  expect(map['--magma-danger-emphasis']).toBe('--status-error-04');
  expect(map['--magma-danger-emphasis-hover']).toBe('--status-error-03');
  expect(map['--magma-danger-emphasis-active']).toBe('--status-error-02');
  // the SURFACE-band states stay accent-only: a hue says that with wash levels
  expect(map['--magma-danger-surface-hover']).toBeUndefined();
  expect(map['--magma-danger-surface-subtle']).toBeUndefined();
  // the wash levels are deliberately NOT called `surface-*`: that name would read as
  // the colored parent of `--magma-surface-default` (the elevation band) and would
  // also collide with the generated `--surface-<family>-*` scale, which is the band
  // tinted. Three different things, so the ambiguous name must not exist at all.
  expect(map['--magma-danger-surface-strong']).toBeUndefined();
  expect(map['--magma-danger-surface-default']).toBeUndefined();
  // accents: the general `accent` owns the bare namespace (no infix, promoted from
  // the former deprecated alias); its states are infix-free too; `ai` infixes.
  expect(map['--magma-accent-emphasis']).toBe('--variant-primary-04');
  expect(map['--magma-accent-emphasis-hover']).toBe('--variant-primary-03');
  expect(map['--magma-accent-ai-emphasis']).toBe('--variant-ai-04');
  // the old per-role infix names are gone (secondary role dropped, primary promoted)
  expect(map['--magma-accent-primary-emphasis']).toBeUndefined();
  expect(map['--magma-accent-secondary-fg']).toBeUndefined();
});

test('the emphasis band carries the same states on a hue as on an accent', async () => {
  const states = emphasisStateSteps();
  // only the emphasis band: the surface-band states are an accent affair
  expect(Object.keys(states).sort()).toEqual(['emphasis-active', 'emphasis-hover']);
  const map = aliasesFromConfig(semantic);
  for (const [state, step] of Object.entries(states)) {
    for (const hue of ['info', 'success', 'warning', 'danger']) {
      const family = semantic.hues[hue].family;
      expect(map[`--magma-${hue}-${state}`]).toBe(`--${family}-${step}`);
      // a state that resolved to the base fill would silently kill the interaction
      expect(map[`--magma-${hue}-${state}`]).not.toBe(map[`--magma-${hue}-emphasis`]);
    }
  }

  // and the gate measures the text on those fills, enforced like the base pair
  const results = evaluatePairs(await loadTree(), map);
  const hueStatePairs = results.filter(
    (r) => r.category === 'on-emphasis' && /^(info|success|warning|danger)-/.test(r.bgToken) && r.bgToken.includes('-emphasis-'),
  );
  // 4 hues x 2 states x 2 modes
  expect(hueStatePairs).toHaveLength(16);
  expect(hueStatePairs.every((r) => r.severity === 'error')).toBe(true);
  // stronger fills in the safe direction, so they clear the floor by construction
  expect(hueStatePairs.every((r) => r.pass)).toBe(true);
});

// --- integration: the shipped palette + config mapping + committed baseline ---

test('every semantic pair resolves and is evaluated in both modes', async () => {
  const results = evaluatePairs(await loadTree(), aliasesFromConfig(semantic));
  expect(results.length).toBeGreaterThan(0);
  expect(results.some((r) => r.category === 'text-on-surface' && r.mode === 'light')).toBe(true);
  expect(results.some((r) => r.category === 'text-on-surface' && r.mode === 'dark')).toBe(true);
  expect(results.some((r) => r.category === 'on-emphasis')).toBe(true);
});

test('THE GATE: no enforced pair fails outside the baseline', async () => {
  const results = evaluatePairs(await loadTree(), aliasesFromConfig(semantic));
  const { violations } = applyBaseline(results, baseline());
  expect(
    violations,
    `Enforced contrast failures not covered by contrast-baseline.json:\n${violations.map((r) => formatRow(r)).join('\n')}\n` +
      `If intended, regenerate with: npm run contrast -- --update-baseline`,
  ).toEqual([]);
});

test('the committed baseline has no stale entries', async () => {
  const results = evaluatePairs(await loadTree(), aliasesFromConfig(semantic));
  const { staleBaseline } = applyBaseline(results, baseline());
  expect(
    staleBaseline,
    `These baseline entries now pass and should be removed (npm run contrast -- --update-baseline):\n${staleBaseline.join('\n')}`,
  ).toEqual([]);
});

// --- contrast (spec 9.3): pref-contrast-more promotes text/border ---

test('contrast-more promotes text/border roles to stronger same-family steps', () => {
  const map = contrastAliasesFromConfig(semantic);
  // subtle borrows the muted step, muted borrows default (base tint = neutral)
  expect(map['--magma-text-subtle']).toBe('--text-neutral-muted');
  expect(map['--magma-text-muted']).toBe('--text-neutral-default');
  // decorative/default borders shift one step toward strong
  expect(map['--magma-border-muted']).toBe('--border-neutral-default');
  expect(map['--magma-border-default']).toBe('--border-neutral-strong');
  // roles not promoted keep their base step
  expect(map['--magma-text-default']).toBe('--text-neutral-default');
  expect(map['--magma-text-disabled']).toBe('--text-neutral-disabled');
});

test('contrast-more promotes the colored hues off the same table', () => {
  const base = aliasesFromConfig(semantic);
  const more = contrastAliasesFromConfig(semantic);
  // the promotion is family-independent: the hue gains contrast within its OWN
  // ramp, by the same role -> stronger-role table the tint block uses
  expect(more['--magma-success-text-muted']).toBe('--text-success-default');
  expect(more['--magma-success-border-default']).toBe('--border-success-strong');
  // the shortcut follows its role (in CSS it is a var() of it), which is the whole
  // reason the quintet was repointed onto the roles
  expect(base['--magma-success-border']).toBe('--border-success-default');
  expect(more['--magma-success-border']).toBe('--border-success-strong');
  // `-fg` shortcuts text-default, already the ceiling: nothing to promote
  expect(more['--magma-success-fg']).toBe(base['--magma-success-fg']);
  // wash levels are backgrounds, not text/border: contrast never moves them
  expect(more['--magma-success-wash-strong']).toBe(base['--magma-success-wash-strong']);
  // the partial hue publishes no ladder, so it has nothing to promote
  expect(more['--magma-neutral-fg']).toBe(base['--magma-neutral-fg']);
});

test('contrast-more never reduces text contrast on any surface, and boosts muted', async () => {
  const tree = await loadTree();
  const onSurface = (aliases: Record<string, string>) =>
    evaluatePairs(tree, aliases).filter((r) => r.category === 'text-on-surface');
  const base = onSurface(aliasesFromConfig(semantic));
  const more = onSurface(contrastAliasesFromConfig(semantic));

  // more-contrast is an upstream promotion: no text pair may drop below its base
  for (const r of more) {
    const b = base.find((x) => x.key === r.key)!;
    expect(r.achieved, `${r.key}: more=${r.achieved} < base=${b.achieved}`).toBeGreaterThanOrEqual(
      b.achieved - 0.05,
    );
  }
  // `muted` borrows `default`, two steps that always differ, so it is strictly
  // stronger on every surface. `subtle` borrows `muted`, which in the CURRENT
  // default ramp resolves to the same color as `subtle` itself, so its promotion
  // is a no-op today - a deliberate open question on the ramp, not on this layer:
  // the effect is that contrast-more RESTORES the muted/subtle hierarchy the base
  // ramp collapses. Lower `subtle` in the ramp and the promotion starts biting
  // with no change here.
  for (const r of more.filter((x) => x.fgToken === 'text-muted')) {
    const b = base.find((x) => x.key === r.key)!;
    expect(r.achieved, `muted not boosted at ${r.key}`).toBeGreaterThan(b.achieved);
  }
});

test('contrastTintOverride only moves the tint pointers, and is family-independent', () => {
  const base = contrastTintOverride(semantic.tint);
  expect(base).toEqual([
    '  --magma-tint-text-muted: var(--text-neutral-default);',
    '  --magma-tint-text-subtle: var(--text-neutral-muted);',
    '  --magma-tint-border-muted: var(--border-neutral-default);',
    '  --magma-tint-border-default: var(--border-neutral-strong);',
  ]);
  // a named theme gains contrast by the SAME promotion with its own family swapped
  // in - the shape is identical, only the family segment moves
  const themed = contrastTintOverride('porcelain');
  expect(themed).toEqual(base.map((line) => line.replace(/neutral/g, 'porcelain')));
  // nothing but the tint indirection is touched: no --magma-<role> is restated,
  // so every role resolving through the pointers follows for free
  expect(base.every((line) => line.includes('--magma-tint-'))).toBe(true);
});
