import { IT } from './i18n-it.js';

/*
  The texts of the studio and their translator, with no Preact (out of i18n.ts, #1399): the
  engine marks and translates its texts with them, the pages through i18n.ts.

  A text is written in English where it is used, wrapped in `t()`: the English is the key, and
  the Italian catalogue (i18n-it.ts) maps it. A page of features/ keeps the Italian of its own
  texts beside it (its i18n-it.ts) and hands it to the translator, which looks there first: the
  catalogue of shared/ never imports a page (#1401). A text kept in data, read later (the labels of the
  pages, the steps of the Start page), is marked with `msg()`, which returns it as it is, and
  translated where it is drawn. test/i18n.test.mts reads the sources and fails on a text with no
  Italian, an Italian text no source uses any more, placeholders that differ, and a text of the
  interface written outside `t()`.
*/

export type Lang = 'en' | 'it';

/** The languages the studio has texts for, in the order the menu offers them. */
export const LANGS: readonly Lang[] = ['it', 'en'];

/** The language of a tag: Italian for `it` and its regions (`it-IT`), English for any other. */
export const langOf = (tag?: string | null): Lang => (/^it(-|$)/i.test(tag ?? '') ? 'it' : 'en');

/** The values of the placeholders of a text, `{name}`. */
export type Vars = Record<string, string | number>;

/** Translates a text written in English, then fills its placeholders. */
export type T = (text: string, vars?: Vars) => string;

/** The Italian of some texts, by the English it translates. */
export type Catalogue = Readonly<Record<string, string>>;

const fill = (text: string, vars?: Vars): string =>
  vars
    ? text.replace(/\{(\w+)\}/g, (all, name: string) => (name in vars ? String(vars[name]) : all))
    : text;

/**
 * The translator of a language: the Italian of `own` first (the catalogue of a page), then the
 * one of the studio. A text with no Italian stays English (the test keeps none).
 */
export const translator =
  (lang: Lang, own: Catalogue = {}): T =>
  (text, vars) =>
    fill(lang === 'it' ? (own[text] ?? IT[text] ?? text) : text, vars);

/** Marks a text kept in data, translated where it is drawn: it returns the text as it is. */
export const msg = (text: string): string => text;

/**
 * A text by a count: `one` for 1, `other` for any other count, 0 included, as English and Italian
 * both have it. The count fills `{count}`.
 */
export const plural = (t: T, count: number, one: string, other: string, vars?: Vars): string =>
  t(count === 1 ? one : other, { count, ...vars });
