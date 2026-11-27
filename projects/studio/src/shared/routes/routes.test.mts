import { expect, test } from 'vitest'

import {
  aroundStage,
  BEFORE_STAGES,
  BEHAVIOR_PAGES,
  hrefOf,
  HOME,
  MODE_VIEWS,
  PAGES,
  placeOf,
  routeOf,
  reviewRoute,
  STAGES,
  THEME_PAGE,
  themeRoute,
  workPlaceOf,
  type Route,
} from './routes.js'

// Every page of the studio has an address of its own, in the hash, and the address leads back
// to the page: a link is the page (app-shell, "sections-are-links").

const pages: Route[] = [
  { section: 'introduction' },
  { section: 'opening' },
  { section: 'colours' },
  { section: 'groups' },
  { section: 'scale', formula: 'wcag3', name: 'tone' },
  { section: 'scale', formula: 'wcag2', name: 'v1', group: 'tone' },
  { section: 'weights' },
  { section: 'themes' },
  { section: 'themes', theme: 'editorial' },
  { section: 'exceptions' },
  { section: 'full-review' },
  { section: 'full-review', theme: 'my-product', mode: 'dark' },
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
  expect(hrefOf({ section: 'colours' })).toBe('#/colours')
  expect(hrefOf({ section: 'weights' })).toBe('#/weights')
  expect(hrefOf(themeRoute())).toBe('#/themes')
  expect(hrefOf(themeRoute('editorial'))).toBe('#/themes/editorial')
  expect(hrefOf(reviewRoute())).toBe('#/full-review')
  expect(hrefOf(reviewRoute('editorial', 'dark'))).toBe('#/full-review/editorial/dark')
  // an item of the review names its theme and its mode, both or none
  expect(hrefOf(reviewRoute('editorial'))).toBe('#/full-review')
  expect(hrefOf({ section: 'theme' })).toBe('#/theme')
  expect(hrefOf({ section: 'behavior', page: 'design-language' })).toBe('#/behavior/design-language')
})

test('an address that names no page is no route', () => {
  for (const hash of ['', '#', '#/colors', '#/colors/nothing', '#/foundation', '#/start/more', '#/opening/more', '#/introduction/more', '#/colours/more', '#/colours/scale', '#/colours/scale/wcag4/tone', '#/colours/scale/wcag3', '#/colours/scale/wcag3/tone/to/tone', '#/colours/scale/wcag3/tone/from', '#/themes/My-Theme', '#/themes/editorial/dark', '#/full-review/editorial', '#/full-review/editorial/sepia', '#/full-review/editorial/dark/more', '#/exceptions/more'])
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

// One table of the pages (#1400): the menus of the bar and the addresses read the same rows; the
// Colors section went with #1403 and #1404, its pages became the stages
test('one table holds the pages of the bar: the Theme section and the menu of Behavior', () => {
  expect(PAGES.map((page) => page.section)).toEqual(['theme', ...BEHAVIOR_PAGES.map(() => 'behavior')])
  expect(BEHAVIOR_PAGES.map(({ label }) => label)).toEqual(['Design language', 'Patterns', 'Blocks'])
  expect([THEME_PAGE.label, THEME_PAGE.icon]).toEqual(['Theme', 'mi/baseline/format-size'])
  // every row has a name and an icon for its menu
  for (const page of PAGES) expect(page.label && page.icon).toBeTruthy()
})

// The ids a draft saved before carries (state/draft.ts, `view`): each opens the view that took the
// place of its page, so a draft resumes on the work it was on
test('a draft saved on a page of the Colors section resumes on the view that replaced it', () => {
  expect(workPlaceOf('colors')).toBe('#/colours')
  expect(workPlaceOf('scales')).toBe('#/colors/contrast-scales')
  // Groups stood beside Colours: the view that replaced it is outside the stages
  expect(workPlaceOf('groups')).toBe('#/colours')
  expect(workPlaceOf('surface')).toBe('#/weights')
  // Themes and Contrast check went with #1404: the stage Themes and the full review
  expect(workPlaceOf('themes')).toBe('#/themes')
  expect(workPlaceOf('contrast')).toBe('#/full-review')
  // Diffs went in #1402, the Palette was never an id: nothing to resume on
  expect(workPlaceOf('diff')).toBeUndefined()
  expect(workPlaceOf('palette')).toBeUndefined()
  for (const mode of MODE_VIEWS)
    expect(routeOf(hrefOf({ section: 'theme', theme: 'editorial', mode }))).toEqual({
      section: 'theme',
      theme: 'editorial',
      mode,
    })
})

// The stages in order (#1402, magma/patterns/stages-in-order.md): the four stages and the full
// review, each a view of its own (#1403, #1404)
test('the stages run in the order of the object model, each a view at its own address', () => {
  expect(STAGES.map(({ id }) => id)).toEqual(['colours', 'weights', 'themes', 'exceptions', 'full-review'])
  expect(STAGES.map(({ label }) => label)).toEqual(['Colors', 'Weights', 'Themes', 'Exceptions', 'Full review'])
  // four numbered stages, then the review with no number
  expect(STAGES.map(({ numbered }) => numbered)).toEqual([true, true, true, true, false])
  expect(STAGES.map(({ route }) => hrefOf(route))).toEqual([
    '#/colours',
    '#/weights',
    '#/themes',
    '#/exceptions',
    '#/full-review',
  ])
  expect(hrefOf({ section: 'exceptions' })).toBe('#/exceptions')
  for (const stage of STAGES) expect(stage.icon).toMatch(/^mi\/baseline\//)
})

test('a page is a stage, a page beside one, or outside the flow', () => {
  const where = (route: Route) => {
    const place = placeOf(route)
    return place && `${place.place} of ${place.stage.id} (${place.index})`
  }
  expect(where({ section: 'colours' })).toBe('stage of colours (0)')
  // Scale and Group beside Colours: the page of any scale, today's Groups
  expect(where({ section: 'scale', formula: 'wcag3', name: 'tone' })).toBe('side-page of colours (0)')
  expect(where({ section: 'scale', formula: 'wcag2', name: 'v1', group: 'tone' })).toBe('side-page of colours (0)')
  // Groups went out of the stages (#1403)
  expect(where({ section: 'groups' })).toBeUndefined()
  expect(where({ section: 'weights' })).toBe('stage of weights (1)')
  expect(where({ section: 'themes' })).toBe('stage of themes (2)')
  // a stage at any of its addresses: Themes on a theme, the review on an item
  expect(where({ section: 'themes', theme: 'editorial' })).toBe('stage of themes (2)')
  expect(where({ section: 'exceptions' })).toBe('stage of exceptions (3)')
  expect(where({ section: 'full-review' })).toBe('stage of full-review (4)')
  expect(where({ section: 'full-review', theme: 'editorial', mode: 'dark' })).toBe('stage of full-review (4)')
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
  expect(named(0)).toEqual(['Opening #/opening', '2. Weights #/weights'])
  expect(BEFORE_STAGES.route).toEqual({ section: 'opening' })
  expect(named(1)).toEqual(['1. Colors #/colours', '3. Themes #/themes'])
  expect(named(3)).toEqual(['3. Themes #/themes', 'Full review #/full-review'])
  // the full review has no number, and the exit after it
  expect(named(4)).toEqual(['4. Exceptions #/exceptions', undefined])
})

// The pages that went keep their address: a link written before opens the view that took their
// place, whose address the router writes over it (#1403)
test('the address of a page that went opens the view that replaced it', () => {
  expect(routeOf('#/colors/palette')).toEqual({ section: 'colours' })
  expect(workPlaceOf('colors')).toBe('#/colours')
  expect(workPlaceOf('scales')).toBe('#/colors/contrast-scales')
  expect(routeOf('#/colors/contrast-scales')).toEqual({ section: 'scale', formula: 'wcag3', name: 'default' })
  expect(routeOf('#/colors/semantic-surface')).toEqual({ section: 'weights' })
  // Themes and Contrast check (#1404)
  expect(routeOf('#/colors/themes')).toEqual({ section: 'themes' })
  expect(routeOf('#/colors/contrast-check')).toEqual({ section: 'full-review' })
  expect(routeOf('#/colors/groups')).toEqual({ section: 'groups' })
  expect(workPlaceOf('surface')).toBe('#/weights')
  expect(routeOf('#/weights')).toEqual({ section: 'weights' })
  expect(routeOf('#/weights/more')).toBeUndefined()
  expect(workPlaceOf('#/colors/palette')).toBe('#/colors/palette')
  expect(workPlaceOf('#/nowhere')).toBeUndefined()
  expect(workPlaceOf(undefined)).toBeUndefined()
})
