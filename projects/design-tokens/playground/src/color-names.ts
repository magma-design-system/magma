import namer from 'color-namer';

/**
 * Name a color after the nearest entry of the "Name That Color" list
 * (~1500 names) via color-namer, kebab-cased so it can be used directly
 * as a token name (e.g. #0f9b8e -> persian-green).
 */
export function nearestColorName(hex: string): string {
  const best = namer(hex, { pick: ['ntc'] }).ntc[0];
  return best.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
