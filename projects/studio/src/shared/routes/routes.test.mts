import { expect, test } from 'vitest'

import {
  aroundStage,
  BEFORE_STAGES,
  BEHAVIOR_PAGES,
  COLORS_PAGES,
  COLORS_VIEWS,
  colorsViewOf,
  hrefOf,
  HOME,
  MODE_VIEWS,
  PAGES,
  placeOf,
  routeOf,
  STAGES,
  THEME_PAGE,
  type Route,
} from './routes.js'

// Every page of the studio has an address of its own, in the hash, and the address leads back
// to the page: a link is the page (app-shell, "sections-are-links").

const pages: Route[] = [
  { section: 'introduction' },
  { section: 'opening' },
  { section: 'exceptions' },
  ...COLORS_PAGES.map(({ id }): Route => ({ section: 'colors', view: id })),
  { section: 'theme' },
  ...BEHAVIOR_PAGES.map(({ id }): Route => ({ section: 'behavior', page: id })),
]

test('every page has an address that leads back to it', () => {
  for (const page of pages) expect(routeOf(hrefOf(page))).toEqual(page)
  expect(new Set(pages.map(hrefOf)).size).toBe(pages.length)
})

test('the addresses read as the menus name the pages', () => {
  expect(hrefOf({ section: 'introduction' })).toBe('#/introduction')
  expect(hrefOf({ section: 'opening' })).toBe('#/opening')
  // the address of the Start page the introduction was (GLOSSARY.md, decision 13)
  expect(routeOf('#/start')).toEqual({ section: 'introduction' })
  expect(hrefOf({ section: 'colors', view: 'colors' })).toBe('#/colors/palette')
  expect(hrefOf({ section: 'colors', view: 'surface' })).toBe('#/colors/semantic-surface')
  expect(hrefOf({ section: 'theme' })).toBe('#/theme')
  expect(hrefOf({ section: 'behavior', page: 'design-language' })).toBe('#/behavior/design-language')
})

test('an address that names no page is no route', () => {
  for (const hash of ['', '#', '#/colors', '#/colors/nothing', '#/foundation', '#/start/more', '#/opening/more', '#/introduction/more'])
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
    'Palette', 'Contrast scales', 'Semantic surface', 'Themes', 'Groups', 'Contrast check',
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
  expect(colorsViewOf('contrast')).toBe('contrast')
  // Diffs went in #1402: a draft saved on it opens on the page of Colors it lands on
  expect(colorsViewOf('diff')).toBeUndefined()
  expect(colorsViewOf('palette')).toBeUndefined()
  for (const mode of MODE_VIEWS)
    expect(routeOf(hrefOf({ section: 'theme', theme: 'editorial', mode }))).toEqual({
      section: 'theme',
      theme: 'editorial',
      mode,
    })
})

// The stages in order (#1402, magma/patterns/stages-in-order.md): the four stages and the full
// review, each opening the page of today that does its work, at the address it has today
test('the stages run in the order of the object model, each on the page of today that does its work', () => {
  expect(STAGES.map(({ id }) => id)).toEqual(['colours', 'weights', 'themes', 'exceptions', 'full-review'])
  expect(STAGES.map(({ label }) => label)).toEqual(['Colors', 'Weights', 'Themes', 'Exceptions', 'Full review'])
  // four numbered stages, then the review with no number
  expect(STAGES.map(({ numbered }) => numbered)).toEqual([true, true, true, true, false])
  expect(STAGES.map(({ route }) => hrefOf(route))).toEqual([
    '#/colors/palette',
    '#/colors/semantic-surface',
    '#/colors/themes',
    '#/exceptions',
    '#/colors/contrast-check',
  ])
  expect(hrefOf({ section: 'exceptions' })).toBe('#/exceptions')
  for (const stage of STAGES) expect(stage.icon).toMatch(/^mi\/baseline\//)
})

test('a page is a stage, a page beside one, or outside the flow', () => {
  const where = (route: Route) => {
    const place = placeOf(route)
    return place && `${place.place} of ${place.stage.id} (${place.index})`
  }
  expect(where({ section: 'colors', view: 'colors' })).toBe('stage of colours (0)')
  // Scale and Group beside Colours: today Contrast scales and Groups
  expect(where({ section: 'colors', view: 'scales' })).toBe('side-page of colours (0)')
  expect(where({ section: 'colors', view: 'groups' })).toBe('side-page of colours (0)')
  expect(where({ section: 'colors', view: 'surface' })).toBe('stage of weights (1)')
  expect(where({ section: 'colors', view: 'themes' })).toBe('stage of themes (2)')
  expect(where({ section: 'exceptions' })).toBe('stage of exceptions (3)')
  expect(where({ section: 'colors', view: 'contrast' })).toBe('stage of full-review (4)')
  // no stage: the Start page, the Theme section, the rules, the palette against Magma's
  for (const route of [
    HOME,
    { section: 'opening' },
    { section: 'theme' },
    { section: 'theme', theme: 'editorial', mode: 'dark' },
    { section: 'behavior', page: 'patterns' },
  ] as Route[])
    expect(placeOf(route)).toBeUndefined()
})

test('each stage leads back to the view before it and forward to the stage after it, the last to none', () => {
  const named = (index: number) => {
    const { before, after } = aroundStage(index)
    const name = (link?: { label: string; number?: number; route: Route }) =>
      link && `${link.number ? `${link.number}. ` : ''}${link.label} ${hrefOf(link.route)}`
    return [name(before), name(after)]
  }
  // the first stage leads back to the view before the stages
  expect(named(0)).toEqual(['Opening #/opening', '2. Weights #/colors/semantic-surface'])
  expect(BEFORE_STAGES.route).toEqual({ section: 'opening' })
  expect(named(1)).toEqual(['1. Colors #/colors/palette', '3. Themes #/colors/themes'])
  expect(named(3)).toEqual(['3. Themes #/colors/themes', 'Full review #/colors/contrast-check'])
  // the full review has no number, and the exit after it
  expect(named(4)).toEqual(['4. Exceptions #/exceptions', undefined])
})
