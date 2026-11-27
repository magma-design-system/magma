import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { h, render } from 'preact'
import { within } from '@testing-library/preact'

import { textOf } from '../../test/text.mjs'
import { Studio } from './shell.js'

// The stages in order (#1402; a strip of links since #1595), as the pattern of the studio has them
// (magma/patterns/stages-in-order.md): on a stage and on a page beside one, a strip of mds-tab
// under the bar, one link per stage, the current one selected, right above the stage; no foot.
// jsdom does not upgrade the Magma components: the test reads the markup the shell writes, the
// native elements by their role and name, the Magma ones by their tag and attributes.

const root = document.createElement('div')
document.body.append(root)
beforeEach(() => {
  vi.stubGlobal('fetch', () => Promise.reject(new Error('no server')))
  localStorage.clear()
})
afterEach(() => {
  render(null, root)
  vi.unstubAllGlobals()
  location.hash = ''
})

/** The studio at an address. */
const at = async (hash: string) => {
  location.hash = hash
  render(h(Studio, {}), root)
  await vi.waitFor(() => {
    if (!root.querySelector('mds-header-bar')) throw new Error('no bar yet')
  })
}
const stages = () => within(root).queryByRole('navigation', { name: 'Stages' })
const strip = () => stages()?.querySelector('mds-tab') ?? null
const items = () => [...(strip()?.querySelectorAll('mds-tab-item') ?? [])]
/** The stage the strip shows as current: the text of its selected item. */
const current = () => textOf(items().find((one) => one.hasAttribute('selected')))

test('on a stage the strip shows the stages in order, one link each, the current one selected', async () => {
  await at('#/weights')
  expect(items().map((one) => ({ text: textOf(one), href: one.getAttribute('href') }))).toEqual([
    { text: '1. Colors', href: '#/colours' },
    { text: '2. Weights', href: '#/weights' },
    { text: '3. Themes', href: '#/colors/themes' },
    { text: '4. Exceptions', href: '#/exceptions' },
    { text: 'Full review', href: '#/colors/contrast-check' },
  ])
  // one selected, the stage of the page
  expect(items().filter((one) => one.hasAttribute('selected'))).toHaveLength(1)
  expect(current()).toBe('2. Weights')
  // each stage of its own page opens with its item selected
  for (const [hash, stage] of [
    ['#/colours', '1. Colors'],
    ['#/colors/themes', '3. Themes'],
    ['#/exceptions', '4. Exceptions'],
    ['#/colors/contrast-check', 'Full review'],
  ]) {
    location.hash = hash
    await vi.waitFor(() => expect(current()).toBe(stage))
  }
})

test('the strip stands under the bar and right above the stage, with nothing between them', async () => {
  await at('#/weights')
  const bar = root.querySelector('mds-header')!
  expect(bar.compareDocumentPosition(stages()!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  // the next element after the strip is the region of the stage
  expect(stages()!.nextElementSibling?.querySelector('main mds-text[tag="h1"]')?.textContent).toBe(
    'Weights',
  )
  // on the stage with a page of its own, its main
  location.hash = '#/exceptions'
  await vi.waitFor(() => expect(stages()!.nextElementSibling?.tagName).toBe('MAIN'))
})

test('a page beside a stage keeps its stage selected', async () => {
  // the page of a scale, beside Colours (#1403)
  await at('#/colours/scale/wcag3/tone')
  await vi.waitFor(() => expect(current()).toBe('1. Colors'))
})

test('a page that is no stage has no strip', async () => {
  for (const hash of ['#/introduction', '#/opening', '#/groups', '#/theme', '#/behavior/patterns']) {
    await at(hash)
    expect(stages()).toBeNull()
    expect(root.querySelector('mds-tab-item[href]')).toBeNull()
    render(null, root)
  }
})

test('no stage ends with a foot: the strip opens every stage, the exit is the bar', async () => {
  for (const hash of ['#/colours', '#/weights', '#/exceptions', '#/colors/contrast-check']) {
    await at(hash)
    // the stepper and the foot of #1402 are gone
    expect(root.querySelector('mds-stepper-bar')).toBeNull()
    expect(within(root).queryByRole('navigation', { name: 'The stage before and after' })).toBeNull()
    // the stages after the current one are one click away too
    expect(items().every((one) => one.getAttribute('href'))).toBe(true)
    render(null, root)
  }
})

test('a link of the strip opens its stage, and the strip follows the address', async () => {
  await at('#/colors/themes')
  location.hash = items()[0].getAttribute('href')!
  await vi.waitFor(() => expect(current()).toBe('1. Colors'))
  // back in the history, the stage before
  location.hash = '#/colors/themes'
  await vi.waitFor(() => expect(current()).toBe('3. Themes'))
})

test('the strip speaks the language of the studio', async () => {
  document.documentElement.lang = 'it'
  try {
    await at('#/weights')
    const nav = within(root).getByRole('navigation', { name: 'Passi' })
    expect([...nav.querySelectorAll('mds-tab-item')].map((one) => textOf(one))).toEqual([
      '1. Colori',
      '2. Pesi',
      '3. Temi',
      '4. Eccezioni',
      'Giro completo',
    ])
  } finally {
    document.documentElement.lang = ''
  }
})
