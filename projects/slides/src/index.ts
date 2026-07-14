/**
 * @maggioli-design-system/slides
 *
 * Generate on-brand presentation decks from Markdown + frontmatter, built on
 * Magma design tokens and styles.
 *
 * Typical flow:
 *   const deck = parseDeck(markdownSource);
 *   const { valid, errors } = validateDeck(deck);
 *   const html = exportHtml(deck);           // self-contained HTML string
 *   const pdf = await exportPdf(deck);        // Uint8Array (one slide per page)
 */
export { parseDeck } from './parser/parse.js';
export { validateDeck, type ValidationResult } from './parser/schema.js';
export { renderDeck, renderSlide } from './render/render-deck.js';
export { getLayout, hasLayout } from './render/layout-registry.js';
export type { LayoutRenderer } from './render/layouts.js';
export { exportHtml, type HtmlOptions } from './export/html.js';
export { exportPdf, type PdfOptions } from './export/pdf.js';
export { applyUtilities } from './export/tailwind.js';
export { collectCss } from './export/collect-css.js';

export type { Deck, DeckConfig, Slide, SlideConfig, LayoutName } from './model/types.js';
export { LAYOUT_NAMES } from './model/types.js';
