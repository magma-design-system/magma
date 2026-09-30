import { loadTheme } from './theme.js';
import type {
  ChromeContent,
  ChromeElement,
  ChromeItem,
  Deck,
  Slide,
  ZoneName,
  ZonePlacement,
} from '../model/types.js';

const escapeHtml = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const escapeAttr = (value: string): string => escapeHtml(value).replace(/"/g, '&quot;');

const CONTENT_KEYS = ['logo', 'group', 'groupDetail', 'subject', 'section', 'pageNumbers'] as const;

/** Pick the chrome content fields out of a deck or slide config. */
function pickContent(source: ChromeContent): ChromeContent {
  const picked: Record<string, unknown> = {};
  for (const key of CONTENT_KEYS) {
    if (source[key] !== undefined) picked[key] = source[key];
  }
  return picked as ChromeContent;
}

/** Deck defaults, then slide overrides, then the resolved sticky section. */
function resolveContent(slide: Slide, deck: Deck): ChromeContent {
  return {
    ...pickContent(deck.config),
    ...pickContent(slide.config),
    section: slide.section,
  };
}

/**
 * Whether a zone shows on a slide. Precedence, highest first: the slide's own
 * `header`/`footer`, the theme's per-layout default (it can only hide), the
 * deck's `header`/`footer` (default off). A zone the theme does not place
 * never shows.
 */
export function zoneEnabled(zone: ZoneName, slide: Slide, deck: Deck): boolean {
  const theme = loadTheme(deck.config.theme);
  if (!theme[zone]) return false;
  const explicit = slide.config[zone];
  if (typeof explicit === 'boolean') return explicit;
  if (theme.layouts?.[slide.layout]?.[zone] === false) return false;
  return deck.config[zone] === true;
}

/**
 * Render one element, or `''` when it has no content. Emphasis is the
 * element's, not the theme's: names (group, subject) are strong, their
 * details (groupDetail, section, page) are muted.
 */
function renderElement(
  element: ChromeElement,
  content: ChromeContent,
  slide: Slide,
  height: string,
  themeLogo: string | undefined,
): string {
  switch (element) {
    case 'logo': {
      const src = content.logo ?? themeLogo;
      return src
        ? `<img data-element="logo" class="w-auto h-[calc(${height}_-_var(--spacing-lg))]" src="${escapeAttr(src)}" alt="${escapeAttr(content.group ?? '')}">`
        : '';
    }
    case 'page':
      return content.pageNumbers === false
        ? ''
        : `<span data-element="page" class="mds-slide__page tabular-nums text-[color:var(--mds-slide-muted-fg)]">${slide.index + 1}</span>`;
    case 'group':
    case 'subject': {
      const text = content[element];
      return text
        ? `<span data-element="${element}" class="font-bold text-[color:var(--mds-slide-heading-fg)]">${escapeHtml(text)}</span>`
        : '';
    }
    case 'groupDetail':
    case 'section': {
      const text = content[element];
      return text
        ? `<span data-element="${element}" class="text-[color:var(--mds-slide-muted-fg)]">${escapeHtml(text)}</span>`
        : '';
    }
    default:
      return '';
  }
}

/** Render one slot entry: a single element, or a vertical stack of them. */
function renderItem(
  item: ChromeItem,
  end: boolean,
  render: (element: ChromeElement) => string,
): string {
  if (!Array.isArray(item)) return render(item);
  const stacked = item.map(render).join('');
  if (!stacked) return '';
  return end
    ? `<span class="flex flex-col min-w-0 items-end text-right">${stacked}</span>`
    : `<span class="flex flex-col min-w-0">${stacked}</span>`;
}

function renderSlot(
  items: ChromeItem[] | undefined,
  end: boolean,
  render: (element: ChromeElement) => string,
): string {
  return (items ?? []).map((item) => renderItem(item, end, render)).join('');
}

/**
 * Render a chrome zone for a slide, or `''` when the zone is off or all of its
 * elements are empty. The theme's `theme.json` decides which element sits in
 * which slot; the deck only supplies content.
 *
 * Layout is inline Tailwind utilities (no hand-kept CSS layer): the package
 * build scans this file (@source in slides.src.css) and emits exactly the
 * utilities used here into the always-inlined dist/theme/slides.css. Every
 * class string is written out in full so the scanner sees it.
 * `mds-slide__header`, `mds-slide__footer`, `mds-slide__page` and the
 * `data-element` attributes stay as semantic hooks (no CSS rule).
 */
export function renderZone(zone: ZoneName, slide: Slide, deck: Deck): string {
  if (!zoneEnabled(zone, slide, deck)) return '';
  const theme = loadTheme(deck.config.theme);
  const placement = theme[zone] as ZonePlacement;
  const content = resolveContent(slide, deck);
  const height =
    zone === 'header' ? 'var(--mds-slide-header-height)' : 'var(--mds-slide-footer-height)';
  const render = (element: ChromeElement): string =>
    renderElement(element, content, slide, height, theme.logo);

  const start = renderSlot(placement.start, false, render);
  const end = renderSlot(placement.end, true, render);
  if (!start && !end) return '';

  const inner = `
    <div class="flex items-center gap-[var(--spacing-md)] min-w-0">${start}</div>
    <div class="flex items-center gap-[var(--spacing-md)] min-w-0">${end}</div>`;

  return zone === 'header'
    ? `<header class="mds-slide__header absolute inset-x-0 top-0 flex items-center justify-between h-[var(--mds-slide-header-height)] gap-[var(--mds-slide-gap)] px-[var(--mds-slide-padding)] border-b border-solid border-[color:var(--mds-slide-rule)] leading-[1.2] font-[family-name:var(--mds-slide-font-heading)] text-[length:var(--mds-slide-footer-size)]">${inner}
  </header>`
    : `<footer class="mds-slide__footer absolute inset-x-0 bottom-0 flex items-center justify-between h-[var(--mds-slide-footer-height)] gap-[var(--mds-slide-gap)] px-[var(--mds-slide-padding)] border-t border-solid border-[color:var(--mds-slide-rule)] leading-[1.2] font-[family-name:var(--mds-slide-font-heading)] text-[length:var(--mds-slide-footer-size)]">${inner}
  </footer>`;
}
