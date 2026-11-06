import { useEffect, useState } from 'preact/hooks';

/*
  The pages of the studio and their addresses. Every page is a link (the app-shell block of
  Magma, "sections-are-links"), and the address lives in the hash, so the studio works from
  whatever folder serves it: a path of the Pages site, a command inside a project.

  Three sections, in the order of the work (#693, decided 2026-11-05):
  - Colors: the views of the tokens playground, each a page of its own;
  - Theme: the theme full screen, with its controls over it;
  - Behavior: the design language, the patterns and the blocks.
*/

/** The views of the Colors section; the ids are the ones a saved draft carries. */
export type ColorsView =
  'colors' | 'scales' | 'surface' | 'themes' | 'groups' | 'contrast' | 'diff';
export type BehaviorPage = 'design-language' | 'patterns' | 'blocks';

export type Route =
  | { section: 'colors'; view: ColorsView }
  | { section: 'theme' }
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

/** The first page of the studio: the palette, where the work starts. */
export const HOME: Route = { section: 'colors', view: 'colors' };

/** The address of a page, as a link writes it: `#/colors/palette`. */
export function hrefOf(route: Route): string {
  if (route.section === 'theme') return '#/theme';
  if (route.section === 'colors')
    return `#/colors/${COLORS_PAGES.find((page) => page.id === route.view)!.slug}`;
  return `#/behavior/${BEHAVIOR_PAGES.find((page) => page.id === route.page)!.slug}`;
}

/** The page of an address, or undefined when it names none. */
export function routeOf(hash: string): Route | undefined {
  const [section, slug] = hash.replace(/^#\/?/, '').split('/');
  if (section === 'theme' && !slug) return { section: 'theme' };
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
