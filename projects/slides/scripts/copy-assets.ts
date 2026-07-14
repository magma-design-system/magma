/**
 * tsc emits only JS/d.ts and `build-css` compiles slides.src.css into
 * dist/theme/slides.css. This copies the remaining runtime assets the renderer
 * reads from dist: the static theme CSS layers and the JSON Schema.
 */
import { copyFileSync, cpSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));

// Static theme CSS inlined at runtime (slides.css is produced by build-css;
// base.css is playground-only and intentionally not shipped).
const themeFiles = ['tokens.css', 'deck-view.css', 'theme-maggioli.css'];

mkdirSync(`${root}dist/theme`, { recursive: true });
for (const file of themeFiles) {
  copyFileSync(`${root}src/theme/${file}`, `${root}dist/theme/${file}`);
}

mkdirSync(`${root}dist/schema`, { recursive: true });
cpSync(`${root}src/schema`, `${root}dist/schema`, { recursive: true });

console.log('copied assets to dist/');
