import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { collectCss } from '../src/export/collect-css.js';

const themeDir = fileURLToPath(new URL('../src/theme/', import.meta.url));

/** Every hand-authored slide stylesheet: tokens, layouts, view and each theme. */
const sources = (): Record<string, string> => {
  const files: Record<string, string> = {};
  for (const file of ['tokens.css', 'slides.src.css', 'deck-view.css']) {
    files[file] = readFileSync(`${themeDir}${file}`, 'utf8');
  }
  for (const theme of readdirSync(`${themeDir}themes`, { withFileTypes: true })) {
    if (!theme.isDirectory()) continue;
    const file = `themes/${theme.name}/theme.css`;
    files[file] = readFileSync(`${themeDir}${file}`, 'utf8');
  }
  return files;
};

const stripComments = (css: string): string => css.replace(/\/\*[\s\S]*?\*\//g, '');

describe('slide theme color contract', () => {
  it('reads colors from the semantic layer, never from --tone-* / --variant-* primitives', () => {
    for (const [file, css] of Object.entries(sources())) {
      expect(stripComments(css), file).not.toMatch(/var\(--(tone|variant)-/);
    }
  });

  it('only references --magma-* roles that the inlined styles define', () => {
    const defined = new Set(collectCss().match(/--magma-[a-z0-9-]+(?=\s*:)/g));
    for (const [file, css] of Object.entries(sources())) {
      for (const [, name] of stripComments(css).matchAll(/var\((--magma-[a-z0-9-]+)/g)) {
        expect(defined.has(name), `${file}: ${name}`).toBe(true);
      }
    }
  });
});
