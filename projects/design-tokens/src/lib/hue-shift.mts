import chroma from "chroma-js";
import type { RgbHexColor } from "@/leonardo/index.js";

export type HueShiftEasing = "linear" | "step";

export interface HueShiftCurveParams {
  /**
   * Fraction (0..1) of the center-to-edge distance where no shift is applied.
   * With 10 steps and deadZone 1/3 the 4 central steps stay untouched.
   */
  deadZone?: number;
  /**
   * Ramp shape outside the dead zone: "linear" fades the shift in,
   * "step" applies the full shift to every step outside the dead zone.
   */
  easing?: HueShiftEasing;
}

export type HueShiftCurve =
  | "smooth"
  | "hard"
  | HueShiftCurveParams
  | number[];

export interface HueShiftConfig {
  /**
   * Hue rotation in degrees applied at full weight to the physically
   * darkest steps of the scale, regardless of theme mode.
   */
  dark?: number;
  /**
   * Hue rotation in degrees applied at full weight to the physically
   * lightest steps of the scale, regardless of theme mode.
   */
  light?: number;
  /** Intensity curve across the scale. Defaults to "smooth". */
  curve?: HueShiftCurve;
}

export interface HueShiftGroup {
  /** Effective hue rotation in degrees shared by these steps. */
  angle: number;
  /** Indices into the resolved ratios array, ascending. */
  stepIndices: number[];
}

export type ThemeMode = "light" | "dark";

const MAX_ANGLE = 60;

const CURVE_PRESETS: Record<string, Required<HueShiftCurveParams>> = {
  smooth: { deadZone: 1 / 3, easing: "linear" },
  hard: { deadZone: 1 / 3, easing: "step" },
};

function normalizeCurve(
  curve: Exclude<HueShiftCurve, number[]>,
): Required<HueShiftCurveParams> {
  if (typeof curve === "string") {
    const preset = CURVE_PRESETS[curve];
    if (!preset) {
      throw new Error(
        `Unknown hueShift curve preset "${curve}". Available presets: ${Object.keys(CURVE_PRESETS).join(", ")}`,
      );
    }
    return preset;
  }
  const deadZone = curve.deadZone ?? CURVE_PRESETS.smooth.deadZone;
  const easing = curve.easing ?? CURVE_PRESETS.smooth.easing;
  if (deadZone < 0 || deadZone >= 1) {
    throw new Error(
      `hueShift curve deadZone must be in the [0, 1) range, got ${deadZone}`,
    );
  }
  if (easing !== "linear" && easing !== "step") {
    throw new Error(
      `hueShift curve easing must be "linear" or "step", got "${easing}"`,
    );
  }
  return { deadZone, easing };
}

function resampleWeights(weights: number[], steps: number): number[] {
  if (weights.length === steps) return [...weights];
  if (weights.length === 1) return new Array(steps).fill(weights[0]);
  const lastSource = weights.length - 1;
  const lastTarget = steps - 1;
  return Array.from({ length: steps }, (_, i) => {
    const position = (i / lastTarget) * lastSource;
    const low = Math.floor(position);
    const high = Math.min(low + 1, lastSource);
    const t = position - low;
    return Math.round(weights[low] * (1 - t) + weights[high] * t);
  });
}

/**
 * Resolve a hue shift curve to one intensity weight (0..100) per step.
 * Weights are symmetric around the center of the scale: full intensity at
 * both ends, zero inside the dead zone. Explicit arrays are resampled with
 * linear interpolation when their length differs from the step count, so
 * the same curve works for scales of any size.
 */
export function resolveCurveWeights(
  curve: HueShiftCurve,
  steps: number,
): number[] {
  if (steps < 2) {
    throw new Error(`hueShift needs at least 2 steps, got ${steps}`);
  }
  if (Array.isArray(curve)) {
    if (curve.length < 1) {
      throw new Error("hueShift curve array must not be empty");
    }
    curve.forEach((weight, i) => {
      if (typeof weight !== "number" || weight < 0 || weight > 100) {
        throw new Error(
          `hueShift curve weights must be numbers in the [0, 100] range, got ${weight} at index ${i}`,
        );
      }
    });
    return resampleWeights(curve, steps);
  }
  const { deadZone, easing } = normalizeCurve(curve);
  // tolerance keeps steps sitting exactly on the dead zone boundary from
  // flipping to full shift because of floating point noise
  const epsilon = 1e-9;
  return Array.from({ length: steps }, (_, i) => {
    const position = i / (steps - 1);
    const distance = Math.abs(position - 0.5) * 2;
    if (distance <= deadZone + epsilon) return 0;
    if (easing === "step") return 100;
    return Math.round((100 * (distance - deadZone)) / (1 - deadZone));
  });
}

/**
 * Rotate the hue of a color in OKLCH keeping lightness and chroma.
 * Achromatic colors (undefined hue) are returned unchanged.
 */
export function rotateHue(color: RgbHexColor, degrees: number): RgbHexColor {
  if (degrees === 0) return color;
  const [lightness, chromaValue, hue] = chroma(color).oklch();
  if (Number.isNaN(hue)) return color;
  const rotated = (((hue + degrees) % 360) + 360) % 360;
  return chroma.oklch(lightness, chromaValue, rotated).hex() as RgbHexColor;
}

function clampedAngle(angle: number, side: string): number {
  if (Math.abs(angle) > MAX_ANGLE) {
    throw new Error(
      `hueShift ${side} angle must be in the [-${MAX_ANGLE}, ${MAX_ANGLE}] range, got ${angle}`,
    );
  }
  return angle;
}

export function hasHueShift(config?: HueShiftConfig): boolean {
  if (!config) return false;
  return (config.dark ?? 0) !== 0 || (config.light ?? 0) !== 0;
}

/**
 * Compute the effective hue rotation for every step of a scale.
 *
 * Ratios are sorted by increasing contrast against the background, so the
 * first half of the scale sits close to the background and the second half
 * away from it. The dark/light semantics of the config are anchored to the
 * physical lightness of the steps: in light mode the near-background side
 * is the light one, in dark mode it is the dark one.
 */
export function resolveStepAngles(
  config: HueShiftConfig,
  steps: number,
  mode: ThemeMode,
): number[] {
  const weights = resolveCurveWeights(config.curve ?? "smooth", steps);
  const dark = clampedAngle(config.dark ?? 0, "dark");
  const light = clampedAngle(config.light ?? 0, "light");
  const nearBackground = mode === "light" ? light : dark;
  const farFromBackground = mode === "light" ? dark : light;
  return weights.map((weight, i) => {
    const angle = i < steps / 2 ? nearBackground : farFromBackground;
    return (angle * weight) / 100;
  });
}

/**
 * Group scale steps by their effective hue rotation, so that steps sharing
 * the same rotated seed can be generated by a single Leonardo color scale.
 */
export function groupStepsByAngle(
  config: HueShiftConfig,
  steps: number,
  mode: ThemeMode,
): HueShiftGroup[] {
  const angles = resolveStepAngles(config, steps, mode);
  const groups = new Map<number, number[]>();
  angles.forEach((angle, i) => {
    const key = Math.round(angle * 1000) / 1000;
    const indices = groups.get(key);
    if (indices) indices.push(i);
    else groups.set(key, [i]);
  });
  return [...groups.entries()].map(([angle, stepIndices]) => ({
    angle,
    stepIndices,
  }));
}
