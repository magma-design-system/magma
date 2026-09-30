import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';

const require = createRequire(import.meta.url);

/** One embedded font face: a Latin subset from an `@fontsource` package. */
export interface FontFace {
  family: string;
  /** `@fontsource/<pkg>` package name, also the file prefix. */
  pkg: string;
  weight: number;
  style: 'normal' | 'italic';
}

/**
 * The Magma type families (styles/dist/css/typography.css), each in the weights
 * the slide CSS uses: Roboto for titles (`--font-title`), Karla for the chrome
 * (`--font-info`), Merriweather for body text (`--font-read`, with italics for
 * Markdown emphasis) and Roboto Mono for code (`--font-code`).
 *
 * Magma does not bundle webfonts - the consumer app loads them - but a deck is a
 * self-contained file, so the export embeds them. Latin subset only: it covers
 * Italian and the other Western European languages (U+0000-00FF and common
 * punctuation); anything outside it falls back to the system font.
 */
export const FONT_FACES: readonly FontFace[] = [
  { family: 'Roboto', pkg: 'roboto', weight: 400, style: 'normal' },
  { family: 'Roboto', pkg: 'roboto', weight: 500, style: 'normal' },
  { family: 'Roboto', pkg: 'roboto', weight: 700, style: 'normal' },
  { family: 'Roboto', pkg: 'roboto', weight: 900, style: 'normal' },
  { family: 'Karla', pkg: 'karla', weight: 400, style: 'normal' },
  { family: 'Karla', pkg: 'karla', weight: 700, style: 'normal' },
  { family: 'Merriweather', pkg: 'merriweather', weight: 400, style: 'normal' },
  { family: 'Merriweather', pkg: 'merriweather', weight: 400, style: 'italic' },
  { family: 'Merriweather', pkg: 'merriweather', weight: 700, style: 'normal' },
  { family: 'Merriweather', pkg: 'merriweather', weight: 700, style: 'italic' },
  { family: 'Roboto Mono', pkg: 'roboto-mono', weight: 400, style: 'normal' },
];

let cache: string | null = null;

/** `@font-face` rules for {@link FONT_FACES}, each file inlined as a data URI. */
export function fontFaceCss(): string {
  if (cache != null) return cache;
  cache = FONT_FACES.map(({ family, pkg, weight, style }) => {
    const file = require.resolve(`@fontsource/${pkg}/files/${pkg}-latin-${weight}-${style}.woff2`);
    const data = readFileSync(file).toString('base64');
    return `@font-face {
  font-display: swap;
  font-family: '${family}';
  font-style: ${style};
  font-weight: ${weight};
  src: url(data:font/woff2;base64,${data}) format('woff2');
}`;
  }).join('\n');
  return cache;
}
