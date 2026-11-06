import { expect, test } from 'vitest'

import { BEHAVIOR_PAGES, COLORS_PAGES, hrefOf, routeOf, type Route } from '../src/routes.js'

// Every page of the studio has an address of its own, in the hash, and the address leads back
// to the page: a link is the page (app-shell, "sections-are-links").

const pages: Route[] = [
  ...COLORS_PAGES.map(({ id }): Route => ({ section: 'colors', view: id })),
  { section: 'theme' },
  ...BEHAVIOR_PAGES.map(({ id }): Route => ({ section: 'behavior', page: id })),
]

test('every page has an address that leads back to it', () => {
  for (const page of pages) expect(routeOf(hrefOf(page))).toEqual(page)
  expect(new Set(pages.map(hrefOf)).size).toBe(pages.length)
})

test('the addresses read as the menus name the pages', () => {
  expect(hrefOf({ section: 'colors', view: 'colors' })).toBe('#/colors/palette')
  expect(hrefOf({ section: 'colors', view: 'surface' })).toBe('#/colors/semantic-surface')
  expect(hrefOf({ section: 'theme' })).toBe('#/theme')
  expect(hrefOf({ section: 'behavior', page: 'design-language' })).toBe('#/behavior/design-language')
})

test('an address that names no page is no route', () => {
  for (const hash of ['', '#', '#/colors', '#/colors/nothing', '#/theme/more', '#/foundation'])
    expect(routeOf(hash)).toBeUndefined()
})
