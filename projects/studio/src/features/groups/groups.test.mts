import { afterEach, expect, test, vi } from 'vitest'
import { h, render } from 'preact'

import { GroupsPage } from './groups.js'
import type { StudioState } from '../../state/studio.js'
import { inStudio, startStudio } from '../../../test/studio.mjs'
import { textOf } from '../../../test/text.mjs'

// The view Groups (#1403; the Groups page until then) answers to the controls of Magma: the
// settings of the preset first, the selection of each family, the batch action, the view of the
// selection, the selection by export and the settings of each group. jsdom does not upgrade the
// components: the test dispatches the events they emit and reads the state of the studio.

const root = document.createElement('div')
document.body.append(root)
afterEach(() => {
  render(null, root)
  localStorage.clear()
  vi.unstubAllGlobals()
})

/** The view on a state of its own, not served by a command. */
function show (): StudioState {
  vi.stubGlobal('fetch', () => Promise.reject(new Error('no server')))
  const studio = startStudio()
  render(inStudio(studio, h(GroupsPage, {})), root)
  return studio
}

const emit = (element: Element, type: string, detail: unknown) =>
  element.dispatchEvent(new CustomEvent(type, { detail, bubbles: true }))
// a render of Preact after a state change
const flush = () => new Promise((resolve) => setTimeout(resolve, 0))
const cards = () => [...root.querySelectorAll<HTMLElement>('mds-card')]
const card = (title: string): HTMLElement =>
  cards().find((el) => el.querySelector('mds-text[tag="h2"]')?.textContent === title)!
// the checkbox of a family, named after it
const familySwitch = (scope: Element, name: string): HTMLElement =>
  [...scope.querySelectorAll<HTMLElement>('mds-input-switch[type="checkbox"]')].find(
    (el) => el.textContent === name,
  )!
const count = () =>
  [...root.querySelectorAll('[role="status"]')]
    .map((status) => status.textContent?.trim())
    .find((text) => text?.endsWith(' selected'))
const selectIn = (scope: Element, label: string) =>
  scope.querySelector(`mds-input-field[label="${label}"] mds-input-select`)
const batchButton = () =>
  [...root.querySelectorAll<HTMLElement>('mds-button')].find((el) => textOf(el) === 'Batch export')!

test('the preset comes first, then the groups in their order, their families in chromatic order', () => {
  show()
  expect(cards().map((one) => one.querySelector('mds-text[tag="h2"]')?.textContent)).toEqual([
    'The preset', 'variant', 'tone', 'status', 'label', 'brand',
  ])
  // the families, each a checkbox of Magma, always on the page, apart from the switch of the group
  const families = [...card('tone').querySelectorAll('mds-input-switch')].filter(
    (el) => !el.closest('[data-surface-switch]'),
  )
  expect(families.map((el) => el.textContent)).toEqual([
    'porcelain', 'kaolin', 'neutral', 'bisque', 'fireclay',
  ])
  for (const check of families) expect(check.getAttribute('type')).toBe('checkbox')
})

test('the settings of the preset, which every family inherits, are written to the preset', async () => {
  const studio = show()
  const preset = card('The preset')
  emit(selectIn(preset, 'Colorspace')!, 'mdsInputSelectChange', { value: 'OKLCH', values: ['OKLCH'] })
  await vi.waitFor(() => expect(studio.config.value.colorspace).toBe('OKLCH'), { timeout: 10_000 })
  expect(preset.querySelector('fieldset#palette-global-saturation')).not.toBeNull()
  expect([...preset.querySelectorAll('legend')].map((one) => one.textContent?.trim())).toEqual([
    'Global hue shifting',
    'Global saturation',
  ])
}, 30_000)

test('ticking families counts them and enables the batch action, which opens the batch', async () => {
  show()
  expect(count()).toBe('0 selected')
  expect(batchButton().hasAttribute('disabled')).toBe(true)
  emit(familySwitch(card('tone'), 'porcelain'), 'mdsInputSwitchChange', { name: '', checked: true, value: '' })
  await flush()
  emit(familySwitch(card('status'), 'info'), 'mdsInputSwitchChange', { name: '', checked: true, value: '' })
  await flush()
  expect(count()).toBe('2 selected')
  expect(batchButton().hasAttribute('disabled')).toBe(false)
  batchButton().click()
  const modal = await vi.waitFor(() => {
    const el = root.querySelector('mds-modal')
    if (!el) throw new Error('no batch dialog yet')
    return el
  })
  expect(modal.getAttribute('aria-label')).toBe('Batch export (2)')
})

test('group selected lifts the ticked families into a card of their own, out of their group', async () => {
  show()
  emit(familySwitch(card('tone'), 'kaolin'), 'mdsInputSwitchChange', { name: '', checked: true, value: '' })
  await flush()
  expect(card('Selected colors')).toBeUndefined()
  const groupSelected = root.querySelector('mds-input-switch[type="switch"]:not([checked])')!
  const switches = [...root.querySelectorAll('mds-input-switch[type="switch"]')]
  const toggle = switches.find((one) => one.textContent?.trim() === 'Group selected')!
  void groupSelected
  emit(toggle, 'mdsInputSwitchChange', { name: '', checked: true, value: '' })
  await flush()
  expect(familySwitch(card('Selected colors'), 'kaolin')).toBeDefined()
  expect(familySwitch(card('tone'), 'kaolin')).toBeUndefined()
  // the group still counts all of its families
  expect(card('tone').textContent).toContain('5 colors')
})

test('select by export selects the families of the export, opens the batch, then forgets the pick', async () => {
  show()
  const select = selectIn(root, 'Select by export')!
  expect(select.getAttribute('placeholder')).toBe('Choose an export')
  emit(select, 'mdsInputSelectChange', { value: 'tones', values: ['tones'] })
  const modal = await vi.waitFor(() => {
    const el = root.querySelector('mds-modal')
    if (!el) throw new Error('no batch dialog yet')
    return el
  })
  expect(modal.getAttribute('aria-label')).toBe('Batch export (5)')
  expect(count()).toBe('5 selected')
  // back on its placeholder, the same export can be picked again
  await vi.waitFor(() => expect(select.getAttribute('value')).toBe(''))
})

test('the formula and the contrast scale of a group are written to its settings', async () => {
  const studio = show()
  const formula = selectIn(card('status'), 'Formula')!
  expect(formula.getAttribute('size')).toBe('md')
  emit(formula, 'mdsInputSelectChange', { value: 'wcag2', values: ['wcag2'] })
  await vi.waitFor(() => expect(studio.config.value.groups?.status).toEqual({ surface: true, emphasis: true, formula: 'wcag2' }))
  // inherit again: the field goes away from the settings
  emit(selectIn(card('status'), 'Formula')!, 'mdsInputSelectChange', { value: '', values: [] })
  await vi.waitFor(() => expect(studio.config.value.groups?.status?.formula).toBeUndefined())
  emit(selectIn(card('status'), 'Contrast scale')!, 'mdsInputSelectChange', { value: 'tone', values: ['tone'] })
  await vi.waitFor(() => expect(studio.config.value.groups?.status?.ratios).toBe('tone'))
})

test('the scale of a group says whether it holds the roles of Magma, and leads to its page from the group', () => {
  show()
  const tone = card('tone')
  expect(tone.querySelector('mds-badge[label="Compatible with Magma"]')).not.toBeNull()
  expect(tone.querySelector('mds-link[label="Open the scale tone"]')?.getAttribute('href')).toBe(
    '#/colours/scale/wcag3/tone/from/tone',
  )
})

test('the export of a group is written when the field is left or Enter is pressed, not per keystroke', async () => {
  const studio = show()
  const field = () => card('label').querySelector('mds-input-field[label="Export"] mds-input')!
  emit(field(), 'mdsInputFocus', undefined)
  emit(field(), 'mdsInputChange', { value: 'city,' })
  await flush()
  expect(field().getAttribute('value')).toBe('city,')
  expect(studio.config.value.groups?.label).toBeUndefined()
  emit(field(), 'mdsInputChange', { value: 'city, palette' })
  await flush()
  emit(field(), 'mdsInputBlur', undefined)
  await vi.waitFor(() => expect(studio.config.value.groups?.label).toEqual({ export: ['city', 'palette'] }))
  emit(field(), 'mdsInputFocus', undefined)
  emit(field(), 'mdsInputChange', { value: '' })
  await flush()
  emit(field(), 'mdsInputKeydown', new KeyboardEvent('keydown', { key: 'Enter' }))
  await vi.waitFor(() => expect(studio.config.value.groups?.label?.export).toBeUndefined())
})

test('each family leads to Colours, the family selected there', () => {
  const studio = show()
  const link = card('label').querySelector<HTMLElement>('mds-button[aria-label="Open label.red in Colours"]')!
  expect(link.getAttribute('href')).toBe('#/colours')
  link.click()
  expect(studio.selectedName.value).toBe('label.red')
})

/** The switch of the surfaces of a group, in its card. */
const surfaceSwitchOf = (scope: Element) => scope.querySelector('[data-surface-switch] mds-input-switch')!

test('a group generates surfaces from its switch; status always, variant never', async () => {
  const studio = show()
  expect(surfaceSwitchOf(card('label')).hasAttribute('checked')).toBe(false)
  emit(surfaceSwitchOf(card('label')), 'mdsInputSwitchChange', { name: '', checked: true, value: '' })
  await vi.waitFor(() => expect(studio.config.value.groups?.label).toEqual({ surface: true }))
  await vi.waitFor(() => expect(surfaceSwitchOf(card('label')).hasAttribute('checked')).toBe(true))
  emit(surfaceSwitchOf(card('label')), 'mdsInputSwitchChange', { name: '', checked: undefined, value: '' })
  await vi.waitFor(() => expect(studio.config.value.groups?.label).toBeUndefined())
  // status is on and locked, saying why; the references of variant have no switch
  const status = surfaceSwitchOf(card('status'))
  expect(status.hasAttribute('checked')).toBe(true)
  expect(status.hasAttribute('disabled')).toBe(true)
  expect(card('status').textContent).toContain('Always on for the status colours')
  expect(card('variant').querySelector('[data-surface-switch]')).toBeNull()
})
