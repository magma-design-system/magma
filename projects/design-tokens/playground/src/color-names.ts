import chroma from 'chroma-js';

/**
 * Curated color vocabulary used to auto-name colors from their value.
 * Names are design-system friendly; values are perceptual anchors, the
 * nearest one by deltaE wins.
 */
const NAMED_COLORS: Record<string, string> = {
  crimson: '#dc143c',
  red: '#e02b2b',
  scarlet: '#ff2400',
  coral: '#ff7f50',
  salmon: '#fa8072',
  peach: '#ffcba4',
  orange: '#f97316',
  amber: '#f59e0b',
  gold: '#eab308',
  yellow: '#facc15',
  mustard: '#d4a017',
  lime: '#84cc16',
  chartreuse: '#7fff00',
  green: '#22c55e',
  emerald: '#10b981',
  mint: '#98ff98',
  forest: '#228b22',
  olive: '#808000',
  khaki: '#bdb76b',
  teal: '#14b8a6',
  turquoise: '#40e0d0',
  cyan: '#06b6d4',
  aqua: '#22d3ee',
  sky: '#0ea5e9',
  azure: '#3b82f6',
  blue: '#2563eb',
  cobalt: '#1d4ed8',
  navy: '#1e3a8a',
  indigo: '#4f46e5',
  violet: '#8b5cf6',
  purple: '#9333ea',
  orchid: '#c084fc',
  lavender: '#c4b5fd',
  magenta: '#d946ef',
  fuchsia: '#e879f9',
  pink: '#ec4899',
  rose: '#f43f5e',
  plum: '#8e4585',
  maroon: '#800000',
  brown: '#92400e',
  chocolate: '#7b3f00',
  sienna: '#a0522d',
  tan: '#d2b48c',
  beige: '#f5f5dc',
};

/** Grays by ascending OKLCH lightness threshold. */
const GRAYS: Array<[string, number]> = [
  ['black', 0.16],
  ['charcoal', 0.35],
  ['gray', 0.62],
  ['silver', 0.8],
  ['smoke', 0.93],
  ['white', Infinity],
];

export function nearestColorName(hex: string): string {
  const [lightness, chromaValue, hue] = chroma(hex).oklch();
  if (Number.isNaN(hue) || chromaValue < 0.04) {
    for (const [name, threshold] of GRAYS) {
      if (lightness <= threshold) return name;
    }
  }
  let best = 'color';
  let bestDelta = Infinity;
  for (const [name, value] of Object.entries(NAMED_COLORS)) {
    const delta = chroma.deltaE(hex, value);
    if (delta < bestDelta) {
      bestDelta = delta;
      best = name;
    }
  }
  return best;
}

/**
 * Whether a name looks system-assigned (placeholder or vocabulary word,
 * with an optional -N uniqueness suffix). Auto-renaming on picker release
 * only happens while this holds, so a name typed by the user sticks.
 */
export function isAutoName(name: string): boolean {
  const base = name.replace(/-\d+$/, '');
  return base === 'new' || base in NAMED_COLORS || GRAYS.some(([gray]) => gray === base);
}
