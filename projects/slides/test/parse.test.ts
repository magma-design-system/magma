import { describe, expect, it } from 'vitest';
import { parseDeck } from '../src/parser/parse.js';

const deckSource = `---
title: My Deck
author: Jane
theme: maggioli
tokens:
  --mds-slide-accent: rgb(var(--variant-secondary))
---

# Cover

---
layout: content
title: Agenda
---

- One
- Two

---
layout: section
title: Divider
---

---
layout: quote
---

> A quote
`;

describe('parseDeck', () => {
  it('reads deck-level frontmatter', () => {
    const deck = parseDeck(deckSource);
    expect(deck.config.title).toBe('My Deck');
    expect(deck.config.author).toBe('Jane');
    expect(deck.config.theme).toBe('maggioli');
    expect(deck.config.tokens).toEqual({
      '--mds-slide-accent': 'rgb(var(--variant-secondary))',
    });
  });

  it('splits into slides and resolves layouts', () => {
    const deck = parseDeck(deckSource);
    expect(deck.slides.map((s) => s.layout)).toEqual([
      'title', // first slide defaults to title
      'content',
      'section',
      'quote',
    ]);
  });

  it('keeps a section slide with no body as an empty-body slide', () => {
    const deck = parseDeck(deckSource);
    const section = deck.slides[2];
    expect(section?.layout).toBe('section');
    expect(section?.config.title).toBe('Divider');
    expect(section?.markdown).toBe('');
  });

  it('renders markdown bodies to HTML', () => {
    const deck = parseDeck(deckSource);
    expect(deck.slides[1]?.html).toContain('<li>One</li>');
    expect(deck.slides[3]?.html).toContain('<blockquote>');
  });

  it('does not treat a prose slide as frontmatter', () => {
    const deck = parseDeck(`---\ntitle: D\n---\n\nJust prose here.\n`);
    expect(deck.slides).toHaveLength(1);
    expect(deck.slides[0]?.html).toContain('Just prose here.');
  });
});
