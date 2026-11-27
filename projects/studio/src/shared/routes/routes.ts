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

  Three sections, in the order of the work (#693, decided 2026-11-05):
  - Colors: the views of the tokens playground, each a page of its own;
  - Theme: the theme full screen, with its controls over it;
  - Behavior: the design language, the patterns and the blocks.
  Before them the introduction (features/introduction/, the Start page until #1402): what the
  studio is for and the stages in order; the name of the studio at the start of the bar
  (app-shell, `product`) links to it, and so does a start with no address. Then the opening
  (features/opening/): the preset to work on. Neither is a page of a menu, so neither has a row in
  PAGES: their addresses are `#/introduction` and `#/opening`. `#/start`, the address of the Start
  page, opens the introduction too (GLOSSARY.md, decision 13), and the router writes its address
  in its place.

  The stages of the balancing (#1402, STAGES below) run through those pages in the order of the
  work: until #1403 and #1404 build their views, each stage opens the page of today that does its
  work, at the address it has today, so no link written before breaks.

  A hash that does not start with `#/` is no address of the studio but the anchor of a heading of
  the page that hosts it (Starlight): it names no page.
*/

/**
 * The pages of the Colors section, by the id a saved draft carries (`view`, state/draft.ts): the
 * table gives each its address and its name. 'colors' is the Palette and 'surface' Semantic
 * surface: ids kept from before the views were split, so the drafts saved then keep working.
 */
export const COLORS_VIEWS = [
  'colors',
  'scales',
  'surface',
  'themes',
  'groups',
  'contrast',
] as const;
export type ColorsView = (typeof COLORS_VIEWS)[number];

/** The page of Colors a draft names, if it is one. */
export const colorsViewOf = (view: unknown): ColorsView | undefined =>
  COLORS_VIEWS.find((one) => one === view);

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
  | { section: 'colors'; view: ColorsView }
  | { section: 'theme'; theme?: string; mode?: ModeView }
  | { section: 'behavior'; page: BehaviorPage }
  /** The stage of the exceptions, a page of its own until #1404 builds it (#1402). */
  | { section: 'exceptions' };

/** A section of the bar: its pages are the rows of PAGES that name it. */
export type Section = Exclude<Route['section'], 'introduction' | 'opening' | 'exceptions'>;

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
  | (MenuItem<ColorsView> & { section: 'colors' })
  | (MenuItem<'theme'> & { section: 'theme' })
  | (MenuItem<BehaviorPage> & { section: 'behavior' });

/** The pages of the studio, one table for the menus and the addresses, in the order of the bar. */
export const PAGES: readonly Page[] = [
  {
    section: 'colors',
    id: 'colors',
    slug: 'palette',
    label: msg('Palette'),
    icon: 'mi/baseline/palette',
  },
  {
    section: 'colors',
    id: 'scales',
    slug: 'contrast-scales',
    label: msg('Contrast scales'),
    icon: 'mi/baseline/contrast',
  },
  {
    section: 'colors',
    id: 'surface',
    slug: 'semantic-surface',
    label: msg('Semantic surface'),
    icon: 'mi/baseline/account-tree',
  },
  {
    section: 'colors',
    id: 'themes',
    slug: 'themes',
    label: msg('Themes'),
    icon: 'mi/baseline/theater-comedy',
  },
  {
    section: 'colors',
    id: 'groups',
    slug: 'groups',
    label: msg('Groups'),
    icon: 'mi/baseline/workspaces',
  },
  // the page that checks the work against what Magma builds: the contrast gate (Diffs, the
  // palette against Magma's, went in #1402: the changes are the bar's)
  {
    section: 'colors',
    id: 'contrast',
    slug: 'contrast-check',
    label: msg('Contrast check'),
    icon: 'mi/baseline/fact-check',
    apart: true,
  },
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

export const COLORS_PAGES: MenuItem<ColorsView>[] = pagesOf('colors');
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

/** The address of a page, as a link writes it: `#/colors/palette`. */
export function hrefOf(route: Route): string {
  if (route.section === 'introduction') return '#/introduction';
  if (route.section === 'opening') return '#/opening';
  if (route.section === 'exceptions') return '#/exceptions';
  if (route.section === 'theme') {
    if (!route.theme) return '#/theme';
    return route.mode ? `#/theme/${route.theme}/${route.mode}` : `#/theme/${route.theme}`;
  }
  if (route.section === 'colors')
    return `#/colors/${COLORS_PAGES.find((page) => page.id === route.view)!.slug}`;
  return `#/behavior/${BEHAVIOR_PAGES.find((page) => page.id === route.page)!.slug}`;
}

/** Whether a hash is an address of the studio: `#/` and a path. Any other is left alone. */
export const isAddress = (hash: string): boolean => hash.startsWith('#/');

/** The page of an address, or undefined when it names none. */
export function routeOf(hash: string): Route | undefined {
  if (!isAddress(hash)) return undefined;
  const [section, slug, ...rest] = hash.slice(2).split('/');
  if (hash === START_ALIAS) return { section: 'introduction' };
  if (section === 'introduction' || section === 'opening')
    return slug === undefined ? { section } : undefined;
  if (section === 'exceptions') return slug === undefined ? { section: 'exceptions' } : undefined;
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
  if (section === 'colors') {
    const page = COLORS_PAGES.find((one) => one.slug === slug);
    return page && { section: 'colors', view: page.id };
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
 * (magma/patterns/stages-in-order.md): under the bar, the current one marked, each with the way
 * back and the way forward. Until #1403 and #1404 build their views, a stage opens the page of
 * today that does its work, and the pages beside it are those of today that it holds.
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
  /** The pages beside it, reached from it: the stage stays the current one there. */
  beside: Route[];
}

export const STAGES: readonly Stage[] = [
  {
    id: 'colours',
    label: msg('Colors'),
    icon: 'mi/baseline/palette',
    numbered: true,
    route: { section: 'colors', view: 'colors' },
    // Scale and Group in the object model, today Contrast scales and Groups
    beside: [
      { section: 'colors', view: 'scales' },
      { section: 'colors', view: 'groups' },
    ],
  },
  {
    id: 'weights',
    label: msg('Weights'),
    icon: 'mi/baseline/account-tree',
    numbered: true,
    route: { section: 'colors', view: 'surface' },
    beside: [],
  },
  {
    id: 'themes',
    label: msg('Themes'),
    icon: 'mi/baseline/theater-comedy',
    numbered: true,
    route: { section: 'colors', view: 'themes' },
    beside: [],
  },
  {
    id: 'exceptions',
    label: msg('Exceptions'),
    icon: 'mi/baseline/tune',
    numbered: true,
    route: { section: 'exceptions' },
    beside: [],
  },
  {
    id: 'full-review',
    label: msg('Full review'),
    icon: 'mi/baseline/fact-check',
    numbered: false,
    route: { section: 'colors', view: 'contrast' },
    beside: [],
  },
];

/** The view before the first stage, where its way back leads: the opening. */
export const BEFORE_STAGES: { route: Route; label: string } = {
  route: { section: 'opening' },
  label: msg('Opening'),
};

/** Where a page stands in the flow: a stage, a page beside one, or neither (undefined). */
export interface Place {
  stage: Stage;
  /** The position of the stage in STAGES, from 0. */
  index: number;
  place: 'stage' | 'side-page';
}

/** Where a page stands in the flow, or undefined for a page that is no stage nor beside one. */
export function placeOf(route: Route): Place | undefined {
  const href = hrefOf(route);
  for (const [index, stage] of STAGES.entries()) {
    if (hrefOf(stage.route) === href) return { stage, index, place: 'stage' };
    if (stage.beside.some((page) => hrefOf(page) === href))
      return { stage, index, place: 'side-page' };
  }
  return undefined;
}

/** A view the way back or the way forward of a stage opens: its page, and its name. */
export interface StageLink {
  route: Route;
  /** The name of the view, in English (msg), translated where it is drawn. */
  label: string;
  /** The number of the stage it opens, for a stage of the four. */
  number?: number;
}

const linkTo = (index: number): StageLink => {
  const stage = STAGES[index];
  return {
    route: stage.route,
    label: stage.label,
    number: stage.numbered ? index + 1 : undefined,
  };
};

/**
 * The views before and after a stage: the stage before it, or the view before the stages; the
 * stage after it, or none after the last, whose way forward is the exit.
 */
export function aroundStage(index: number): { before: StageLink; after?: StageLink } {
  return {
    before: index > 0 ? linkTo(index - 1) : { ...BEFORE_STAGES },
    after: index < STAGES.length - 1 ? linkTo(index + 1) : undefined,
  };
}
