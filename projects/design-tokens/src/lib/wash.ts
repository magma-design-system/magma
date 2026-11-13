/**
 * The wash levels of a family (spec 9.1, #1414): a background named by how marked it is,
 * each level a STEP of the family's own ramp, not a surface. A colored hue publishes them as
 * `--magma-<hue>-wash-*`, the neutral band as `--magma-wash-*` (semantic.config `washSteps`,
 * why a ramp step and not an elevation role is written there).
 *
 * One definition for the three that read it, so they cannot drift:
 *  - the semantic layer names the steps (`semantic.config.ts`, `washSteps`);
 *  - the text-role engine solves each text role against the washes of its family it must be
 *    legible on, beside the surfaces (`text-role.mts`): the washes do not follow
 *    `theme.surfaces`, so a text solved on the surfaces alone loses its contrast on its own
 *    wash when the surfaces get lighter (#1414);
 *  - the contrast gate holds the same pairs to the same floors (`contrast-gate.ts`).
 */

/** The ramp step each wash level names, in the family's own ramp (both modes). */
export const WASH_STEPS = { soft: '10', base: '09', strong: '08' } as const;

export type WashLevel = keyof typeof WASH_STEPS;

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
 * Roles left out of a level are still measured and reported by the gate, just not gated.
 *
 * ONE table for both bands because the measurement says so, not for symmetry.
 * Measured on the neutral band the day it was added (#624): `soft` 95.3/96.8 Lc
 * for `default` down to 60.4/61.8 for `disabled` (light/dark, all above their
 * floors); `base` 88.4/89.5 for `default` but 73.1/74.0 for `muted`, under the
 * 75 floor exactly as on a hue; `strong` 78.7/79.9 for `default`, which clears
 * the icon target but leaves no headroom for a ladder.
 */
export const WASH_TEXT_ENFORCED: Record<WashLevel, readonly string[]> = {
  soft: ['default', 'muted', 'subtle', 'disabled'],
  base: ['default'],
  strong: [],
};
