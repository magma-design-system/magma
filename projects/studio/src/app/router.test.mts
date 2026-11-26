import { expect, test } from 'vitest'

import {
  BEHAVIOR_PAGES,
  COLORS_PAGES,
  createRouter,
  HOME,
  hrefOf,
  memoryLocation,
  PAGES,
  routeOf,
  THEME_PAGE,
  type Route,
} from './router.js'

// Every page of the studio has an address of its own, in the hash, and the address leads back
// to the page: a link is the page (app-shell, "sections-are-links").

const pages: Route[] = [
  { section: 'start' },
  ...COLORS_PAGES.map(({ id }): Route => ({ section: 'colors', view: id })),
  { section: 'theme' },
  ...BEHAVIOR_PAGES.map(({ id }): Route => ({ section: 'behavior', page: id })),
]

test('every page has an address that leads back to it', () => {
  for (const page of pages) expect(routeOf(hrefOf(page))).toEqual(page)
  expect(new Set(pages.map(hrefOf)).size).toBe(pages.length)
})

test('the addresses read as the menus name the pages', () => {
  expect(hrefOf({ section: 'start' })).toBe('#/start')
  expect(hrefOf({ section: 'colors', view: 'colors' })).toBe('#/colors/palette')
  expect(hrefOf({ section: 'colors', view: 'surface' })).toBe('#/colors/semantic-surface')
  expect(hrefOf({ section: 'theme' })).toBe('#/theme')
  expect(hrefOf({ section: 'behavior', page: 'design-language' })).toBe('#/behavior/design-language')
})

test('an address that names no page is no route', () => {
  for (const hash of ['', '#', '#/colors', '#/colors/nothing', '#/foundation', '#/start/more'])
    expect(routeOf(hash)).toBeUndefined()
  // a hash that is no address of the studio: the anchor of a heading of the page that hosts it
  for (const hash of ['#start', '#colors/palette', '#the-colors-of-a-theme'])
    expect(routeOf(hash)).toBeUndefined()
})

// The Theme section may name the theme it opens on and the mode it shows it in: the links of the
// Themes page that test a theme in a mode (vittorio, 2026-11-07)
test('the Theme section names a theme and a mode in its address, which lead back to them', () => {
  const tests: Route[] = [
    { section: 'theme', theme: 'editorial' },
    { section: 'theme', theme: 'editorial', mode: 'light' },
    { section: 'theme', theme: 'my-product', mode: 'dark' },
    { section: 'theme', theme: 'business', mode: 'both' },
  ]
  for (const route of tests) expect(routeOf(hrefOf(route))).toEqual(route)
  expect(hrefOf({ section: 'theme', theme: 'editorial', mode: 'dark' })).toBe('#/theme/editorial/dark')
  // a mode with no theme names nothing more than the section
  expect(hrefOf({ section: 'theme', mode: 'dark' })).toBe('#/theme')
  // a name a theme cannot take (THEME_NAME of design-tokens), a mode the section has not, more
  for (const hash of ['#/theme/My-Theme', '#/theme/editorial/sepia', '#/theme/editorial/dark/more', '#/theme//dark'])
    expect(routeOf(hash)).toBeUndefined()
})

// One table of the pages (#1400): the menus of the bar and the addresses read the same rows
test('one table holds the pages: the menus of Colors and Behavior, and the Theme section', () => {
  expect(PAGES.map((page) => page.section)).toEqual([
    ...COLORS_PAGES.map(() => 'colors'),
    'theme',
    ...BEHAVIOR_PAGES.map(() => 'behavior'),
  ])
  expect(COLORS_PAGES.map(({ label }) => label)).toEqual([
    'Palette', 'Contrast scales', 'Semantic surface', 'Themes', 'Groups', 'Contrast check', 'Diffs',
  ])
  expect(BEHAVIOR_PAGES.map(({ label }) => label)).toEqual(['Design language', 'Patterns', 'Blocks'])
  expect([THEME_PAGE.label, THEME_PAGE.icon]).toEqual(['Theme', 'mi/baseline/format-size'])
  // every row has a name and an icon for its menu
  for (const page of PAGES) expect(page.label && page.icon).toBeTruthy()
})

// The router follows a location: in memory here, as for a host that owns the address of its page
// (#695)
test('the router opens the page of the address, else the first page, its address written in place', () => {
  const groups = memoryLocation('#/colors/groups')
  expect(createRouter({ location: groups }).route.value).toEqual({ section: 'colors', view: 'groups' })
  expect(groups.entries).toEqual(['#/colors/groups'])

  for (const start of ['', '#', '#/colors/nothing']) {
    const location = memoryLocation(start)
    expect(createRouter({ location }).route.value).toEqual(HOME)
    // replaced, not added: back does not lead to an address that names nothing
    expect(location.entries).toEqual(['#/start'])
  }
})

test('navigate opens a page as its link does; replace writes its address in place', () => {
  const location = memoryLocation('#/start')
  const router = createRouter({ location })
  router.navigate({ section: 'colors', view: 'scales' })
  expect(router.route.value).toEqual({ section: 'colors', view: 'scales' })
  expect(location.entries).toEqual(['#/start', '#/colors/contrast-scales'])

  // a choice made in the Theme section: no page to go back to
  router.navigate({ section: 'theme' })
  router.navigate({ section: 'theme', theme: 'editorial', mode: 'dark' }, { replace: true })
  expect(router.route.value).toEqual({ section: 'theme', theme: 'editorial', mode: 'dark' })
  expect(location.entries).toEqual(['#/start', '#/colors/contrast-scales', '#/theme/editorial/dark'])

  // the page shown again writes nothing
  router.navigate({ section: 'theme', theme: 'editorial', mode: 'dark' })
  expect(location.entries).toHaveLength(3)
})

test('the router follows the address from outside, and leaves alone a hash that is no address', () => {
  const location = memoryLocation('#/colors/palette')
  const router = createRouter({ location })
  // a link followed, back or forward
  location.go('#/behavior/patterns')
  expect(router.route.value).toEqual({ section: 'behavior', page: 'patterns' })

  // the anchor of a heading of the page that hosts the studio (Starlight): the page stays, and
  // so does the anchor
  location.go('#the-colors-of-a-theme')
  expect(router.route.value).toEqual({ section: 'behavior', page: 'patterns' })
  expect(location.read()).toBe('#the-colors-of-a-theme')

  // an address of the studio that names no page opens the first page, in place
  location.go('#/colors/nothing')
  expect(router.route.value).toEqual(HOME)
  expect(location.read()).toBe('#/start')

  // once disposed, it follows nothing
  router.dispose()
  location.go('#/colors/groups')
  expect(router.route.value).toEqual(HOME)
})
