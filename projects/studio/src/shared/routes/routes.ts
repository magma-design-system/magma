import { THEME_NAME } from '@maggioli-design-system/design-tokens/semantic.model';
import { msg } from '../i18n/text.js';

/*
  The pages of the studio and their addresses (#1400, out of routes.ts; #1401, out of
  app/router.ts): one table that the menus of the bar (app/) and the links of the pages
  (features/) read, so it sits under both, in shared/ (vittorio, 2026-11-26: a page never imports
  app/, so the table comes lower instead of an exception for the router). What follows an address,
  the router and its locations, stays in app/router.ts. Every page is a link (the app-shell block
  of Magma, "sections-are-links"), and the address lives in the hash, so the studio works from
  whatever folder serves it: a path of the Pages site, a command inside a project.

  Outside the stages, the bar holds two sections (#693, decided 2026-11-05; the Colors section went
  with #1403 and #1404, its pages became the stages):
  - Theme: the theme full screen, with its controls over it;
  - Behavior: the design language, the patterns and the blocks.
  Before them the introduction (features/introduction/, the Start page until #1402): what the
  studio is for and the stages in order; the name of the studio at the start of the bar
  (app-shell, `product`) links to it, and so does a start with no address. Then the opening
  (features/opening/): the preset to work on. Neither is a page of a menu, so neither has a row in
  PAGES: their addresses are `#/introduction` and `#/opening`. `#/start`, the address of the Start
  page, opens the introduction too (GLOSSARY.md, decision 13), and the router writes its address
  in its place.

  The stages of the balancing (#1402, STAGES below) are views of their own since #1403 and #1404;
  the addresses of the pages they replaced open them (ALIASES), so no link written before breaks.

  A hash that does not start with `#/` is no address of the studio but the anchor of a heading of
  the page that hosts it (Starlight): it names no page.
*/

/**
 * The ids of the pages of the Colors section a draft saved before #1404 may carry (`view`,
 * state/draft.ts), with the address of the view that took the place of each: the Palette
 * ('colors'), Contrast scales ('scales'), Groups ('groups') and Semantic surface ('surface') went
 * with #1403, Themes ('themes') and Contrast check ('contrast') with #1404.
 */
const OLD_VIEWS: Readonly<Record<string, string>> = {
  colors: '#/colours',
  scales: '#/colors/contrast-scales',
  // Groups stood beside Colours; the view that replaced it is outside the stages
  groups: '#/colours',
  surface: '#/weights',
  themes: '#/themes',
  contrast: '#/full-review',
};

export type BehaviorPage = 'design-language' | 'patterns' | 'blocks';

/**
 * The modes the Theme section shows a theme in: those of mds-pref-mode without `system`, since
 * the studio sets the mode of the frame, then both side by side. Their words and icons are the
 * menu's (`MODES`, scene-prefs.tsx).
 */
export const MODE_VIEWS = ['light', 'dark', 'both'] as const;
export type ModeView = (typeof MODE_VIEWS)[number];

/**
 * The Theme section may name the theme it opens on and the mode it shows it in,
 * `#/theme/editorial/dark`: a link of the Themes page sends the person there to test a theme
 * (vittorio, 2026-11-07), and the address follows the choices made in the section.
 */
export type Route =
  | { section: 'introduction' }
  /** The opening: the preset to work on (#1402). */
  | { section: 'opening' }
  /** The stage Colours, the family at its centre (#1403, features/colours/). */
  | { section: 'colours' }
  /**
   * The page of a contrast scale beside Colours (#1403, features/scale/): the scale of a formula,
   * reached from a family, or from a group, which the way back names.
   */
  | { section: 'scale'; formula: Formula; name: string; group?: string }
  /**
   * The view Groups (#1403, features/groups/): what the families inherit, the settings of the
   * preset and of each group, and the export groups; outside the stages, as the Theme section.
   */
  | { section: 'groups' }
  /** The stage Weights (#1403, features/weights/): the weights of the preset, one mode at a time. */
  | { section: 'weights' }
  /**
   * The stage Themes (#1404, features/themes/): the theme at its centre, by its name, else the
   * base theme.
   */
  | { section: 'themes'; theme?: string }
  /**
   * The full review (#1404, features/full-review/): every theme in every mode, before the exit;
   * the item at its centre by the name of its theme and its mode, else the first to look at.
   */
  | { section: 'full-review'; theme?: string; mode?: 'light' | 'dark' }
  | { section: 'theme'; theme?: string; mode?: ModeView }
  | { section: 'behavior'; page: BehaviorPage }
  /** The stage of the exceptions: a page that says when it comes (after Magma 3, #1404). */
  | { section: 'exceptions' };

/** A section of the bar: its pages are the rows of PAGES that name it. */
export type Section = Exclude<
  Route['section'],
  | 'introduction'
  | 'opening'
  | 'colours'
  | 'scale'
  | 'groups'
  | 'weights'
  | 'themes'
  | 'exceptions'
  | 'full-review'
>;

export interface MenuItem<Id extends string> {
  id: Id;
  /** The segment of the address after the section; none for a section of one page (Theme). */
  slug: string;
  /** The name of the page in English, translated where it is drawn (i18n.ts). */
  label: string;
  icon: string;
  /** Drawn after a separator: a page apart from the ones above it. */
  apart?: boolean;
}

/** A page of the studio: the section it is in, the rest as a menu draws it. */
export type Page =
  (MenuItem<'theme'> & { section: 'theme' }) | (MenuItem<BehaviorPage> & { section: 'behavior' });

/** The pages of the studio, one table for the menus and the addresses, in the order of the bar. */
export const PAGES: readonly Page[] = [
  { section: 'theme', id: 'theme', slug: '', label: msg('Theme'), icon: 'mi/baseline/format-size' },
  {
    section: 'behavior',
    id: 'design-language',
    slug: 'design-language',
    label: msg('Design language'),
    icon: 'mi/baseline/style',
  },
  {
    section: 'behavior',
    id: 'patterns',
    slug: 'patterns',
    label: msg('Patterns'),
    icon: 'mi/baseline/pattern',
  },
  {
    section: 'behavior',
    id: 'blocks',
    slug: 'blocks',
    label: msg('Blocks'),
    icon: 'mi/baseline/widgets',
  },
];

/** The pages of a section, as its menu lists them. */
function pagesOf<S extends Section>(section: S) {
  return PAGES.filter((page): page is Extract<Page, { section: S }> => page.section === section);
}

export const BEHAVIOR_PAGES: MenuItem<BehaviorPage>[] = pagesOf('behavior');
/** The Theme section, a page of its own: a link of the bar and of the menu of a narrow window. */
export const THEME_PAGE: MenuItem<'theme'> = pagesOf('theme')[0];

/**
 * The first page of the studio: the introduction, which says what the studio is for and the
 * stages in order, before the opening. A start with no address opens it.
 */
export const HOME: Route = { section: 'introduction' };

/** The address of the Start page the introduction was, kept so a link written before opens it. */
export const START_ALIAS = '#/start';

/**
 * The addresses of the pages that went, each opening the view that took its place, whose address
 * the router writes over it (app/router.ts): a link written before, from the docs site or a note,
 * keeps working (#1403).
 */
export const ALIASES: Readonly<Record<string, Route>> = {
  [START_ALIAS]: { section: 'introduction' },
  '#/colors/palette': { section: 'colours' },
  '#/colors/contrast-scales': { section: 'scale', formula: 'wcag3', name: 'default' },
  '#/colors/groups': { section: 'groups' },
  '#/colors/semantic-surface': { section: 'weights' },
  '#/colors/themes': { section: 'themes' },
  '#/colors/contrast-check': { section: 'full-review' },
};

/** The formulas a contrast scale is written for, as the configuration names them. */
export const FORMULAS = ['wcag3', 'wcag2'] as const;
export type Formula = (typeof FORMULAS)[number];

/** The address of a page, as a link writes it: `#/colors/palette`. */
export function hrefOf(route: Route): string {
  if (route.section === 'introduction') return '#/introduction';
  if (route.section === 'opening') return '#/opening';
  if (route.section === 'colours') return '#/colours';
  if (route.section === 'groups') return '#/groups';
  if (route.section === 'weights') return '#/weights';
  if (route.section === 'scale')
    return `#/colours/scale/${route.formula}/${route.name}${route.group ? `/from/${route.group}` : ''}`;
  if (route.section === 'exceptions') return '#/exceptions';
  if (route.section === 'full-review')
    return route.theme && route.mode
      ? `#/full-review/${route.theme}/${route.mode}`
      : '#/full-review';
  if (route.section === 'themes') return route.theme ? `#/themes/${route.theme}` : '#/themes';
  if (route.section === 'theme') {
    if (!route.theme) return '#/theme';
    return route.mode ? `#/theme/${route.theme}/${route.mode}` : `#/theme/${route.theme}`;
  }
  return `#/behavior/${BEHAVIOR_PAGES.find((page) => page.id === route.page)!.slug}`;
}

/** Whether a hash is an address of the studio: `#/` and a path. Any other is left alone. */
export const isAddress = (hash: string): boolean => hash.startsWith('#/');

/** The page of an address, or undefined when it names none. */
export function routeOf(hash: string): Route | undefined {
  if (!isAddress(hash)) return undefined;
  const [section, slug, ...rest] = hash.slice(2).split('/');
  if (ALIASES[hash]) return ALIASES[hash];
  if (section === 'colours' && slug === 'scale') {
    // a scale by its formula and its name, then the group it was reached from
    const [formula, name, from, group, ...more] = rest;
    const known = FORMULAS.find((one) => one === formula);
    if (!known || !name || more.length) return undefined;
    if (from === undefined) return { section: 'scale', formula: known, name };
    return from === 'from' && group ? { section: 'scale', formula: known, name, group } : undefined;
  }
  if (
    section === 'introduction' ||
    section === 'opening' ||
    section === 'colours' ||
    section === 'groups' ||
    section === 'weights'
  )
    return slug === undefined ? { section } : undefined;
  if (section === 'exceptions') return slug === undefined ? { section } : undefined;
  if (section === 'full-review') {
    if (slug === undefined) return { section };
    // a theme by its name and a mode, the item of the review the toast of a broken theme opens
    const [mode, ...more] = rest;
    return THEME_NAME.test(slug) && (mode === 'light' || mode === 'dark') && !more.length
      ? { section, theme: slug, mode }
      : undefined;
  }
  if (section === 'themes') {
    // a theme by its name, as a theme is named (THEME_NAME of design-tokens): the stage opens on
    // the base theme for a name the preset has no theme of
    if (slug === undefined) return { section: 'themes' };
    return THEME_NAME.test(slug) && !rest.length ? { section: 'themes', theme: slug } : undefined;
  }
  if (section === 'theme') {
    if (!slug) return rest.length ? undefined : { section: 'theme' };
    // a theme by its name, as a theme is named (THEME_NAME of design-tokens), then a mode: the
    // section says which themes the configuration has, and opens on the first for another name
    const [mode, ...more] = rest;
    if (!THEME_NAME.test(slug) || more.length) return undefined;
    if (mode === undefined) return { section: 'theme', theme: slug };
    const view = MODE_VIEWS.find((one) => one === mode);
    return view && { section: 'theme', theme: slug, mode: view };
  }
  if (section === 'behavior') {
    const page = BEHAVIOR_PAGES.find((one) => one.slug === slug);
    return page && { section: 'behavior', page: page.id };
  }
  return undefined;
}

/**
 * The stages of the balancing, in their order (studio.object-model.md, section 5): the four
 * stages, numbered, then the full review. The pattern of the studio says how they show
 * (magma/patterns/stages-in-order.md): a strip of links under the bar, the current one selected
 * (#1595). The page of a contrast scale stands beside Colours (placeOf).
 */
export type StageId = 'colours' | 'weights' | 'themes' | 'exceptions' | 'full-review';

export interface Stage {
  id: StageId;
  /** The name of the stage, in English (msg), translated where it is drawn. */
  label: string;
  icon: string;
  /** A stage of the four, with its number; the full review comes after them, with none. */
  numbered: boolean;
  /** The page the stage opens. */
  route: Route;
}

export const STAGES: readonly Stage[] = [
  {
    id: 'colours',
    label: msg('Colors'),
    icon: 'mi/baseline/palette',
    numbered: true,
    // Scale stands beside it, at the address of any scale (placeOf); Groups went out of the
    // stages (#1403)
    route: { section: 'colours' },
  },
  {
    id: 'weights',
    label: msg('Weights'),
    icon: 'mi/baseline/account-tree',
    numbered: true,
    route: { section: 'weights' },
  },
  {
    id: 'themes',
    label: msg('Themes'),
    icon: 'mi/baseline/theater-comedy',
    numbered: true,
    route: { section: 'themes' },
  },
  {
    id: 'exceptions',
    label: msg('Exceptions'),
    icon: 'mi/baseline/tune',
    numbered: true,
    route: { section: 'exceptions' },
  },
  {
    id: 'full-review',
    label: msg('Full review'),
    icon: 'mi/baseline/fact-check',
    numbered: false,
    route: { section: 'full-review' },
  },
];

/** A stage by its id. */
export const stageOf = (id: StageId): Stage => STAGES.find((stage) => stage.id === id)!;

/**
 * The pages Colours leads to (#1403): the page of a contrast scale (Scale in the object model,
 * today Contrast scales), the page of the groups and of the settings of the preset (Groups), the
 * stage of the themes. Named here, so their addresses change in one place.
 */
export const scaleRoute = (formula: Formula, name: string, group?: string): Route => ({
  section: 'scale',
  formula,
  name,
  ...(group ? { group } : {}),
});
export const GROUPS_PAGE: Route = { section: 'groups' };
/** The full review on a theme in a mode (#1404): the toast of a broken theme opens it there. */
export const reviewRoute = (theme?: string, mode?: 'light' | 'dark'): Route => ({
  section: 'full-review',
  ...(theme && mode ? { theme, mode } : {}),
});
/** The stage Themes on a theme, by its name (#1404): Colours names the themes that use a family. */
export const themeRoute = (theme?: string): Route => ({
  section: 'themes',
  ...(theme ? { theme } : {}),
});

/**
 * The address of the page of the work a draft names: the address it keeps since #1403, or the id
 * of a page of the Colors section a draft saved before carries (OLD_VIEWS: its address, which the
 * router takes to the view that replaced it). Undefined for anything else.
 */
export function workPlaceOf(view: unknown): string | undefined {
  if (typeof view !== 'string') return undefined;
  if (OLD_VIEWS[view]) return OLD_VIEWS[view];
  return routeOf(view) ? view : undefined;
}

/** Where a page stands in the flow: a stage, a page beside one, or neither (undefined). */
export interface Place {
  stage: Stage;
  /** The position of the stage in STAGES, from 0. */
  index: number;
  place: 'stage' | 'side-page';
}

/** Where a page stands in the flow, or undefined for a page that is no stage nor beside one. */
export function placeOf(route: Route): Place | undefined {
  // the page of any scale stands beside Colours (#1403)
  if (route.section === 'scale') return { stage: STAGES[0], index: 0, place: 'side-page' };
  // a stage at any of its addresses: Themes on any theme (#1404)
  const index = STAGES.findIndex((stage) => stage.route.section === route.section);
  return index < 0 ? undefined : { stage: STAGES[index], index, place: 'stage' };
}
