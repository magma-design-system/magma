import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);

/**
 * Magma base styles, in `@layer` order. Concatenated (not @import-ed) so the
 * built deck is self-contained; verified free of `@import`/`url()` in the
 * shipped `styles` package.
 */
const STYLES_FILES = [
  'reset.css',
  'globals.css',
  'colors-rgb.css',
  'typography.css', // --font-*, --text-size-*, --spacing(-*), --radius-*, --shadow-* on :root
  'hydrated.css',
  'animations.css',
  'base.css',
];

/** Local theme layers, resolved from dist/theme (copied there at build time). */
const localCss = (file: string): string =>
  readFileSync(fileURLToPath(new URL(`../theme/${file}`, import.meta.url)), 'utf8');

/**
 * Like localCss but returns '' if the file is absent. slides.css is a build
 * artifact (compiled from slides.src.css), so it only exists next to the built
 * dist module - not when running from source (unit tests).
 */
const tryLocalCss = (file: string): string => {
  try {
    return localCss(file);
  } catch {
    return '';
  }
};

const magmaCss = (file: string): string => {
  const resolved = require.resolve(`@maggioli-design-system/styles/dist/css/${file}`);
  return readFileSync(resolved, 'utf8');
};

/** Map a theme name (e.g. `maggioli-dark`) to its theme CSS file. */
function themeFile(theme: string | undefined): string {
  const base = (theme ?? 'maggioli').replace(/-dark$/, '') || 'maggioli';
  try {
    return localCss(`theme-${base}.css`);
  } catch {
    return localCss('theme-maggioli.css');
  }
}

/**
 * Build the full CSS for a deck: Magma tokens/base + slide tokens + structure +
 * the selected theme + the presentation view CSS. Returned as one string ready
 * to inline in a `<style>` element.
 */
export function collectCss(theme?: string): string {
  const parts: string[] = [];
  for (const file of STYLES_FILES) {
    try {
      parts.push(magmaCss(file));
    } catch {
      // A styles build without this optional file: skip it.
    }
  }
  parts.push(localCss('tokens.css'));
  parts.push(tryLocalCss('slides.css')); // build artifact; absent when run from source
  parts.push(themeFile(theme));
  parts.push(localCss('deck-view.css'));
  return parts.join('\n');
}
