import { describe, expect, it } from 'vitest';
import { parseDeck } from '../src/parser/parse.js';
import { renderDeck } from '../src/render/render-deck.js';
import { exportHtml } from '../src/export/html.js';

const source = `---
title: Render Test
theme: maggioli-dark
tokens:
  --mds-slide-accent: rgb(var(--variant-secondary))
---

# Cover

---
layout: content
title: Body
---

Hello world
`;

describe('renderDeck', () => {
  it('renders one section per slide with layout metadata', () => {
    const deck = parseDeck(source);
    const html = renderDeck(deck);
    expect(html).toContain('class="mds-deck"');
    expect((html.match(/class="mds-slide"/g) ?? []).length).toBe(2);
    expect(html).toContain('data-layout="title"');
    expect(html).toContain('data-layout="content"');
  });
});

describe('exportHtml', () => {
  it('produces a self-contained document with theme and token overrides', () => {
    const deck = parseDeck(source);
    const html = exportHtml(deck);
    expect(html.startsWith('<!doctype html>')).toBe(true);
    expect(html).toContain('pref-theme-scheme-dark'); // maggioli-dark
    expect(html).toContain('data-magma-pref="slides"');
    expect(html).toContain('--mds-slide-accent: rgb(var(--variant-secondary));');
    expect(html).toContain('--tone-neutral'); // inlined Magma tokens
    expect(html).toContain('<title>Render Test</title>');
  });
});
