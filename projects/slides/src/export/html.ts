import type { Deck } from '../model/types.js';
import { renderDeck } from '../render/render-deck.js';
import { renderTokenOverrides, resolveThemeClass } from '../render/theme.js';
import { collectCss } from './collect-css.js';
import { embedImages } from './embed-images.js';

export interface HtmlOptions {
  /** Override the deck theme (defaults to the deck frontmatter `theme`). */
  theme?: string;
  /** Document language attribute. Defaults to `en`. */
  lang?: string;
  /** Document title. Defaults to the deck title. */
  title?: string;
  /**
   * Directory used to resolve and inline local images (logo, `image:` fields,
   * body `![]()`). Usually the deck file's directory. When omitted, local image
   * paths are left as-is (only remote/data URIs render).
   */
  baseDir?: string;
}

/** Minimal on-screen navigation: one slide at a time, scaled to fit, arrow keys. */
const NAV_SCRIPT = `(function(){
  var deck = document.querySelector('.mds-deck');
  if (!deck) return;
  var slides = Array.prototype.slice.call(deck.querySelectorAll('.mds-slide'));
  if (!slides.length) return;
  var i = 0;
  var counter = document.createElement('div');
  counter.className = 'mds-deck__counter';
  document.body.appendChild(counter);
  function show(n){
    i = Math.max(0, Math.min(slides.length - 1, n));
    slides.forEach(function(s, idx){ s.classList.toggle('is-active', idx === i); });
    counter.textContent = (i + 1) + ' / ' + slides.length;
    history.replaceState(null, '', '#' + (i + 1));
  }
  function fit(){
    var scale = Math.min(window.innerWidth / 1280, window.innerHeight / 720);
    deck.style.setProperty('--mds-deck-scale', String(scale));
  }
  window.addEventListener('keydown', function(e){
    if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); show(i + 1); }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); show(i - 1); }
    else if (e.key === 'Home') { show(0); }
    else if (e.key === 'End') { show(slides.length - 1); }
  });
  window.addEventListener('resize', fit);
  var start = parseInt((location.hash || '').slice(1), 10);
  fit();
  show(isNaN(start) ? 0 : start - 1);
})();`;

const escapeHtml = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * Render a deck to a single self-contained HTML document: all CSS (Magma tokens
 * + theme) inlined, per-deck token overrides applied, and a small navigation
 * script. The output has no external dependencies and works offline; it is also
 * what {@link exportPdf} prints.
 */
export function exportHtml(deck: Deck, options: HtmlOptions = {}): string {
  const theme = options.theme ?? deck.config.theme;
  const schemeClass = resolveThemeClass(theme);
  const lang = options.lang ?? 'en';
  const title = options.title ?? deck.config.title ?? 'Slides';
  const css = collectCss(theme);
  const overrides = renderTokenOverrides(deck.config);
  const body = renderDeck(deck);

  const doc = `<!doctype html>
<html lang="${escapeHtml(lang)}" class="${schemeClass}" data-magma-pref="slides">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>${css}</style>${overrides ? `\n<style>${overrides}</style>` : ''}
</head>
<body>
${body}
<script>${NAV_SCRIPT}</script>
</body>
</html>
`;

  return options.baseDir ? embedImages(doc, options.baseDir) : doc;
}
