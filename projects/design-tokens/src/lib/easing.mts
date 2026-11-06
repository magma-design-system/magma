// Named easings over [0, 1]: linear, then seven families from the gentlest to the strongest, each
// as in, out and in-out (Penner-style). The studio distributes the stops of a contrast scale with
// them, and the hue shift ramps its weights outside the dead zone with them (hue-shift.mts). Each
// maps 0 to 0 and 1 to 1 and stays in [0, 1]: no family overshoots (there is no "back").

export type EasingFn = (t: number) => number;

const EASE_IN = {
  sine: (t: number) => 1 - Math.cos((t * Math.PI) / 2),
  quad: (t: number) => t * t,
  cubic: (t: number) => t ** 3,
  quart: (t: number) => t ** 4,
  quint: (t: number) => t ** 5,
  expo: (t: number) => (t === 0 ? 0 : 2 ** (10 * t - 10)),
  circ: (t: number) => 1 - Math.sqrt(1 - t * t),
} satisfies Record<string, EasingFn>;

export type EasingFamily = keyof typeof EASE_IN;
export type EasingName = "linear" | `${EasingFamily}-${"in" | "out" | "in-out"}`;

/** The easings by family, in their order: linear alone, then each family as in, out, in-out. */
export const EASING_FAMILIES = { linear: ["linear"] } as Record<
  "linear" | EasingFamily,
  EasingName[]
>;

/** The function of each easing, by its name. */
export const EASINGS = { linear: (t: number) => t } as Record<EasingName, EasingFn>;

for (const [family, easeIn] of Object.entries(EASE_IN) as [EasingFamily, EasingFn][]) {
  EASINGS[`${family}-in`] = easeIn;
  EASINGS[`${family}-out`] = (t) => 1 - easeIn(1 - t);
  EASINGS[`${family}-in-out`] = (t) =>
    t < 0.5 ? easeIn(2 * t) / 2 : 1 - easeIn(2 * (1 - t)) / 2;
  EASING_FAMILIES[family] = [`${family}-in`, `${family}-out`, `${family}-in-out`];
}

/** Every easing name, in the order of the families. */
export const EASING_NAMES: EasingName[] = Object.values(EASING_FAMILIES).flat();
