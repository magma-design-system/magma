import { msg } from './i18n.js';

/*
  How the two ends of a custom hue shift move together, a choice of the editor of the hue shifting
  (vittorio, 2026-11-05): free, each end on its own; mirror, one end goes the opposite way of the
  other (dark = -light); linked, one end goes the same way as the other (dark = light). The one
  moved moves the other. The configuration keeps the two ends only (HueShiftConfig: dark, light,
  curve), so the editor reads the link back from them: equal ends are linked, opposite ends
  mirrored, any other pair free; two zero ends (no hue shift yet, or off) take the default.
*/

export type HueEnds = 'free' | 'mirror' | 'linked';

/** The link a hue shift starts from: mirror (vittorio, 2026-11-05). */
export const DEFAULT_ENDS: HueEnds = 'mirror';

export const HUE_ENDS: { value: HueEnds; label: string }[] = [
  { value: 'free', label: msg('Free') },
  { value: 'mirror', label: msg('Mirror') },
  { value: 'linked', label: msg('Linked') },
];

/** The link two ends show: equal, opposite or neither; two zero ends the default. */
export function endsOf(dark: number, light: number): HueEnds {
  if (dark === 0 && light === 0) return DEFAULT_ENDS;
  if (dark === light) return 'linked';
  if (dark === -light) return 'mirror';
  return 'free';
}

// the opposite of an end, never -0: the configuration and its JSON keep a plain 0
const opposite = (value: number): number => (value === 0 ? 0 : -value);

/** The two ends after one of them moved to `value`: the other follows the link. */
export function moveEnd(
  ends: HueEnds,
  current: { dark: number; light: number },
  end: 'dark' | 'light',
  value: number,
): { dark: number; light: number } {
  const other = end === 'dark' ? current.light : current.dark;
  const follower = ends === 'mirror' ? opposite(value) : ends === 'linked' ? value : other;
  return end === 'dark' ? { dark: value, light: follower } : { dark: follower, light: value };
}
