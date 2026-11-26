/**
 * The bands of a solid fill (spec 6.6, #1427), by the ramp step each state names. Read by the
 * engine, which generates the band and its selected state (`state-color.mts`), by the semantic
 * layer, which names the states (`semantic.config.ts`), and by the contrast gate, so the three
 * cannot drift.
 */

/**
 * The emphasis band of a colored family (an accent, a status hue): the solid fill of a strong
 * button, a solid badge. Hover and active go one and two steps STRONGER than the rest; `selected`
 * is generated at the OKLCH midpoint of the rest and the hover (#1427): the area of a selected
 * fill weighs less than its hover and differs from its rest (#1264), and no step of the ramp
 * lies there.
 */
export const EMPHASIS_STEPS = { default: '04', hover: '03', active: '02' } as const;

export type EmphasisState = keyof typeof EMPHASIS_STEPS | 'selected';

/** Every state of the emphasis band, the generated `selected` included. */
export const EMPHASIS_STATES: readonly EmphasisState[] = ['default', 'hover', 'active', 'selected'];

/**
 * The inverse pair of a tint family (spec 6.1d): the surface that flips with the mode (`02`)
 * and its less marked level (`03`), the fill and the hover of the dark variants. `selected` is
 * generated at their OKLCH midpoint, as for the emphasis band (#1427).
 */
export const INVERSE_STEPS = { default: '02', muted: '03' } as const;
