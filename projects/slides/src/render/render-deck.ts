import type { Deck, Slide } from '../model/types.js';
import { getLayout } from './layout-registry.js';
import { renderFooter } from './footer.js';

/** Render a single slide to its `<section>` markup, with its footer if any. */
export function renderSlide(slide: Slide, deck: Deck): string {
  const inner = getLayout(slide.layout)(slide, deck);
  const footer = renderFooter(slide, deck);
  const footerClass = footer ? ' has-footer' : '';
  return (
    `<section class="mds-slide${footerClass}" data-layout="${slide.layout}" data-index="${slide.index}">` +
    inner +
    footer +
    `</section>`
  );
}

/**
 * Render a deck to an HTML fragment: a `.mds-deck` container holding one
 * `<section class="mds-slide">` per slide. This is pure (no fs/network) and is
 * the building block used by {@link exportHtml}. It carries no `<html>`/CSS;
 * wrap it in a document (and set the theme class on the root) to display.
 */
export function renderDeck(deck: Deck): string {
  const sections = deck.slides.map((slide) => renderSlide(slide, deck)).join('\n');
  return `<div class="mds-deck">\n${sections}\n</div>`;
}
