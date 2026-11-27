import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { h, render } from 'preact'
import { within } from '@testing-library/preact'

import type { FileOut } from '../engine/exports.js'
import { createStudio, type StudioState } from '../state/studio.js'
import { textOf } from '../../test/text.mjs'
import { Studio } from './shell.js'

// The stages in order (#1402), as the pattern of the studio has them
// (magma/patterns/stages-in-order.md): the stepper under the bar on a stage and on a page beside
// one, the foot of a stage at the end of its page, the exit on the last. jsdom does not upgrade the
// Magma components: the test reads the markup the shell writes, the native elements by their role
// and name, the Magma ones by their tag and attributes.

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

/** The studio at an address, on the state given or on one of its own. */
const at = async (hash: string, state?: StudioState) => {
  location.hash = hash
  render(h(Studio, { state }), root)
  await vi.waitFor(() => {
    if (!root.querySelector('mds-header-bar')) throw new Error('no bar yet')
  })
}
const stages = () => within(root).queryByRole('navigation', { name: 'Stages' })
const stepper = () => stages()?.querySelector('mds-stepper-bar') ?? null
const items = () => [...(stepper()?.querySelectorAll('mds-stepper-bar-item') ?? [])]
const foot = () => within(root).queryByRole('navigation', { name: 'The stage before and after' })
const footButtons = () =>
  [...(foot()?.querySelectorAll('mds-button') ?? [])].map((one) => ({
    text: textOf(one),
    href: one.getAttribute('href'),
  }))

test('on a stage the stepper shows the stages in order under the bar, the current one by its position', async () => {
  await at('#/weights')
  expect(stepper()?.getAttribute('items-done')).toBe('2')
  expect(items().map((one) => textOf(one))).toEqual([
    'Colors',
    'Weights',
    'Themes',
    'Exceptions',
    'Full review',
  ])
  // the four stages with their number, the review with none
  expect(items().map((one) => one.hasAttribute('step'))).toEqual([true, true, true, true, false])
  // under the bar, before the page
  const bar = root.querySelector('mds-header')!
  expect(bar.compareDocumentPosition(stages()!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  // each stage of its own page opens with its position
  for (const [hash, done] of [
    ['#/colours', '1'],
    ['#/themes', '3'],
    ['#/exceptions', '4'],
    ['#/full-review', '5'],
  ]) {
    location.hash = hash
    await vi.waitFor(() => expect(stepper()?.getAttribute('items-done')).toBe(done))
  }
})

test('a page beside a stage keeps its stage current, and has no foot', async () => {
  // the page of a scale, beside Colours (#1403)
  await at('#/colours/scale/wcag3/tone')
  await vi.waitFor(() => expect(stepper()?.getAttribute('items-done')).toBe('1'))
  expect(foot()).toBeNull()
})

test('a page that is no stage has neither the stepper nor the foot', async () => {
  for (const hash of ['#/introduction', '#/opening', '#/theme', '#/behavior/patterns']) {
    await at(hash)
    expect(stages()).toBeNull()
    expect(foot()).toBeNull()
    render(null, root)
  }
})

test('the foot of a stage leads back and forward, named after where it leads, at the end of the page', async () => {
  await at('#/weights')
  expect(footButtons()).toEqual([
    { text: '1. Colors', href: '#/colours' },
    { text: '3. Themes', href: '#/themes' },
  ])
  // the way back outlined first, the way forward the main action, last
  const [back, forward] = foot()!.querySelectorAll('mds-button')
  expect([back.getAttribute('tone'), forward.getAttribute('tone')]).toEqual(['outline', null])
  // at the end of the region of the page that scrolls, the main of the stage
  const content = root.querySelector('.studio-section main')!
  expect(content.contains(foot())).toBe(true)
  expect(content.lastElementChild?.contains(foot())).toBe(true)
  // the first stage leads back to the view before the stages
  location.hash = '#/colours'
  await vi.waitFor(() =>
    expect(footButtons()).toEqual([
      { text: 'Opening', href: '#/opening' },
      { text: '2. Weights', href: '#/weights' },
    ]),
  )
  // the stage with no page of today has its own, the foot at its end
  location.hash = '#/exceptions'
  await vi.waitFor(() =>
    expect(footButtons()).toEqual([
      { text: '3. Themes', href: '#/themes' },
      { text: 'Full review', href: '#/full-review' },
    ]),
  )
  expect(root.querySelector('main')?.lastElementChild).toBe(foot())
})

test('the last stage ends with the exit, which downloads the preset through the gate', async () => {
  const files: FileOut[] = []
  const studio = createStudio({ api: false, download: (file) => void files.push(file) })
  await at('#/full-review', studio)
  const buttons = footButtons()
  expect(buttons[0]).toEqual({ text: '4. Exceptions', href: '#/exceptions' })
  expect(buttons[1]).toEqual({ text: 'Download the preset', href: null })
  const exit = foot()!.querySelectorAll('mds-button')[1] as HTMLElement
  exit.click()
  if (studio.verdict.value.state === 'fail') {
    // the dialog of the gate asks first
    expect(studio.pendingExport.value?.label).toBe('Download the preset')
  } else {
    expect(files.map(({ name }) => name)).toEqual(['magma-design-tokensrc.json'])
  }
})

test('a done stage of the stepper opens its stage, as a link would', async () => {
  await at('#/themes')
  items()[0].dispatchEvent(new CustomEvent('mdsStepperBarItemDone', { detail: { value: 'colours' } }))
  await vi.waitFor(() => expect(location.hash).toBe('#/colours'))
  await vi.waitFor(() => expect(stepper()?.getAttribute('items-done')).toBe('1'))
})

test('the stepper and the foot speak the language of the studio', async () => {
  document.documentElement.lang = 'it'
  try {
    await at('#/weights')
    expect(within(root).queryByRole('navigation', { name: 'Passi' })).not.toBeNull()
    expect(
      [...root.querySelectorAll('mds-stepper-bar-item')].map((one) => textOf(one)),
    ).toEqual(['Colori', 'Pesi', 'Temi', 'Eccezioni', 'Giro completo'])
    const footIt = within(root).getByRole('navigation', { name: 'Il passo prima e quello dopo' })
    expect([...footIt.querySelectorAll('mds-button')].map((one) => textOf(one))).toEqual([
      '1. Colori',
      '3. Temi',
    ])
  } finally {
    document.documentElement.lang = ''
  }
})
