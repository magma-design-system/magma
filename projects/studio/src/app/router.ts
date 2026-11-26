import { signal, type ReadonlySignal } from '@preact/signals';
import { THEME_NAME } from '@maggioli-design-system/design-tokens/semantic.model';
import { MODES, type ModeView } from '../scene-prefs.js';
import { msg } from '../shared/i18n/text.js';
import type { ColorsView } from '../state/draft.js';

/*
  The pages of the studio and their addresses (#1400, out of routes.ts). Every page is a link (the
  app-shell block of Magma, "sections-are-links"), and the address lives in the hash, so the
  studio works from whatever folder serves it: a path of the Pages site, a command inside a
  project.

  Three sections, in the order of the work (#693, decided 2026-11-05):
  - Colors: the views of the tokens playground, each a page of its own;
  - Theme: the theme full screen, with its controls over it;
  - Behavior: the design language, the patterns and the blocks.
  Before them the Start page (start.tsx): what the studio does, the steps of the work and what
  each section changes; the name of the studio at the start of the bar (app-shell, `product`)
  links to it. It is no page of a menu, so it has no row in PAGES: its address is `#/start`.

  The router follows a location: the hash of the window, or one in memory (the tests, a host that
  owns the address of its page, #695). A hash that does not start with `#/` is no address of the
  studio but the anchor of a heading of the page that hosts it (Starlight): it is left alone.
*/

export type { ColorsView } from '../state/draft.js';
export type BehaviorPage = 'design-language' | 'patterns' | 'blocks';

/**
 * The Theme section may name the theme it opens on and the mode it shows it in,
 * `#/theme/editorial/dark`: a link of the Themes page sends the person there to test a theme
 * (vittorio, 2026-11-07), and the address follows the choices made in the section. The modes are
 * the ones the section offers (`MODES`, scene-prefs.tsx).
 */
export type Route =
  | { section: 'start' }
  | { section: 'colors'; view: ColorsView }
  | { section: 'theme'; theme?: string; mode?: ModeView }
  | { section: 'behavior'; page: BehaviorPage };

/** A section of the bar: its pages are the rows of PAGES that name it. */
export type Section = Exclude<Route['section'], 'start'>;

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
  // the pages that check the work against what Magma builds: the contrast gate, the committed
  // palette
  {
    section: 'colors',
    id: 'contrast',
    slug: 'contrast-check',
    label: msg('Contrast check'),
    icon: 'mi/baseline/fact-check',
    apart: true,
  },
  {
    section: 'colors',
    id: 'diff',
    slug: 'diffs',
    label: msg('Diffs'),
    icon: 'mi/baseline/difference',
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
const pagesOf = <S extends Section>(section: S) =>
  PAGES.filter((page): page is Extract<Page, { section: S }> => page.section === section);

export const COLORS_PAGES: MenuItem<ColorsView>[] = pagesOf('colors');
export const BEHAVIOR_PAGES: MenuItem<BehaviorPage>[] = pagesOf('behavior');
/** The Theme section, a page of its own: a link of the bar and of the menu of a narrow window. */
export const THEME_PAGE: MenuItem<'theme'> = pagesOf('theme')[0];

/**
 * The first page of the studio: the Start page, which says what the studio does and where each
 * change is made, before the work starts on the palette. A start with no address opens it.
 */
export const HOME: Route = { section: 'start' };

/** The address of a page, as a link writes it: `#/colors/palette`. */
export function hrefOf(route: Route): string {
  if (route.section === 'start') return '#/start';
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
  if (section === 'start') return slug === undefined ? { section: 'start' } : undefined;
  if (section === 'theme') {
    if (!slug) return rest.length ? undefined : { section: 'theme' };
    // a theme by its name, as a theme is named (THEME_NAME of design-tokens), then a mode: the
    // section says which themes the configuration has, and opens on the first for another name
    const [mode, ...more] = rest;
    if (!THEME_NAME.test(slug) || more.length) return undefined;
    if (mode === undefined) return { section: 'theme', theme: slug };
    const view = MODES.find((one) => one.mode === mode)?.mode;
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

/** Where the address of the studio is kept: the hash of a window, or memory. */
export interface Location {
  /** The hash now, `#/colors/palette`; '' with none. */
  read(): string;
  /** Writes a hash: a new entry of the history, or in place of the one shown (`replace`). */
  write(hash: string, replace: boolean): void;
  /**
   * Calls back when the hash changes from outside the router (back, forward, a link followed, a
   * hash typed); returns what stops it.
   */
  listen(change: () => void): () => void;
}

/** The hash of a window: a link of the page and the history of the browser move it too. */
export function hashLocation(win: Window = window): Location {
  return {
    read: () => win.location.hash,
    write: (hash, replace) => {
      if (replace) win.history.replaceState(win.history.state, '', hash);
      else win.location.hash = hash;
    },
    listen: (change) => {
      win.addEventListener('hashchange', change);
      return () => win.removeEventListener('hashchange', change);
    },
  };
}

/** A location in memory: its history, and a way to move it from outside, as a link would. */
export interface MemoryLocation extends Location {
  /** The hashes of the history, the last one shown. */
  readonly entries: readonly string[];
  /** Follows a hash from outside the router: a link, a hash typed. */
  go(hash: string): void;
}

/** A location of its own, for a test or a host that owns the address of its page (#695). */
export function memoryLocation(initial = ''): MemoryLocation {
  const entries = [initial];
  const listeners = new Set<() => void>();
  return {
    entries,
    read: () => entries[entries.length - 1],
    write: (hash, replace) => {
      if (replace) entries[entries.length - 1] = hash;
      else entries.push(hash);
    },
    listen: (change) => {
      listeners.add(change);
      return () => listeners.delete(change);
    },
    go: (hash) => {
      entries.push(hash);
      listeners.forEach((change) => change());
    },
  };
}

export interface Router {
  /** The page shown. */
  route: ReadonlySignal<Route>;
  /**
   * Opens a page, as following its link does; `replace` writes its address in place of the one
   * shown, for a choice made on the page that is no page to go back to (the theme and the mode of
   * the Theme section).
   */
  navigate(route: Route, options?: { replace?: boolean }): void;
  /** Stops following the location. */
  dispose(): void;
}

/**
 * A router on a location. An address that names a page opens it; an empty one, or one of the
 * studio that names no page, opens `fallback` and writes its address in place; a hash that is no
 * address of the studio (an anchor) is left alone, the page shown kept.
 */
export function createRouter({
  location = hashLocation(),
  fallback = HOME,
}: { location?: Location; fallback?: Route } = {}): Router {
  const route = signal<Route>(routeOf(location.read()) ?? fallback);
  const show = (next: Route) => {
    if (hrefOf(next) !== hrefOf(route.peek())) route.value = next;
  };
  const follow = () => {
    const hash = location.read();
    if (hash !== '' && hash !== '#' && !isAddress(hash)) return;
    const next = routeOf(hash);
    if (next) show(next);
    else {
      location.write(hrefOf(fallback), true);
      show(fallback);
    }
  };
  follow();
  const stop = location.listen(follow);
  return {
    route,
    navigate: (next, { replace = false } = {}) => {
      const hash = hrefOf(next);
      if (hash !== location.read()) location.write(hash, replace);
      show(next);
    },
    dispose: stop,
  };
}
