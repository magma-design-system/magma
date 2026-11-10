import { createContext } from 'preact';
import { useContext, useEffect, useMemo, useState } from 'preact/hooks';
import { IT } from './i18n-it.js';

/*
  The languages of the studio (#1336): English, the language its texts are written in, and
  Italian.

  The language lives on <html lang>, the one source of the page: mds-pref-language, in the menu of
  the bar, writes it, every Magma component follows it, and so does the studio, at once, with no
  reload (useLang, and `live-language` on the panel says so to mds-pref).

  A text is written in English where it is used, wrapped in `t()`: the English is the key, and
  the Italian catalogue (i18n-it.ts) maps it. A text kept in data, read later (the labels of the
  pages, the steps of the Start page), is marked with `msg()`, which returns it as it is, and
  translated where it is drawn. test/i18n.test.mts reads the sources and fails on a text with no
  Italian, an Italian text no source uses any more, placeholders that differ, and a text of the
  interface written outside `t()`.
*/

export type Lang = 'en' | 'it';

/** The languages the studio has texts for, in the order the menu offers them. */
export const LANGS: readonly Lang[] = ['it', 'en'];

const isLang = (tag: string | null | undefined): tag is Lang => tag === 'it' || tag === 'en';

/** The language of a tag: Italian for `it` and its regions (`it-IT`), English for any other. */
export const langOf = (tag?: string | null): Lang => (/^it(-|$)/i.test(tag ?? '') ? 'it' : 'en');

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

/** The values of the placeholders of a text, `{name}`. */
export type Vars = Record<string, string | number>;

/** Translates a text written in English, then fills its placeholders. */
export type T = (text: string, vars?: Vars) => string;

const fill = (text: string, vars?: Vars): string =>
  vars
    ? text.replace(/\{(\w+)\}/g, (all, name: string) => (name in vars ? String(vars[name]) : all))
    : text;

/** The translator of a language. A text with no Italian stays English (the test keeps none). */
export const translator =
  (lang: Lang): T =>
  (text, vars) =>
    fill(lang === 'it' ? (IT[text] ?? text) : text, vars);

/** Marks a text kept in data, translated where it is drawn: it returns the text as it is. */
export const msg = (text: string): string => text;

/**
 * A text by a count: `one` for 1, `other` for any other count, 0 included, as English and Italian
 * both have it. The count fills `{count}`.
 */
export const plural = (t: T, count: number, one: string, other: string, vars?: Vars): string =>
  t(count === 1 ? one : other, { count, ...vars });

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
