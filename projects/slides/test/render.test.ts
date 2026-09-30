import { describe, expect, it } from 'vitest';
import { parseDeck } from '../src/parser/parse.js';
import { renderDeck } from '../src/render/render-deck.js';
import { exportHtml } from '../src/export/html.js';

const source = `---
title: Render Test
scheme: dark
tokens:
  --mds-slide-accent: rgb(var(--magma-accent-ai-emphasis))
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
    expect(html).toContain('pref-theme-scheme-dark'); // scheme: dark
    expect(html).toContain('data-magma-pref="slides"');
    expect(html).toContain('--mds-slide-accent: rgb(var(--magma-accent-ai-emphasis));');
    expect(html).toContain('--tone-neutral-seed'); // inlined Magma primitives
    expect(html).toContain('--magma-surface-default:'); // inlined semantic layer
    expect(html).toContain('<title>Render Test</title>');
  });
});
