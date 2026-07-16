import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { themeBase } from './theme.js';
import type { Deck, FooterConfig, Slide } from '../model/types.js';

const LOGO_EXTS = ['svg', 'png', 'webp', 'jpg'];
const themeLogoCache = new Map<string, string | null>();

/**
 * Absolute path to the selected theme's default logo, if it ships one under
 * theme/themes/<theme>/logo.* (resolved from the package, so it works from src
 * in dev and from dist when built). Returned as an absolute path that
 * `embedImages` inlines as a data URI on export. Per-deck `footer.logo` wins.
 */
function themeLogo(theme: string | undefined): string | undefined {
  const base = themeBase(theme);
  if (!themeLogoCache.has(base)) {
    let found: string | null = null;
    for (const ext of LOGO_EXTS) {
      const path = fileURLToPath(new URL(`../theme/themes/${base}/logo.${ext}`, import.meta.url));
      if (existsSync(path)) {
        found = path;
        break;
      }
    }
    themeLogoCache.set(base, found);
  }
  return themeLogoCache.get(base) ?? undefined;
}

const escapeHtml = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const escapeAttr = (value: string): string => escapeHtml(value).replace(/"/g, '&quot;');

/** Merge the deck footer defaults with a slide's overrides and resolved section. */
function resolveFooter(slide: Slide, deck: Deck): FooterConfig | null {
  const slideFooter = slide.config.footer;
  if (slideFooter === false) return null;

  const deckFooter = deck.config.footer;
  const override = slideFooter && typeof slideFooter === 'object' ? slideFooter : {};
  if (!deckFooter && Object.keys(override).length === 0) return null;

  return {
    ...deckFooter,
    ...override,
    section: slide.section ?? override.section ?? deckFooter?.section,
  };
}

const strong = (text: string | undefined): string =>
  text
    ? `<span class="font-bold text-[color:var(--mds-slide-heading-fg)]">${escapeHtml(text)}</span>`
    : '';

const muted = (text: string | undefined): string =>
  text ? `<span class="text-[color:var(--mds-slide-muted-fg)]">${escapeHtml(text)}</span>` : '';

/**
 * Render the persistent footer for a slide, or `''` when the slide has no
 * footer. The page number is derived from the slide index.
 *
 * Layout is inline Tailwind utilities (no hand-kept CSS layer): the package
 * build scans this file (@source in slides.src.css) and emits exactly the
 * utilities used here into the always-inlined dist/theme/slides.css. Magma's
 * --spacing base is 0.0025rem, so spacing/size/color use arbitrary values bound
 * to tokens (e.g. gap-[var(--mds-slide-gap)]) rather than numeric utilities.
 * `mds-slide__footer` and `mds-slide__footer-page` stay as semantic hooks (no
 * CSS rule) for render/print and the toggle-able page-number feature.
 */
export function renderFooter(slide: Slide, deck: Deck): string {
  const footer = resolveFooter(slide, deck);
  if (!footer) return '';

  const logoSrc = footer.logo ?? themeLogo(deck.config.theme);
  const logo = logoSrc
    ? `<img class="w-auto h-[calc(var(--mds-slide-footer-height)_-_var(--spacing-lg))]" src="${escapeAttr(logoSrc)}" alt="${escapeAttr(footer.group ?? '')}">`
    : '';
  const page =
    footer.pageNumbers === false
      ? ''
      : `<span class="mds-slide__footer-page tabular-nums text-[color:var(--mds-slide-muted-fg)]">${slide.index + 1}</span>`;

  return `<footer class="mds-slide__footer absolute inset-x-0 bottom-0 flex items-center justify-between h-[var(--mds-slide-footer-height)] gap-[var(--mds-slide-gap)] px-[var(--mds-slide-padding)] border-t border-solid border-[color:var(--mds-slide-rule)] leading-[1.2] font-[family-name:var(--mds-slide-font-heading)] text-[length:var(--mds-slide-footer-size)]">
    <div class="flex items-center gap-[var(--spacing-md)] min-w-0">
      ${logo}
      <span class="flex flex-col min-w-0">${strong(footer.group)}${muted(footer.groupDetail)}</span>
    </div>
    <div class="flex items-center gap-[var(--spacing-md)] min-w-0">
      <span class="flex flex-col min-w-0 items-end text-right">
        ${strong(footer.subject)}${muted(footer.section)}
      </span>
      ${page}
    </div>
  </footer>`;
}
