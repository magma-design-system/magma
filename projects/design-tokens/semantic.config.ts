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
export type ThemeDef =
  | string
  | { surface?: string; accents?: Record<string, string>; scale?: string };

/**
 * A contrast preference level that carries role promotions (spec 9.3). Only `more`
 * is meaningful today: `less` and `custom` exist in Media Queries Level 5 but the
 * design system takes no position on them, and `no-preference` IS the base layer.
 */
export type ContrastLevel = 'more';

/**
 * A level's promotions: role -> the STRONGER same-family role it borrows from.
 * Keyed by axis so text and border promote independently.
 */
export type ContrastPromotion = {
  text?: Record<string, string>;
  border?: Record<string, string>;
};

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
   *
   * `family` names the RAMP (`status-success`), `roles` the generated role scales
   * of the same family (`--text-success-*`): the surface engine drops the group
   * segment (`status.success` becomes `success`) and the hue key can differ from
   * both (`danger` draws from `status-error`), so neither name is derivable from
   * the other and both are declared. A `partial` hue keeps borrowing ramp steps
   * (`neutralHueSteps`) and needs no `roles`.
   */
  hues: Record<string, { family: string; roles?: string; partial?: boolean }>;
  hues: Record<string, { family: string; partial?: boolean }>;
  /**
   * How many steps of the active tint's ramp to expose as `--magma-scale-NN`.
   *
   * TRANSITIONAL (spec 8): the component sheets still reach for a raw ramp step in
   * the places the role vocabulary does not cover yet (interaction washes, scrims,
   * shadows, decorative fills). Pinned to `--tone-neutral-*` those uses split the
   * theming in two - the semantic roles retint, the raw steps stay a static
   * neutral - so the ramp gets the same active-tint indirection everything else
   * has. It is deliberately NOT bridged to Tailwind: it is an internal step toward
   * naming those uses, not an API to build on, and each one that earns a role
   * leaves the ramp behind.
   */
  scaleSteps: number;
  /** Steps of a colored family for the quintet (spec 6.5). */
  hueSteps: { surface: string; fg: string; border: string; emphasis: string };
  /**
   * WASH LEVELS of a colored hue: how marked the colored background is, NOT how
   * high it sits. Emitted as `--magma-<hue>-wash-<level>` and, like
   * `accentStateSteps`, each level NAMES an existing ramp step rather than
   * resolving through the generated `--surface-<family>-*` scale.
   *
   * The name is deliberate on both halves. NOT `surface-*`, because
   * `--magma-<hue>-surface-default` would read as the colored parent of
   * `--magma-surface-default` and is nothing of the sort - that one is the
   * elevation band (L 96%), this one is a ramp step, and the generated
   * `--surface-<family>-*` scale (the band, tinted) already occupies the middle
   * ground. Three near-identical names for three different things is a trap, so
   * this group says what it is. NOT `tint-*` either: `tint` already means the
   * ACTIVE THEME FAMILY throughout this contract (`--magma-tint-*` pointers,
   * `contrastTintOverride`), and one word cannot carry both senses.
   *
   * The reason is measured, not stylistic: the elevation ladder moves toward
   * WHITE as it rises in light and toward the INK as it rises in dark, while a
   * tinted chip (a banner cockade, a status wash under an icon) moves toward the
   * ink in BOTH modes. One elevation role therefore cannot name it - it would be
   * `sunken` in light and `raised` in dark - whereas a ramp step mode-flips for
   * free because the primitive itself flips. The generated surface scale stays
   * what it is for: the constraint the text roles are solved against.
   *
   * Text on these levels is bounded by the spec 9.1 table, not by taste:
   * `soft` carries the whole text ladder, `base` carries `text-default`, and
   * `strong` carries icons only (no essential text).
   */
  hueWashSteps: Record<string, string>;
  /**
   * Which published role each legacy quintet alias is a SHORTCUT for (spec 6.5).
   * `--magma-<hue>-surface`, `-fg` and `-border` are kept so existing consumers
   * keep resolving, but they now point at a role in the published scale instead
   * of at a ramp step of their own, which is what lets the contrast promotion
   * reach them: promote the role and the shortcut follows. `surface` names a WASH
   * level (it keeps step 09, the value that alias always had); `text` and
   * `border` name a role of the generated ladders.
   */
  hueRoles: { surface: string; text: string; border: string };
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
   * Interaction-state steps of a SOLID FILL (spec 6.6). Such a fill has no
   * elevation ladder to derive hover/active from (unlike neutral surfaces), and
   * the ramp INVERTS between light and dark, so a runtime `color-mix` cannot
   * reproduce the states per mode. Instead each state NAMES an existing ramp
   * step: the design-tokens engine already generates and mode-flips it, so the
   * states stay theme-aware and the component migration is a mechanical 1:1
   * rename.
   *
   * The `emphasis-*` entries belong to the emphasis band wherever it appears, so
   * they are emitted for the accents (`--magma-accent-<role>-<state>`, through
   * `--magma-tint-accent-<role>-<state>`, so a named theme repoints them like the
   * quintet) AND for the colored hues (`--magma-<hue>-<state>`, stated directly -
   * a theme does not retint a hue). Read them through `emphasisStateSteps()` so
   * one definition serves both and a status fill cannot drift from an accent
   * fill. Measured reason the hues need them: the component sheets had built the
   * band by hand, fill on step 05 and hover on 04 - and 04 IS `-emphasis`, so
   * adopting the role without states would collapse hover onto rest. On step 05
   * `-on-emphasis` sits at 71.5 Lc light / 67.1 dark, under the 75 floor; on
   * `-emphasis` it reaches 79.5 / 74.9, which is what the accents already carry.
   *
   * The `surface-*` entries stay ACCENT-ONLY: a colored hue expresses that band
   * as wash levels (`hueWashSteps`), named by intensity rather than by state.
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
  /**
   * High-contrast promotions (spec 9.3). Under `pref-contrast-more` each listed
   * role borrows a STRONGER same-family step (role -> stronger role), so the
   * semantic scaffolding gains contrast upstream via the `--magma-tint-*` block
   * instead of per-component `--tone-*` sheets. Family-independent: the same
   * promotion applies to a named theme by swapping the family, which is exactly
   * what the generator does (base `tint` on `:root`, the theme family under
   * `data-theme-name`). Roles omitted keep their normal step. Optional, so it
   * stays a non-breaking addition.
   */
  contrast?: Partial<Record<ContrastLevel, ContrastPromotion>>;
}

export const semantic: SemanticConfig = {
  tint: 'neutral',
  surfaceRoles: ['sunken', 'muted', 'default', 'raised', 'overlay'],
  borderRoles: ['muted', 'default', 'strong'],
  textRoles: ['default', 'muted', 'subtle', 'disabled'],
  borderFocus: 'accent',
  seed: 'tone-neutral-seed',
  hues: {
    info: { family: 'status-info', roles: 'info' },
    success: { family: 'status-success', roles: 'success' },
    warning: { family: 'status-warning', roles: 'warning' },
    danger: { family: 'status-error', roles: 'error' },
    neutral: { family: 'tone-neutral', partial: true },
  },
  scaleSteps: 10,
  hueSteps: { surface: '09', fg: '05', border: '06', emphasis: '04' },
  // The three wash levels the component sheets actually use as a colored
  // background today (10 x68, 09 x71, 08 x41), so adopting them is a 1:1 rename
  // and no value moves. `base` is the step `--magma-<hue>-surface` already
  // pointed at - which is why the shortcut can stay put. NOTE: the accents
  // express the same three levels with state-derived names (`surface-subtle` /
  // base / `surface-hover`, #606); these are named by INTENSITY because a
  // colored chip is not an interaction state. Unifying the two vocabularies is a
  // follow-up, not part of this change.
  hueWashSteps: { soft: '10', base: '09', strong: '08' },
  hueRoles: { surface: 'base', text: 'default', border: 'default' },
  neutralHueSteps: { fg: '03', border: '06', emphasis: '02' },
  accents: {
    accent: 'variant-primary',
    ai: 'variant-ai',
  },
  accentStateSteps: {
    // emphasis band (solid fill): hover/active go one/two steps STRONGER. Shared
    // with the colored hues via emphasisStateSteps() - the same two steps, so a
    // status button and an accent button behave identically.
    'emphasis-hover': '03',
    'emphasis-active': '02',
    // surface band (subtle fill): hover one step stronger, subtle one lighter.
    // Accent-only: a hue says this with hueWashSteps.
    'surface-hover': '08',
    'surface-subtle': '10',
  },
  themes: {
    default: 'neutral', // base :root (== tint); emits no override rule
    cool: 'porcelain',
    warm: 'bisque',
  },
  contrast: {
    // text + border only. muted/subtle text shift one step stronger; decorative
    // and default borders shift toward strong. `default` text is already the
    // contrast ceiling; `disabled` text stays faint (intentional, WCAG-exempt).
    more: {
      text: { muted: 'default', subtle: 'muted' },
      border: { muted: 'default', default: 'strong' },
    },
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

/** The ramp step names, zero-padded the way the primitives are (`01` ... `10`). */
export const scaleStepList = (): string[] =>
  Array.from({ length: semantic.scaleSteps }, (_, i) => String(i + 1).padStart(2, '0'));

/**
 * The PRIMITIVE ramp family behind a surface family. A surface role drops the token
 * group (`tone.neutral` becomes `--surface-neutral-*`) while the ramp keeps it
 * (`--tone-neutral-09`), and the group is NOT recoverable from the surface name - so
 * `tone` is assumed, which is exactly right today because a theme must be a tint
 * (the playground restricts theme candidates to the `tone` group: a theme repoints
 * the whole neutral scaffolding). A future theme drawn from another group states its
 * ramp explicitly, e.g. `blue: { surface: 'blue', scale: 'label-blue' }`.
 */
export const scaleFamily = (surface: string, scale?: string): string => scale ?? `tone-${surface}`;

/**
 * The `--magma-tint-scale-*` lines pointing the ramp at one family. SHARED for the
 * same reason as `accentTintOverride`: the styles generator and the playground theme
 * export must emit byte-identical CSS.
 */
export const scaleTintOverride = (family: string): string[] =>
  scaleStepList().map((step) => `  --magma-tint-scale-${step}: var(--${family}-${step});`);

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
/**
 * The EMPHASIS-band states of `accentStateSteps`, i.e. the ones that describe a
 * solid fill and therefore apply to the colored hues as well as to the accents.
 * Derived rather than duplicated: the steps live in ONE place, so the two bands
 * cannot drift. The `surface-*` states are left out on purpose - a hue expresses
 * that band as wash levels (`hueWashSteps`).
 */
export const emphasisStateSteps = (): Record<string, string> =>
  Object.fromEntries(
    Object.entries(semantic.accentStateSteps).filter(([state]) => state.startsWith('emphasis-')),
  );

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

/**
 * The `--magma-tint-*` lines that promote text + border to a STRONGER same-family
 * step under a contrast level (spec 9.3). `family` is the surface family in play -
 * the base `tint` for the `:root` layer, a named theme's family under
 * `data-theme-name` - so the promotion is FAMILY-INDEPENDENT: a theme gains
 * contrast exactly the way the base layer does, by swapping the family. Only the
 * tint pointers move, so every role that resolves through them (surface-borne
 * text, borders) follows without touching a single component sheet. SHARED so the
 * styles generator emits byte-identical lines for the base layer and for every
 * named theme. Returns [] when the level declares no promotion.
 */
export const contrastTintOverride = (family: string, level: ContrastLevel = 'more'): string[] =>
  contrastLines(family, level, (axis, role) => `--magma-tint-${axis}-${role}`);

/**
 * The same promotions for a colored HUE's published roles (spec 9.3 + 6.4).
 * Hues are DIRECT aliases - they do not resolve through the `--magma-tint-*`
 * block, because a hue is not retinted by a named theme - so the promotion has to
 * name their roles instead of a shared pointer. It reads the very same table:
 * `roleFamily` is the hue's generated role family (`success`), and because the
 * legacy quintet aliases (`-fg`, `-border`) are declared as `var()` of these
 * roles, promoting the role carries the shortcut along.
 *
 * NOT theme-scoped, unlike `contrastTintOverride`: a named theme leaves hues
 * alone, so the base block is the only place these can be stated.
 */
export const hueContrastOverride = (
  hue: string,
  roleFamily: string,
  level: ContrastLevel = 'more',
): string[] => contrastLines(roleFamily, level, (axis, role) => `--magma-${hue}-${axis}-${role}`);

/**
 * Shared body of the two overrides above: walk the level's promotion table and
 * emit one line per promoted role, naming the target through `name` so the tint
 * pointers and the hue roles cannot drift apart in what they promote or in the
 * order they promote it. Returns [] when the level declares no promotion.
 */
function contrastLines(
  family: string,
  level: ContrastLevel,
  name: (axis: 'text' | 'border', role: string) => string,
): string[] {
  const promo = semantic.contrast?.[level];
  if (!promo) return [];
  return [
    ...Object.entries(promo.text ?? {}).map(
      ([role, stronger]) => `  ${name('text', role)}: var(--text-${family}-${stronger});`,
    ),
    ...Object.entries(promo.border ?? {}).map(
      ([role, stronger]) => `  ${name('border', role)}: var(--border-${family}-${stronger});`,
    ),
  ];
}
