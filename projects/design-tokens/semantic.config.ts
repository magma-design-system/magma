/**
 * Semantic color contract (A9, issue tracked in the epic #328).
 *
 * This is the TRACKED source of truth for the `--magma-*` semantic layer. It
 * lives in the design-tokens package (the lower of the two) so both consumers
 * import it DOWNWARD, with no dependency cycle between the packages:
 *  - the styles generator (`../styles/scripts/semantic.ts`) turns it into
 *    `css/semantic.css` (the layer) and `tailwind/semantic.css` (the Tailwind
 *    bridge), both GENERATED and NOT tracked - the layer is defined once here,
 *    in relation, instead of being hand-maintained as CSS;
 *  - the design-tokens contrast gate (`scripts/check-contrast.ts`) verifies the
 *    resulting semantic pairs against their APCA targets.
 * The values themselves are design-tokens primitives (`--surface-*`, `--text-*`,
 * `--status-*`, `--variant-*`, ...); this file only declares WHICH primitive each
 * semantic role points at.
 *
 * Conventions come from styles/SEMANTIC_COLOR_SPEC.md:
 *  - surfaces, borders AND text resolve through the `--magma-tint-*` indirection
 *    so a named theme retints the whole neutral scaffolding - background AND
 *    foreground, kept to one coherent family - with one swap (section 8, B2);
 *  - text role values are the by-target `--text-*` primitives (A7, section 9),
 *    reached via the tint-text pointers so the foreground retints with its surface;
 *  - the colored-hue quintet uses fixed steps (section 6.4/6.5).
 */

/**
 * A named theme's cosmetic override (spec 8). The string shorthand names only
 * the surface family (back-compat); the object form can also repoint individual
 * accents, so a theme retints its accents the same way it retints surfaces.
 */
export type ThemeDef = string | { surface?: string; accents?: Record<string, string> };

export interface SemanticConfig {
  /** Active default tint family; surfaces/borders/text resolve from it (spec 8). */
  tint: string;
  /** Elevation/prominence surface roles, from `--surface-<tint>-<role>` (A1). */
  surfaceRoles: readonly string[];
  /** Border prominence roles, from `--border-<tint>-<role>` (A1). */
  borderRoles: readonly string[];
  /** Text prominence roles, from the by-target `--text-<tint>-<role>` (A7). */
  textRoles: readonly string[];
  /** Accent role (a key of `accents`) the focus border follows; theme-aware (spec 6.3). */
  borderFocus: string;
  /** The pure-extreme foreground for text/`*-on-emphasis` (spec 6.5). */
  seed: string;
  /**
   * Colored hues carry the full quintet; a `partial` hue omits `surface` (spec 6.4).
   * The partial (neutral) hue's emphasis pair is emitted as the INVERSE SURFACE role
   * (`--magma-surface-inverse` / `--magma-on-inverse`), not a colored `-emphasis` fill;
   * the old `neutral-emphasis` / `-on-emphasis` names remain as deprecated aliases.
   */
  hues: Record<string, { family: string; partial?: boolean }>;
  /** Steps of a colored family for the quintet (spec 6.5). */
  hueSteps: { surface: string; fg: string; border: string; emphasis: string };
  /** Steps for the neutral (partial) hue - it borrows from the tone scale. */
  neutralHueSteps: { fg: string; border: string; emphasis: string };
  /**
   * Accent (variant) roles - the "standout" colors, spec 8. A FIXED set of named
   * accents, each mapped to the family it draws from (the `variant-*` families,
   * which alias brand/label at the primitive level, so the colour choice lives
   * once in the token config's alias). Two roles: the GENERAL `accent` owns the
   * bare `--magma-accent-*` namespace (NO infix - it promotes the formerly
   * "deprecated" single alias to the canonical general accent), and `ai` emits
   * `--magma-accent-ai-*` (the infix rule lives in `accentInfix`). Each is a
   * theme-aware quintet resolving through `--magma-tint-accent-*` (steps from
   * `hueSteps`), so a named theme can repoint an accent the same way it repoints
   * surfaces. `borderFocus` names which of these focus follows.
   */
  accents: Record<string, string>;
  /**
   * Accent interaction-state steps (a scoped spec 6.6 exception, accents only).
   * The accent quintet has no elevation ladder to derive hover/active from
   * (unlike neutral surfaces), and the `--variant-*` ramp INVERTS between light
   * and dark, so a runtime `color-mix` cannot reproduce the states per mode.
   * Instead each state NAMES an existing ramp step: the design-tokens engine
   * already generates and mode-flips it, so the states stay theme-aware and the
   * component migration is a mechanical 1:1 rename. Emitted as
   * `--magma-accent-<role>-<state>` (through `--magma-tint-accent-<role>-<state>`)
   * for every accent, so a named theme repoints them exactly like the quintet.
   */
  accentStateSteps: Record<string, string>;
  /**
   * Named themes (spec 8): map of theme name -> either a surface family (string
   * shorthand) or a `ThemeDef` that also repoints accents. The named family's
   * `{surface,border,text}` scales retint the `--magma-tint-*` block, and any
   * `accents` override retints `--magma-tint-accent-*`, under
   * `:root[data-theme-name='<name>']`. The `tint` family is the base `:root`
   * (default theme) and emits NO surface override; a theme with no accent
   * override keeps the base accents. A colour family gives a monochromatic
   * theme (A7 verifies text against that family's own surfaces). Future cosmetic
   * axes (spacing, radii, shadow) attach under the same `data-theme-name`.
   */
  themes: Record<string, ThemeDef>;
}

export const semantic: SemanticConfig = {
  tint: 'neutral',
  surfaceRoles: ['sunken', 'muted', 'default', 'raised', 'overlay'],
  borderRoles: ['muted', 'default', 'strong'],
  textRoles: ['default', 'muted', 'subtle', 'disabled'],
  borderFocus: 'accent',
  seed: 'tone-neutral-seed',
  hues: {
    info: { family: 'status-info' },
    success: { family: 'status-success' },
    warning: { family: 'status-warning' },
    danger: { family: 'status-error' },
    neutral: { family: 'tone-neutral', partial: true },
  },
  hueSteps: { surface: '09', fg: '05', border: '06', emphasis: '04' },
  neutralHueSteps: { fg: '03', border: '06', emphasis: '02' },
  accents: {
    accent: 'variant-primary',
    ai: 'variant-ai',
  },
  accentStateSteps: {
    // emphasis band (solid fill): hover/active go one/two steps STRONGER.
    'emphasis-hover': '03',
    'emphasis-active': '02',
    // surface band (subtle fill): hover one step stronger, subtle one lighter.
    'surface-hover': '08',
    'surface-subtle': '10',
  },
  themes: {
    default: 'neutral', // base :root (== tint); emits no override rule
    cool: 'porcelain',
    warm: 'bisque',
  },
};

/**
 * The infix an accent role contributes to its `--magma-accent-*` / `--magma-tint-
 * accent-*` names. The GENERAL accent (`accent`) has NO infix - it owns the bare
 * `--magma-accent-*` namespace (promoting the formerly "deprecated" single alias
 * to the canonical general accent); every other role (e.g. `ai`) infixes its name,
 * so `--magma-accent-ai-*`. SHARED so the config, the styles generator and the
 * contrast gate name accents identically ("accent" as a uniform infix ->
 * `--magma-accent-accent-*` is deliberately avoided: accent is the category).
 */
export const accentInfix = (role: string): string => (role === 'accent' ? '' : `${role}-`);

/**
 * The `--magma-tint-accent-*` lines that point an accent role at `family` (a
 * variant family): the quintet steps (surface/fg/border/emphasis) plus the
 * interaction states, prefixed per `accentInfix` (general accent = no infix,
 * `ai` = `ai-`). `on-emphasis` is family-independent (the seed) so it is not
 * repointed. SHARED so the styles generator (`scripts/semantic.ts`, both the base
 * layer and each named-theme override) and the playground theme export
 * (`playground/src/themes.tsx`) emit byte-identical CSS - a theme repoints an
 * accent exactly the way the base layer declares it.
 */
export const accentTintOverride = (role: string, family: string): string[] => {
  const { hueSteps, accentStateSteps } = semantic;
  const infix = accentInfix(role);
  return [
    `  --magma-tint-accent-${infix}surface: var(--${family}-${hueSteps.surface});`,
    `  --magma-tint-accent-${infix}fg: var(--${family}-${hueSteps.fg});`,
    `  --magma-tint-accent-${infix}border: var(--${family}-${hueSteps.border});`,
    `  --magma-tint-accent-${infix}emphasis: var(--${family}-${hueSteps.emphasis});`,
    ...Object.entries(accentStateSteps).map(
      ([state, step]) => `  --magma-tint-accent-${infix}${state}: var(--${family}-${step});`,
    ),
  ];
};
