import type { Deck, Slide } from '../model/types.js';

/** Renders the inner HTML of a slide for a given layout. */
export type LayoutRenderer = (slide: Slide, deck: Deck) => string;

const escapeHtml = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const escapeAttr = (value: string): string => escapeHtml(value).replace(/"/g, '&quot;');

const asString = (value: unknown): string => (typeof value === 'string' ? value : '');

const title = (slide: Slide, deck: Deck): string =>
  asString(slide.config.title) || (slide.index === 0 ? asString(deck.config.title) : '');

const author = (deck: Deck): string => asString(deck.config.author);

const image = (slide: Slide): string => asString(slide.config.image);

const heading = (text: string): string =>
  text ? `<h1 class="mds-slide__heading">${escapeHtml(text)}</h1>` : '';

const layouts: Record<string, LayoutRenderer> = {
  title(slide, deck) {
    const t = title(slide, deck);
    const by = author(deck)
      ? `<div class="mds-slide__author">${escapeHtml(author(deck))}</div>`
      : '';
    // No explicit title: the body carries the title.
    if (!t) return `<div class="mds-slide__title">${slide.html}</div>${by}`;
    // Explicit title: the body (if any) becomes a subtitle beneath it.
    const subtitle = slide.html ? `<div class="mds-slide__subtitle">${slide.html}</div>` : '';
    return `<div class="mds-slide__title">${escapeHtml(t)}</div>${subtitle}${by}`;
  },

  section(slide, deck) {
    const t = title(slide, deck);
    return t ? `<div class="mds-slide__title">${escapeHtml(t)}</div>` : slide.html;
  },

  content(slide, deck) {
    return `${heading(title(slide, deck))}<div class="mds-slide__body">${slide.html}</div>`;
  },

  'two-column'(slide, deck) {
    const img = image(slide);
    if (img) {
      return (
        `${heading(title(slide, deck))}` +
        `<div class="mds-slide__columns">` +
        `<div class="mds-slide__main">${slide.html}</div>` +
        `<div class="mds-slide__aside"><img src="${escapeAttr(img)}" alt="${escapeAttr(title(slide, deck))}"></div>` +
        `</div>`
      );
    }
    return `${heading(title(slide, deck))}<div class="mds-slide__body mds-slide__body--cols">${slide.html}</div>`;
  },

  quote(slide) {
    const body = /<blockquote/i.test(slide.html)
      ? slide.html
      : `<blockquote>${slide.html}</blockquote>`;
    return body;
  },

  'image-full'(slide, deck) {
    const img = image(slide);
    const t = title(slide, deck);
    const caption = t ? `<div class="mds-slide__caption">${escapeHtml(t)}</div>` : '';
    if (!img) return slide.html + caption;
    return `<img class="mds-slide__image" src="${escapeAttr(img)}" alt="${escapeAttr(t)}">${caption}`;
  },

  code(slide, deck) {
    return `${heading(title(slide, deck))}${slide.html}`;
  },
};

export default layouts;
