import {
  CURVE_PRESETS,
  HUE_SHIFT_EASINGS,
} from '@maggioli-design-system/design-tokens/src/lib/hue-shift.mjs';
import type { Option } from '../magma/magma.js';

/*
  The curves across a scale, as the editors of the colours offer them: the hue shifting
  (hue-shift-editor.tsx) and the saturation (saturation-editor.tsx) take the same curves of the
  engine (hue-shift.mts, resolveCurveWeights).
*/

// the named curves of the engine, then a custom one edited by its parameters
export type CurvePreset = keyof typeof CURVE_PRESETS;
export type CurveKind = CurvePreset | 'custom';

/**
 * A custom curve starts from smooth, the default: no dead zone and a linear ramp, so a person who
 * turns to custom changes the curve they were looking at (vittorio, 2026-11-05 and 2026-11-06).
 */
export const CUSTOM_CURVE_START = CURVE_PRESETS.smooth;

/** The ramps of a custom curve: every easing the engine takes, in its order (easing.mts). */
export const EASING_OPTIONS: Option[] = HUE_SHIFT_EASINGS.map((name) => ({
  value: name,
  label: name,
}));
export const CURVE_KINDS: CurveKind[] = [
  ...(Object.keys(CURVE_PRESETS) as CurvePreset[]),
  'custom',
];
