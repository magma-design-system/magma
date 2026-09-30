import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { FONT_FACES, fontFaceCss } from '../src/export/fonts.js';
import { exportHtml } from '../src/export/html.js';
import { parseDeck } from '../src/parser/parse.js';

describe('embedded Magma fonts', () => {
  it('inlines one woff2 face per declared font, so decks render offline', () => {
    const css = fontFaceCss();
    expect((css.match(/@font-face/g) ?? []).length).toBe(FONT_FACES.length);
    expect((css.match(/url\(data:font\/woff2;base64,/g) ?? []).length).toBe(FONT_FACES.length);
    for (const family of ['Roboto', 'Karla', 'Merriweather', 'Roboto Mono']) {
      expect(css).toContain(`font-family: '${family}'`);
    }
    expect(exportHtml(parseDeck('# Hi\n'))).toContain("font-family: 'Roboto Mono'");
  });

  it('embeds every font-weight the slide CSS asks the title family for', () => {
    // Every font-weight in slides.src.css sits in a rule set in the title
    // family (--mds-slide-font-heading); a weight Roboto is not embedded in
    // would be synthesized by the browser instead.
    const src = readFileSync(new URL('../src/theme/slides.src.css', import.meta.url), 'utf8');
    const used = [...src.matchAll(/font-weight:\s*(\d+)/g)].map(([, weight]) => Number(weight));
    const roboto = FONT_FACES.filter((f) => f.family === 'Roboto').map((f) => f.weight);
    expect(used.length).toBeGreaterThan(0);
    for (const weight of used) expect(roboto).toContain(weight);
  });
});
