import { describe, expect, it } from 'vitest';
import { parseDeck } from '../src/parser/parse.js';
import { renderDeck } from '../src/render/render-deck.js';

const source = `---
footer:
  group: The Group
  subject: The Subject
  section: Intro
---

# Cover

---
layout: content
title: A
---

body a

---
section: Chapter 1
layout: content
title: B
---

body b

---
layout: content
title: C
---

body c

---
title: Closing
footer: false
---
`;

describe('footer', () => {
  it('resolves the sticky section forward until changed', () => {
    const deck = parseDeck(source);
    expect(deck.slides.map((s) => s.section)).toEqual([
      'Intro', // deck default
      'Intro',
      'Chapter 1', // set here
      'Chapter 1', // sticky
      'Chapter 1', // still sticky, even though its footer is hidden
    ]);
  });

  it('renders a footer on every slide except where hidden', () => {
    const deck = parseDeck(source);
    const html = renderDeck(deck);
    // 5 slides, last one has `footer: false`
    expect((html.match(/<footer\b/g) ?? []).length).toBe(4);
    expect(html).toContain('The Group');
    expect(html).toContain('The Subject');
    expect(html).toContain('Chapter 1');
  });

  it('shows automatic page numbers', () => {
    const deck = parseDeck(source);
    const html = renderDeck(deck);
    expect(html).toMatch(/class="mds-slide__footer-page[^"]*">1</);
    expect(html).toMatch(/class="mds-slide__footer-page[^"]*">4</);
  });
});
