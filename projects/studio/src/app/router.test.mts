import { expect, test } from 'vitest'

import { HOME } from '../shared/routes/routes.js'
import { createRouter, memoryLocation } from './router.js'

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
    expect(location.entries).toEqual(['#/introduction'])
  }
})

test('navigate opens a page as its link does; replace writes its address in place', () => {
  const location = memoryLocation('#/introduction')
  const router = createRouter({ location })
  router.navigate({ section: 'colors', view: 'scales' })
  expect(router.route.value).toEqual({ section: 'colors', view: 'scales' })
  expect(location.entries).toEqual(['#/introduction', '#/colors/contrast-scales'])

  // a choice made in the Theme section: no page to go back to
  router.navigate({ section: 'theme' })
  router.navigate({ section: 'theme', theme: 'editorial', mode: 'dark' }, { replace: true })
  expect(router.route.value).toEqual({ section: 'theme', theme: 'editorial', mode: 'dark' })
  expect(location.entries).toEqual(['#/introduction', '#/colors/contrast-scales', '#/theme/editorial/dark'])

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
  expect(location.read()).toBe('#/introduction')

  // once disposed, it follows nothing
  router.dispose()
  location.go('#/colors/groups')
  expect(router.route.value).toEqual(HOME)
})

// #1402: the Start page is the introduction (GLOSSARY.md, decision 13); its address of before
// opens it, and the address of the introduction takes its place
test('an alias opens its page and writes the address of the page in its place', () => {
  const location = memoryLocation('#/start')
  const router = createRouter({ location })
  expect(router.route.value).toEqual({ section: 'introduction' })
  expect(location.entries).toEqual(['#/introduction'])
  location.go('#/colors/palette')
  location.go('#/start')
  expect(router.route.value).toEqual({ section: 'introduction' })
  // in place: back leads to the page before it, not to the alias
  expect(location.entries).toEqual(['#/introduction', '#/colors/palette', '#/introduction'])
})
