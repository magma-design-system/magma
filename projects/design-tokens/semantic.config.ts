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
 *  - surfaces/borders resolve through the `--magma-tint-*` indirection so a named
 *    theme retints the whole neutral scaffolding with one swap (section 8, B2);
 *  - text roles come from the by-target `--text-*` primitives (A7, section 9);
 *  - the colored-hue quintet uses fixed steps (section 6.4/6.5).
 */

export interface SemanticConfig {
  /** Active default tint family; surfaces/borders/text resolve from it (spec 8). */
  tint: string;
  /** Elevation/prominence surface roles, from `--surface-<tint>-<role>` (A1). */
  surfaceRoles: readonly string[];
  /** Border prominence roles, from `--border-<tint>-<role>` (A1). */
  borderRoles: readonly string[];
  /** Text prominence roles, from the by-target `--text-<tint>-<role>` (A7). */
  textRoles: readonly string[];
  /** Focus border is an accent, not a neutral level (spec 6.3). */
  borderFocus: string;
  /** The pure-extreme foreground for text/`*-on-emphasis` (spec 6.5). */
  seed: string;
  /** Colored hues carry the full quintet; a `partial` hue omits `surface` (spec 6.4). */
  hues: Record<string, { family: string; partial?: boolean }>;
  /** Steps of a colored family for the quintet (spec 6.5). */
  hueSteps: { surface: string; fg: string; border: string; emphasis: string };
  /** Steps for the neutral (partial) hue - it borrows from the tone scale. */
  neutralHueSteps: { fg: string; border: string; emphasis: string };
}

export const semantic: SemanticConfig = {
  tint: 'neutral',
  surfaceRoles: ['sunken', 'muted', 'default', 'raised', 'overlay'],
  borderRoles: ['muted', 'default', 'strong'],
  textRoles: ['default', 'muted', 'subtle', 'disabled'],
  borderFocus: 'variant-primary',
  seed: 'tone-neutral-seed',
  hues: {
    accent: { family: 'variant-primary' },
    info: { family: 'status-info' },
    success: { family: 'status-success' },
    warning: { family: 'status-warning' },
    danger: { family: 'status-error' },
    neutral: { family: 'tone-neutral', partial: true },
  },
  hueSteps: { surface: '09', fg: '05', border: '06', emphasis: '04' },
  neutralHueSteps: { fg: '03', border: '06', emphasis: '02' },
};
