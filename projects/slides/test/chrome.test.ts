import { describe, expect, it } from 'vitest';
import { parseDeck } from '../src/parser/parse.js';
import { renderDeck, renderSlide } from '../src/render/render-deck.js';
import { exportHtml } from '../src/export/html.js';

const source = `---
header: true
footer: true
logo: logo.svg
group: The Group
groupDetail: The Detail
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
layout: section
title: Break
---

---
layout: content
title: C
footer: false
---

body c
`;

const header = (html: string): string => html.match(/<header\b[\s\S]*?<\/header>/)?.[0] ?? '';
const footer = (html: string): string => html.match(/<footer\b[\s\S]*?<\/footer>/)?.[0] ?? '';

describe('chrome zones', () => {
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

  it('places each element where the theme says, not where the deck lists it', () => {
    const deck = parseDeck(source);
    const html = renderSlide(deck.slides[2], deck);
    // business: header = logo | subject + section, footer = group + detail | page
    expect(header(html)).toContain('data-element="logo"');
    expect(header(html)).toContain('The Subject');
    expect(header(html)).toContain('Chapter 1');
    expect(header(html)).not.toContain('data-element="group"');
    expect(footer(html)).toContain('The Group');
    expect(footer(html)).toContain('The Detail');
    expect(footer(html)).toMatch(/data-element="page"[^>]*>3</);
    expect(footer(html)).not.toContain('data-element="subject"');
    expect(html).toContain('class="mds-slide has-header has-footer"');
  });

  it('applies the theme per-layout defaults, and a slide override wins', () => {
    const deck = parseDeck(source);
    const [cover, , , section, last] = deck.slides.map((s) => renderSlide(s, deck));
    expect(header(cover)).toBe(''); // title hides the header
    expect(footer(cover)).not.toBe('');
    expect(header(section)).toBe(''); // section hides both
    expect(footer(section)).toBe('');
    expect(footer(last)).toBe(''); // footer: false
    expect(header(last)).not.toBe('');

    const forced = parseDeck(
      `---\nfooter: true\ngroup: G\n---\n\n---\nlayout: section\nfooter: true\n---\n\nx\n`,
    );
    expect(footer(renderSlide(forced.slides[0], forced))).toContain('G');
  });

  it('shows no zone unless the deck or the slide turns it on', () => {
    const deck = parseDeck(`---\ngroup: G\nsubject: S\n---\n\n---\nlayout: content\n---\n\nx\n`);
    const html = renderDeck(deck);
    expect(html).not.toMatch(/<header\b|<footer\b/);

    const one = parseDeck(`---\ngroup: G\n---\n\n---\nlayout: content\nfooter: true\n---\n\nx\n`);
    expect(footer(renderDeck(one))).toContain('G');
  });

  it('drops a zone whose elements are all empty, and hides page numbers on request', () => {
    // business has no default logo: a header with no logo, subject or section is empty
    const deck = parseDeck(
      `---\nheader: true\nfooter: true\npageNumbers: false\n---\n\n---\nlayout: content\n---\n\nx\n`,
    );
    const html = renderDeck(deck);
    expect(html).not.toMatch(/<header\b|<footer\b/);
    expect(html).not.toContain('has-header');
  });

  it('lets a slide override chrome content', () => {
    const deck = parseDeck(
      `---\nfooter: true\ngroup: Deck group\n---\n\n---\nlayout: content\ngroup: Slide group\n---\n\nx\n`,
    );
    expect(footer(renderDeck(deck))).toContain('Slide group');
  });
});

describe('theme and scheme on the document root', () => {
  it('sets the Magma theme name and the scheme class independently', () => {
    const html = exportHtml(parseDeck(`---\ntheme: business\nscheme: dark\n---\n\n# Hi\n`));
    expect(html).toMatch(/<html[^>]*class="pref-theme-scheme-dark"[^>]*data-theme-name="business"/);
  });

  it('falls back to the default theme for a theme the package does not ship', () => {
    const html = exportHtml(parseDeck(`---\ntheme: neon\n---\n\n# Hi\n`));
    expect(html).toContain('data-theme-name="business"');
    expect(html).toContain('class="pref-theme-scheme-light"');
  });

  it('never lets a theme name escape the themes folder or the attribute', () => {
    for (const theme of ['../../package', 'business" onload="x']) {
      const html = exportHtml(parseDeck(`---\ntheme: '${theme}'\n---\n\n# Hi\n`));
      expect(html).toContain('data-theme-name="business"');
    }
  });
});
