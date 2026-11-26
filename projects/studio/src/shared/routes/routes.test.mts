import { expect, test } from 'vitest'

import {
  BEHAVIOR_PAGES,
  COLORS_PAGES,
  COLORS_VIEWS,
  colorsViewOf,
  hrefOf,
  MODE_VIEWS,
  PAGES,
  routeOf,
  THEME_PAGE,
  type Route,
} from './routes.js'

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

// The ids a saved draft carries and the ids an address names are the rows of the table (#1401: the
// ids came down from state/draft.ts and scene-prefs.tsx, so the table imports no page)
test('the ids of the pages of Colors and of the modes are those the table and the addresses use', () => {
  expect(COLORS_PAGES.map(({ id }) => id)).toEqual([...COLORS_VIEWS])
  expect(colorsViewOf('diff')).toBe('diff')
  expect(colorsViewOf('palette')).toBeUndefined()
  for (const mode of MODE_VIEWS)
    expect(routeOf(hrefOf({ section: 'theme', theme: 'editorial', mode }))).toEqual({
      section: 'theme',
      theme: 'editorial',
      mode,
    })
})
