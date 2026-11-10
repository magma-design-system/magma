import { langOf, type Lang } from './i18n.js';
import { IT_PREVIEWS } from './i18n-it-previews.js';

/*
  The previews in the language of the studio (#1336). The banner of the Start page (hero.html), the
  scene and the groups of the Theme section (scene.html, groups.html) are sample pages of a product
  written in English. The studio already writes their theme on their <html> (frame.ts); it writes
  the language there too, which the Magma components of the page follow, and puts the Italian of
  their texts in place of the English (i18n-it-previews.ts), keyed by the English as the catalogue
  of the studio is. Each text keeps its English, so back to English puts it back.

  What is translated: the text of the page and the attributes people read or hear (WORDED); the
  value of a field, which shows as its text. A value of the components (a variant, a tone, the name
  of a role: one lowercase word) and a proper name stay as they are (test/i18n-previews.test.mts).
*/

/** The attributes people read or hear: `label` too, which mds-button copies its text into. */
const WORDED = [
  'label',
  'headline',
  'description',
  'placeholder',
  'aria-label',
  'title',
  'alt',
  'message',
];
/** The fields whose `value` shows as their text. */
const VALUED = new Set(['mds-input', 'mds-textarea']);

/** A text as the catalogue keys it: its words, the spaces between them collapsed. */
export const keyOf = (text: string): string => text.replace(/\s+/g, ' ').trim();

/** The English of a text already in Italian: a component may have copied it before a switch back. */
const ENGLISH_OF = new Map(Object.entries(IT_PREVIEWS).map(([en, it]) => [it, en]));

/** What each text node and attribute said in English. */
const originals = new WeakMap<Node, string>();
const attributes = new WeakMap<Element, Map<string, string>>();

/**
 * A text with other words, the spaces around it kept: the words of a page break over lines, so
 * the whole text is replaced, never the words alone.
 */
const withWords = (text: string, words: string): string =>
  /^\s*/.exec(text)![0] + words + /\s*$/.exec(text)![0];

const englishOf = (current: string): string => {
  const english = ENGLISH_OF.get(keyOf(current));
  return english === undefined ? current : withWords(current, english);
};

/** The text in a language: Italian from the catalogue, else the English as it is. */
const inLanguage = (english: string, lang: Lang): string => {
  if (lang !== 'it') return english;
  const italian = IT_PREVIEWS[keyOf(english)];
  return italian === undefined ? english : withWords(english, italian);
};

/** The text nodes of a page that people read: not those of a script, a style or a template. */
function textNodes(page: Document): Text[] {
  const found: Text[] = [];
  if (!page.body) return found;
  const walker = page.createTreeWalker(page.body, 4 /* NodeFilter.SHOW_TEXT */);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const parent = node.parentElement?.localName;
    if (parent === 'script' || parent === 'style' || parent === 'template') continue;
    if (/[A-Za-z]/.test((node as Text).data)) found.push(node as Text);
  }
  return found;
}

/** The attributes of a page that people read, as [element, name] pairs. */
function wordedAttributes(page: Document): Array<[Element, string]> {
  const found: Array<[Element, string]> = [];
  page.body?.querySelectorAll('*').forEach((element) => {
    const names = VALUED.has(element.localName) ? [...WORDED, 'value'] : WORDED;
    for (const name of names) if (element.hasAttribute(name)) found.push([element, name]);
  });
  return found;
}

/** Every text of a page the previews translate, in English: what the catalogue must hold. */
export function previewTexts(page: Document): string[] {
  return [
    ...textNodes(page).map((node) => keyOf(node.data)),
    ...wordedAttributes(page).map(([element, name]) => keyOf(element.getAttribute(name)!)),
  ].filter((text) => /[A-Za-z]/.test(text));
}

/** Writes a language on a page: its `lang`, and each text in that language. */
export function translatePage(page: Document, lang: Lang): void {
  page.documentElement.lang = lang;
  for (const node of textNodes(page)) {
    if (!originals.has(node)) originals.set(node, englishOf(node.data));
    const text = inLanguage(originals.get(node)!, lang);
    if (node.data !== text) node.data = text;
  }
  for (const [element, name] of wordedAttributes(page)) {
    let own = attributes.get(element);
    if (!own) attributes.set(element, (own = new Map()));
    if (!own.has(name)) own.set(name, englishOf(element.getAttribute(name)!));
    const text = inLanguage(own.get(name)!, lang);
    if (element.getAttribute(name) !== text) element.setAttribute(name, text);
  }
}

const following = new WeakSet<Document>();

/**
 * Writes the language of the studio on a page of its own and follows it: a change of <html lang>
 * of the studio, from the menu of the bar, reaches the page at once. The page is followed until its
 * frame loads another one.
 */
export function followLanguage(page: Document, studio: Document = document): void {
  const html = studio.documentElement;
  translatePage(page, langOf(html.lang));
  if (following.has(page)) return;
  following.add(page);
  // the window of the frame shows another document once the frame loads another page
  const frame = page.defaultView;
  const observer = new MutationObserver(() => {
    if (frame && frame.document !== page) {
      observer.disconnect();
      return;
    }
    translatePage(page, langOf(html.lang));
  });
  observer.observe(html, { attributes: true, attributeFilter: ['lang'] });
}
