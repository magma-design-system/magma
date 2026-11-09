import { useEffect, useState } from 'preact/hooks';
import { THEME_NAME } from '@maggioli-design-system/design-tokens/semantic.model';
import { MODES, type ModeView } from './scene-prefs.js';

/*
  The pages of the studio and their addresses. Every page is a link (the app-shell block of
  Magma, "sections-are-links"), and the address lives in the hash, so the studio works from
  whatever folder serves it: a path of the Pages site, a command inside a project.

  Three sections, in the order of the work (#693, decided 2026-11-05):
  - Colors: the views of the tokens playground, each a page of its own;
  - Theme: the theme full screen, with its controls over it;
  - Behavior: the design language, the patterns and the blocks.
  Before them the Start page (start.tsx): what the studio does, the steps of the work and what
  each section changes; the name of the studio at the start of the bar (app-shell, `product`)
  links to it.
*/

/** The views of the Colors section; the ids are the ones a saved draft carries. */
export type ColorsView =
  'colors' | 'scales' | 'surface' | 'themes' | 'groups' | 'contrast' | 'diff';
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

export interface MenuItem<Id extends string> {
  id: Id;
  /** The segment of the address. */
  slug: string;
  label: string;
  icon: string;
  /** Drawn after a separator: a page apart from the ones above it. */
  apart?: boolean;
}

export const COLORS_PAGES: MenuItem<ColorsView>[] = [
  { id: 'colors', slug: 'palette', label: 'Palette', icon: 'mi/baseline/palette' },
  { id: 'scales', slug: 'contrast-scales', label: 'Contrast scales', icon: 'mi/baseline/contrast' },
  {
    id: 'surface',
    slug: 'semantic-surface',
    label: 'Semantic surface',
    icon: 'mi/baseline/account-tree',
  },
  { id: 'themes', slug: 'themes', label: 'Themes', icon: 'mi/baseline/theater-comedy' },
  { id: 'groups', slug: 'groups', label: 'Groups', icon: 'mi/baseline/workspaces' },
  // the pages that check the work against what Magma builds: the contrast gate, the committed
  // palette
  {
    id: 'contrast',
    slug: 'contrast-check',
    label: 'Contrast check',
    icon: 'mi/baseline/fact-check',
    apart: true,
  },
  { id: 'diff', slug: 'diffs', label: 'Diffs', icon: 'mi/baseline/difference' },
];

export const BEHAVIOR_PAGES: MenuItem<BehaviorPage>[] = [
  {
    id: 'design-language',
    slug: 'design-language',
    label: 'Design language',
    icon: 'mi/baseline/style',
  },
  { id: 'patterns', slug: 'patterns', label: 'Patterns', icon: 'mi/baseline/pattern' },
  { id: 'blocks', slug: 'blocks', label: 'Blocks', icon: 'mi/baseline/widgets' },
];

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

/** The page of an address, or undefined when it names none. */
export function routeOf(hash: string): Route | undefined {
  const [section, slug, ...rest] = hash.replace(/^#\/?/, '').split('/');
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

/** Opens a page, as following its link does. */
export function navigate(route: Route): void {
  location.hash = hrefOf(route);
}

/**
 * The page the address names, following it as it changes; an address that names no page is
 * replaced with the one of `fallback`.
 */
export function useRoute(fallback: Route): Route {
  const [route, setRoute] = useState<Route>(() => routeOf(location.hash) ?? fallback);
  useEffect(() => {
    const follow = () => {
      const next = routeOf(location.hash);
      if (next) setRoute(next);
      else history.replaceState(null, '', hrefOf(fallback));
    };
    follow();
    addEventListener('hashchange', follow);
    return () => removeEventListener('hashchange', follow);
  }, []);
  return route;
}
