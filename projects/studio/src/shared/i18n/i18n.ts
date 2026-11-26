import { createContext, type ComponentChild } from 'preact';
import { useContext, useEffect, useMemo, useState } from 'preact/hooks';
import { langOf, translator, type Lang, type T } from './text.js';

export { LANGS, langOf, msg, plural, translator, type Lang, type T, type Vars } from './text.js';

/*
  The languages of the studio (#1336): English, the language its texts are written in, and
  Italian.

  The language lives on <html lang>, the one source of the page: mds-pref-language, in the menu of
  the bar, writes it, every Magma component follows it, and so does the studio, at once, with no
  reload (useLang, and `live-language` on the panel says so to mds-pref).

  The texts and their translator, with no Preact, are text.ts: the engine reads them too.
*/

const isLang = (tag: string | null | undefined): tag is Lang => tag === 'it' || tag === 'en';

/** Where mds-pref-language keeps the choice of the person (its `localStorageAlias`). */
export const LANGUAGE_KEY = 'mdsPrefLanguage';

/**
 * Writes the language the studio starts in on <html lang>, before mds-pref-language reads it: the
 * one the person chose, else Italian on a browser in Italian, else English. mds-pref-language
 * looks at <html lang> before the browser, and the page ships `lang="en"` (a page needs one, WCAG
 * 3.1.1), so without this the browser would never be asked. A stored language the studio has no
 * texts for is dropped: another page of Magma on the same origin (the Storybook, on Pages) may
 * have stored `es`, which would leave the components in Spanish and the studio in English.
 */
export function startLanguage(
  page: Document = document,
  storage: Storage = localStorage,
  browser: string = navigator.language,
): Lang {
  const stored = storage.getItem(LANGUAGE_KEY);
  if (stored !== null && !isLang(stored)) storage.removeItem(LANGUAGE_KEY);
  const lang = isLang(stored) ? stored : langOf(browser);
  page.documentElement.lang = lang;
  return lang;
}

/** The language on <html lang>, followed as mds-pref-language changes it. */
export function useLang(page: Document = document): Lang {
  const html = page.documentElement;
  const [lang, setLang] = useState<Lang>(() => langOf(html.lang));
  useEffect(() => {
    const follow = () => setLang(langOf(html.lang));
    const observer = new MutationObserver(follow);
    observer.observe(html, { attributes: true, attributeFilter: ['lang'] });
    follow();
    return () => observer.disconnect();
  }, [html]);
  return lang;
}

/**
 * A text whose placeholders are elements (a link inside a sentence): translated whole, so the
 * language orders its words, then cut at the placeholders, each given its element.
 */
export const rich = (t: T, text: string, parts: Record<string, ComponentChild>): ComponentChild[] =>
  t(text)
    .split(/(\{\w+\})/)
    .filter((piece) => piece !== '')
    .map((piece) => {
      const name = /^\{(\w+)\}$/.exec(piece)?.[1];
      return name !== undefined && name in parts ? parts[name] : piece;
    });

const LangContext = createContext<Lang>('en');

/** Hands the language down to the pages: the shell holds it (useLang). */
export const LangProvider = LangContext.Provider;

/** The language the pages are drawn in; English outside a LangProvider (a page tested alone). */
export const useLangOf = (): Lang => useContext(LangContext);

/** The translator of the language the pages are drawn in. */
export function useT(): T {
  const lang = useLangOf();
  return useMemo(() => translator(lang), [lang]);
}
