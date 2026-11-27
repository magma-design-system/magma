import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { h, render } from 'preact'
import { effect } from '@preact/signals'
import { within } from '@testing-library/preact'

import type { MagmaConfig } from '@maggioli-design-system/design-tokens/src/lib/color.mjs'
import { ColoursPage } from './colours.js'
import type { ConfigAction } from '../../app/config-menu.js'
import { nearestColorName } from '../../engine/color-names.js'
import { updateConfig, type StudioState } from '../../state/studio.js'
import { selectFamily } from '../../state/palette.js'
import { ConfigMenu, inStudio, startStudio } from '../../../test/studio.mjs'

// The stage Colours in Magma (#1403, the Palette until then): the list of the families, the
// editor of the one selected, its menu, the settings of the whole preset and the dialog of a new
// colour react to the controls of Magma. jsdom does not upgrade the components: the test dispatches the events they emit, with
// their detail, and reads the configuration of the state of the studio, each one it takes.

const root = document.createElement('div')
document.body.append(root)

let configs: MagmaConfig[] = []
// the actions of the Config menu of the bar, as the bar draws them
let actions: ConfigAction[] = []
// the state of the studio the page is drawn in, and what stops following its configuration
let studio: StudioState
let stopFollowing: () => void = () => undefined
const latest = (): MagmaConfig => configs[configs.length - 1]
const color = (name: string) => latest().colors.find((one) => one.name === name)

beforeEach(async () => {
  // not served by a command: the page starts from the configuration it bundles
  vi.stubGlobal('fetch', () => Promise.reject(new Error('no server')))
  localStorage.clear()
  configs = []
  actions = []
  studio = startStudio()
  // every configuration the state takes, in order
  stopFollowing = effect(() => {
    configs.push(studio.config.value)
  })
  render(
    inStudio(studio, h(ColoursPage, {}), h(ConfigMenu, { take: (handed: ConfigAction[]) => (actions = handed) })),
    root,
  )
  await vi.waitFor(() => expect(heading()).toBe('tone.neutral'))
  expect(actions.length).toBeGreaterThan(0)
})

afterEach(() => {
  render(null, root)
  stopFollowing()
  studio.dispose()
  localStorage.clear()
  vi.unstubAllGlobals()
})

const emit = (el: Element, type: string, detail?: unknown) =>
  el.dispatchEvent(new CustomEvent(type, { detail, bubbles: true }))

const heading = () => root.querySelector('#palette-color-title')?.textContent?.trim()

/** The list of the families: the complementary region of the page named so. */
const list = () => within(root).getByRole('complementary', { name: 'The families of the preset' })
/** The button that folds the list where it stands above the page: the one that controls it. */
const toggle = () => root.querySelector<HTMLElement>('mds-button[aria-controls="colours-list"]')
/** The settings of the family shown: the region its title names. */
const colorSection = () => within(root).getByRole('region', { name: heading() })
/** The settings of the whole configuration: the details of Magma titled Global settings. */
const globalSettings = () =>
  [...root.querySelectorAll('mds-details')].find(
    (details) => details.querySelector('mds-text[slot="title"]')?.textContent?.trim() === 'Global settings',
  )!
/** A group of fields of the form in the scope, by its name: the legend of a fieldset. */
const fieldGroup = (scope: Element, name: string) =>
  within(scope as HTMLElement).getByRole('group', { name })
/** The hue shifting of the family shown, a group of its settings. */
const familyHueShift = () => fieldGroup(colorSection(), 'Hue shifting')
/** The note of a reference: the info banner in the settings of the family shown. */
const referenceNote = () => colorSection().querySelector('mds-banner[variant="info"]')!
/** The head of the page: the header that holds its title, the h1. */
const pageHead = () => root.querySelector('mds-text[tag="h1"]')?.closest('header')

// an edit of the whole configuration (the global settings) solves every family and the gate of
// every theme before the configuration reaches the shell: a loaded CI runner takes seconds where
// a laptop takes half of one (scales.test.mts and start.test.mts wait as long)
const SLOW = { timeout: 10_000 }

/** The field of Magma labelled so, inside the scope. */
function field (label: string, scope: ParentNode = root): Element {
  const found = [...scope.querySelectorAll('mds-input-field')].find(
    (one) => one.getAttribute('label') === label,
  )
  if (!found) throw new Error(`no field ${label}`)
  return found
}

/** The button of a family in the list, by its name in the group. */
function item (name: string): HTMLElement {
  const found = list().querySelector<HTMLElement>(`mds-button[label="${name}"]`)
  if (!found) throw new Error(`no family ${name} in the list`)
  return found
}

const magmaButton = (label: string, scope: ParentNode = root) =>
  scope.querySelector<HTMLElement>(`mds-button[label="${label}"]`)

const switchLabelled = (label: string, scope: ParentNode) =>
  [...scope.querySelectorAll('mds-input-switch')].find((one) => one.textContent?.trim() === label)!

test('the list marks the family shown and opens another one', async () => {
  // the variants first, at the top of the list: the first heading of its groups
  expect(list().querySelector('mds-text[tag="h2"]')?.textContent?.trim()).toBe('variant')
  // a family is a button of Magma, its swatch the icon
  expect(item('neutral').getAttribute('icon')).toBe('mdi/circle')
  expect(item('neutral').getAttribute('tone')).toBe('weak')
  expect(item('neutral').getAttribute('aria-current')).toBe('true')
  expect(item('info').getAttribute('tone')).toBe('text')
  expect(item('info').hasAttribute('aria-current')).toBe(false)
  // the references carry their badge, on the end of their row
  expect(item('primary').parentElement?.querySelector('mds-badge')?.getAttribute('label')).toBe(
    'ref',
  )

  item('info').click()
  await vi.waitFor(() => expect(heading()).toBe('status.info'))
  expect(item('info').getAttribute('aria-current')).toBe('true')
  expect(item('neutral').hasAttribute('aria-current')).toBe(false)
})

test('where the list stands above the page, its bar names the family shown and folds the list', async () => {
  // the bar is drawn only where the list stands above the page, and the list unfolds under it
  // (the classes of colours.tsx, measured in a real browser by site.test.mts): here the state the sheet follows,
  // which the button that controls the list declares with aria-expanded
  const bar = toggle()!
  const open = () => bar.getAttribute('aria-expanded')
  expect(bar.getAttribute('label')).toBe('tone.neutral')
  expect(bar.getAttribute('aria-controls')).toBe(list().id)
  expect(open()).toBe('false')
  expect(bar.getAttribute('icon')).toBe('mi/baseline/expand-more')

  bar.click()
  await vi.waitFor(() => expect(open()).toBe('true'))
  expect(bar.getAttribute('icon')).toBe('mi/baseline/expand-less')

  // choosing a family shows it and folds the list again
  item('info').click()
  await vi.waitFor(() => expect(heading()).toBe('status.info'))
  expect(bar.getAttribute('label')).toBe('status.info')
  expect(open()).toBe('false')

  // the bar alone folds it too, the family unchanged
  bar.click()
  await vi.waitFor(() => expect(open()).toBe('true'))
  bar.click()
  await vi.waitFor(() => expect(open()).toBe('false'))
  expect(heading()).toBe('status.info')
})

test('a name is handed over when the person leaves the field or presses Enter, not at every key', async () => {
  const name = field('Name').querySelector('mds-input')!
  // the person types in the field, which has the focus
  emit(name, 'mdsInputFocus')
  emit(name, 'mdsInputChange', { value: 'tone.kaolin' })
  // halfway the name meets another family: nothing is renamed, nothing else gets selected
  await new Promise((resolve) => setTimeout(resolve, 50))
  expect(heading()).toBe('tone.neutral')
  expect(color('tone.neutral')).toBeDefined()

  emit(name, 'mdsInputChange', { value: 'tone.grey' })
  emit(name, 'mdsInputBlur')
  await vi.waitFor(() => expect(heading()).toBe('tone.grey'))
  await vi.waitFor(() => expect(color('tone.grey')).toBeDefined())
  expect(color('tone.neutral')).toBeUndefined()
  expect(item('grey').getAttribute('aria-current')).toBe('true')

  const renamed = field('Name').querySelector('mds-input')!
  emit(renamed, 'mdsInputFocus')
  emit(renamed, 'mdsInputChange', { value: 'tone.gray' })
  emit(renamed, 'mdsInputKeydown', new KeyboardEvent('keydown', { key: 'Enter' }))
  await vi.waitFor(() => expect(color('tone.gray')).toBeDefined())
  expect(heading()).toBe('tone.gray')
})

test('the formula and the export groups of the colour follow their fields', async () => {
  const formula = field('Formula').querySelector('mds-input-select')!
  emit(formula, 'mdsInputSelectChange', { value: 'wcag2', values: ['wcag2'] })
  await vi.waitFor(() => expect(color('tone.neutral')?.formula).toBe('wcag2'))
  emit(formula, 'mdsInputSelectChange', { value: '', values: [] })
  await vi.waitFor(() => expect(color('tone.neutral')).not.toHaveProperty('formula'))

  const exportGroups = field('Export groups').querySelector('mds-input')!
  emit(exportGroups, 'mdsInputFocus')
  emit(exportGroups, 'mdsInputChange', { value: 'tones,brand, ' })
  emit(exportGroups, 'mdsInputBlur')
  await vi.waitFor(() => expect(color('tone.neutral')?.export).toEqual(['tones', 'brand']))
  // the field shows the groups as the configuration writes them
  await vi.waitFor(() =>
    expect(field('Export groups').querySelector('mds-input')!.getAttribute('value')).toBe(
      'tones, brand',
    ),
  )
})

test('the base colour follows its colour field, which hands back colours only', async () => {
  const base = field('Base color').querySelector('mds-input')!
  expect(base.getAttribute('type')).toBe('color')
  expect(base.hasAttribute('required')).toBe(true)
  const before = color('tone.neutral')!.color
  const handed = configs.length

  // the field holds '' while its text names no colour: the family keeps its colour
  emit(base, 'mdsInputChange', { value: '' })
  // the echo of the colour the page set, as the field writes it: no change of the person
  emit(base, 'mdsInputChange', { value: before.toLowerCase() })
  await new Promise((resolve) => setTimeout(resolve, 0))
  expect(configs.length).toBe(handed)

  emit(base, 'mdsInputChange', { value: '#123456' })
  await vi.waitFor(() => expect(color('tone.neutral')?.color).toBe('#123456'))
  await vi.waitFor(() => expect(base.getAttribute('value')).toBe('#123456'))
})

test('Smooth switches the colour, and the one of the global settings the configuration', async () => {
  emit(switchLabelled('Smooth', colorSection()), 'mdsInputSwitchChange', {
    name: '',
    checked: true,
    value: '',
  })
  await vi.waitFor(() => expect(color('tone.neutral')?.smooth).toBe(true))
  expect(latest().smooth).toBeFalsy()

  // the global settings start closed: the page opens on the family, not on the settings of all;
  // their hue shifting says it is the global one, apart from the one of the family
  expect(globalSettings().hasAttribute('opened')).toBe(false)
  // apart from the settings of the family, after them
  expect(colorSection().compareDocumentPosition(globalSettings()) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  // a group of fields each, named by its legend
  expect(fieldGroup(globalSettings(), 'Global hue shifting').querySelector('legend')).not.toBeNull()
  expect(fieldGroup(colorSection(), 'Hue shifting').querySelector('legend')).not.toBeNull()
  expect(within(colorSection()).queryByRole('group', { name: 'Global hue shifting' })).toBeNull()

  emit(switchLabelled('Smooth', globalSettings()), 'mdsInputSwitchChange', {
    name: '',
    checked: true,
    value: '',
  })
  await vi.waitFor(() => expect(latest().smooth).toBe(true), SLOW)
}, 30_000)

test('a custom hue shift shows its sliders and writes what they give', async () => {
  const group = familyHueShift()
  expect(group.querySelectorAll('mds-input-range')).toHaveLength(0)
  emit(field('Mode', group).querySelector('mds-input-select')!, 'mdsInputSelectChange', {
    value: 'custom',
    values: ['custom'],
  })
  // the ends start mirrored, the default link
  await vi.waitFor(() =>
    expect(color('tone.neutral')?.hueShift).toEqual({ dark: -18, light: 18, curve: 'smooth' }),
  )
  await vi.waitFor(() => expect(group.querySelectorAll('mds-input-range')).toHaveLength(2))
  // and the intensity of the shift per step, drawn
  expect(within(group).queryByRole('img', { name: 'Shift intensity per step (10-step scale)' })).not.toBeNull()

  emit(field('Dark (degrees)', group).querySelector('mds-input-range')!, 'mdsInputRangeChange', -30)
  await vi.waitFor(() => expect(color('tone.neutral')?.hueShift?.dark).toBe(-30))
})

test('a hue shift of its own over a global one shows hs+, an inherited one hs', async () => {
  const badge = (name: string) => item(name).parentElement?.querySelector('mds-badge')?.getAttribute('label')
  const custom = (scope: Element) =>
    emit(field('Mode', scope).querySelector('mds-input-select')!, 'mdsInputSelectChange', {
      value: 'custom',
      values: ['custom'],
    })

  // the global hue shift: every family inherits it
  custom(globalSettings())
  await vi.waitFor(() => expect(latest().hueShift).toBeDefined())
  await vi.waitFor(() => expect(badge('info')).toBe('hs'))

  // a hue shift of its own on top of it
  custom(familyHueShift())
  await vi.waitFor(() => expect(badge('neutral')).toBe('hs+'))
  expect(item('neutral').getAttribute('title')).toBe('hue shifting of its own, over the global one')
  expect(badge('info')).toBe('hs')
})

test('a custom curve starts with no dead zone and a linear ramp, and offers every easing', async () => {
  const group = familyHueShift()
  emit(field('Mode', group).querySelector('mds-input-select')!, 'mdsInputSelectChange', {
    value: 'custom',
    values: ['custom'],
  })
  await vi.waitFor(() => expect(group.querySelectorAll('mds-input-range')).toHaveLength(2))
  emit(field('Curve', group).querySelector('mds-input-select')!, 'mdsInputSelectChange', {
    value: 'custom',
    values: ['custom'],
  })
  await vi.waitFor(() =>
    expect(color('tone.neutral')?.hueShift?.curve).toEqual({ deadZone: 0, easing: 'linear' }),
  )
  await vi.waitFor(() => expect(() => field('Easing', group)).not.toThrow())
  const easings = [...field('Easing', group).querySelectorAll('option')].map((one) => one.value)
  expect(easings).toEqual(expect.arrayContaining(['linear', 'quad-in', 'sine-in-out', 'step']))

  emit(field('Easing', group).querySelector('mds-input-select')!, 'mdsInputSelectChange', {
    value: 'cubic-out',
    values: ['cubic-out'],
  })
  await vi.waitFor(() =>
    expect(color('tone.neutral')?.hueShift?.curve).toEqual({ deadZone: 0, easing: 'cubic-out' }),
  )
})

test('the ends of a custom hue shift move on their own, mirrored or linked', async () => {
  const group = familyHueShift()
  emit(field('Mode', group).querySelector('mds-input-select')!, 'mdsInputSelectChange', {
    value: 'custom',
    values: ['custom'],
  })
  await vi.waitFor(() => expect(group.querySelectorAll('mds-input-range')).toHaveLength(2))
  // the link sits in the head of the box of the two ends, named Ends
  const link = () =>
    within(group).getByRole('group', { name: 'The two ends' }).querySelector('mds-input-select[aria-label="Ends"]')!
  const ends = (value: string) =>
    emit(link(), 'mdsInputSelectChange', {
      value,
      values: [value],
    })
  const move = (label: string, value: number) =>
    emit(field(label, group).querySelector('mds-input-range')!, 'mdsInputRangeChange', value)
  const shift = () => color('tone.neutral')?.hueShift

  // mirror, the link a hue shift starts from: the light end follows the dark one, opposite
  await vi.waitFor(() => expect(shift()).toMatchObject({ dark: -18, light: 18 }))
  expect(link().getAttribute('value')).toBe('mirror')
  move('Dark (degrees)', 44)
  await vi.waitFor(() => expect(shift()).toMatchObject({ dark: 44, light: -44 }))

  // linked: the two ends go the same way, whichever moves
  ends('linked')
  await vi.waitFor(() => expect(shift()).toMatchObject({ dark: 44, light: 44 }))
  move('Light (degrees)', 12)
  await vi.waitFor(() => expect(shift()).toMatchObject({ dark: 12, light: 12 }))

  // free: an end moves alone, once the field says so (the ends themselves do not change)
  ends('free')
  await vi.waitFor(() => expect(link().getAttribute('value')).toBe('free'))
  move('Dark (degrees)', -5)
  await vi.waitFor(() => expect(shift()).toMatchObject({ dark: -5, light: 12 }))
})

// the saturation curve (#1439): the group under the hue shifting of the family, and in the global
// settings; it starts flat, its ends linked
const saturationGroup = () => root.querySelector('#palette-saturation')!
const chooseMode = (scope: Element, value: string) =>
  emit(field('Mode', scope).querySelector('mds-input-select')!, 'mdsInputSelectChange', {
    value,
    values: [value],
  })

test('a custom saturation curve starts flat, its ends linked, and writes what they give', async () => {
  const group = saturationGroup()
  expect(group.querySelector('legend')?.textContent?.trim()).toBe('Saturation')
  expect(group.querySelectorAll('mds-input-range')).toHaveLength(0)
  chooseMode(group, 'custom')
  // flat: both ends at 0, the scale as the engine makes it
  await vi.waitFor(() =>
    expect(color('tone.neutral')?.saturation).toEqual({ dark: 0, light: 0, curve: 'smooth' }),
  )
  await vi.waitFor(() => expect(group.querySelectorAll('mds-input-range')).toHaveLength(2))
  expect(
    group.querySelector('mds-input-select[aria-label="Ends"]')?.getAttribute('value'),
  ).toBe('linked')
  // the named curves of the engine, uniform among them, then a custom one
  const curves = [...field('Curve', group).querySelectorAll('option')].map((one) => one.value)
  expect(curves).toEqual(['smooth', 'hard', 'uniform', 'custom'])
  // the change of each step: ten bars, none drawn while the curve is flat
  expect(group.querySelectorAll('.palette-amount')).toHaveLength(10)
  expect(group.querySelectorAll('.palette-amount-fill')).toHaveLength(0)

  emit(field('Dark (%)', group).querySelector('mds-input-range')!, 'mdsInputRangeChange', 40)
  // linked: the light end follows the dark one
  await vi.waitFor(() => expect(color('tone.neutral')?.saturation).toMatchObject({ dark: 40, light: 40 }))
  await vi.waitFor(() => expect(group.querySelectorAll('.palette-amount-fill')).toHaveLength(10))
  // the saturation of each step of the ramp in view, before the curve and with it
  await vi.waitFor(() => expect(group.querySelectorAll('.palette-saturation-step')).toHaveLength(10))

  // Off takes the family out of a global curve: the two ends at 0 and no curve, read back as off
  chooseMode(group, 'off')
  await vi.waitFor(() => expect(color('tone.neutral')?.saturation).toEqual({ dark: 0, light: 0 }))
  await vi.waitFor(() =>
    expect(field('Mode', group).querySelector('mds-input-select')?.getAttribute('value')).toBe('off'),
  )
})

test('a global saturation curve marks the families with sat, one of their own over it with sat+', async () => {
  const badge = (name: string) => item(name).parentElement?.querySelector('mds-badge')?.getAttribute('label')
  const global = root.querySelector('#palette-global-saturation')!
  expect(global.querySelector('legend')?.textContent?.trim()).toBe('Global saturation')
  chooseMode(global, 'custom')
  await vi.waitFor(
    () => expect(latest().saturation).toEqual({ dark: 0, light: 0, curve: 'smooth' }),
    SLOW,
  )
  // a flat curve changes no step, and no family says it has one
  expect(badge('info')).toBeUndefined()
  await vi.waitFor(() => expect(global.querySelectorAll('mds-input-range')).toHaveLength(2))
  emit(field('Light (%)', global).querySelector('mds-input-range')!, 'mdsInputRangeChange', 50)
  await vi.waitFor(() => expect(latest().saturation).toMatchObject({ dark: 50, light: 50 }), SLOW)
  await vi.waitFor(() => expect(badge('info')).toBe('sat'), SLOW)

  // a curve of its own on top of it
  chooseMode(saturationGroup(), 'custom')
  await vi.waitFor(() => expect(saturationGroup().querySelectorAll('mds-input-range')).toHaveLength(2))
  emit(field('Dark (%)', saturationGroup()).querySelector('mds-input-range')!, 'mdsInputRangeChange', -30)
  await vi.waitFor(() => expect(badge('neutral')).toBe('sat+'))
  expect(item('neutral').getAttribute('title')).toBe('saturation curve of its own, over the global one')
  expect(badge('info')).toBe('sat')
}, 30_000)

// the message of the Colorspace field of a family says how its colorspace holds its seed (#1454)
test('the Colorspace field says how the ramp holds the seed, and names a better colorspace', async () => {
  const colorspace = () => field('Colorspace', colorSection())
  // neutral, the family the page opens on, is grey: nothing to lose (graded after the render)
  await vi.waitFor(() => expect(colorspace().getAttribute('variant')).toBe('success'))
  expect(colorspace().getAttribute('message')).toBe('A grey seed: the ramp has no hue nor saturation to lose')
  // the colorspaces the engine cannot build are not offered
  const spaces = [...colorspace().querySelectorAll('option')].map((one) => one.value)
  expect(spaces).toEqual(['', 'HSL', 'OKLCH', 'LCH', 'LAB', 'OKLAB', 'RGB', 'HSV'])
  // each option carries the mark of its grade, the inherited one names its colorspace
  const label = (value: string) =>
    [...colorspace().querySelectorAll('option')].find((one) => one.value === value)!.textContent
  expect(label('')).toBe('\u2705\u2002inherit (HSL)')

  item('yellow').click()
  await vi.waitFor(() => expect(heading()).toBe('label.yellow'))
  // HSL, inherited, holds yellow
  await vi.waitFor(() => expect(colorspace().getAttribute('variant')).toBe('success'))
  expect(colorspace().getAttribute('message')).toMatch(/^The ramp holds the seed: the hue turns \d+ degrees at most/)

  // OKLCH turns its dark steps toward orange
  emit(colorspace().querySelector('mds-input-select')!, 'mdsInputSelectChange', {
    value: 'OKLCH',
    values: ['OKLCH'],
  })
  await vi.waitFor(() => expect(color('label.yellow')?.colorspace).toBe('OKLCH'))
  await vi.waitFor(() => expect(colorspace().getAttribute('variant')).toBe('error'))
  // the options say it before the choice: OKLCH fails on yellow, HSL holds it
  expect(label('OKLCH')).toBe('\u26d4\u2002OKLCH')
  expect(label('HSL')).toBe('\u2705\u2002HSL')
  const lines = colorspace().getAttribute('message')!.split(';')
  expect(lines[0]).toMatch(/^The hue turns \d+ degrees in the dark steps$/)
  expect(lines.at(-1)).toMatch(/^\w+ holds this colour better$/)
})

test('a reference says at the top what its source sets, and Edit opens the source', async () => {
  // jsdom lays nothing out: the title comes into view in a browser only
  Element.prototype.scrollIntoView = vi.fn()
  item('primary').click()
  await vi.waitFor(() => expect(heading()).toBe('variant.primary'))
  const source = color('variant.primary')!.alias!
  // the banner heads the settings of the reference, before its fields, and names Smooth too
  const note = referenceNote()
  expect(note.textContent).toContain(`variant.primary is a reference to ${source}`)
  expect(note.textContent).toContain('"Smooth"')
  expect(note.compareDocumentPosition(field('Name')) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  // a reference has no Smooth, no hue shifting and no saturation of its own
  expect(within(colorSection()).queryAllByRole('group')).toHaveLength(0)

  magmaButton(`Edit ${source}`, note)!.click()
  await vi.waitFor(() => expect(heading()).toBe(source))
  await vi.waitFor(() =>
    expect(document.activeElement).toBe(root.querySelector('#palette-color-title')),
  )
})

// the request to open the source is for the source family: the effects of the render before it,
// still pending when the person clicks (a slow machine, a quick hand), run at the start of the
// next render and must leave it for the render of the source (seen in CI on #1326)
test('the source opens with the focus on its title even while the effects of the reference are pending', async () => {
  Element.prototype.scrollIntoView = vi.fn()
  item('primary').click()
  // the render runs in a microtask, its effects after the paint, in a task: stop between the two
  await Promise.resolve()
  await Promise.resolve()
  expect(heading()).toBe('variant.primary')
  const source = color('variant.primary')!.alias!
  magmaButton(`Edit ${source}`, referenceNote())!.click()
  await vi.waitFor(() => expect(heading()).toBe(source))
  await vi.waitFor(() =>
    expect(document.activeElement).toBe(root.querySelector('#palette-color-title')),
  )
})

test('a built-in reference changes its target, and keeps its name and its place', async () => {
  item('primary').click()
  await vi.waitFor(() => expect(heading()).toBe('variant.primary'))

  const name = field('Name')
  expect(name.querySelector('mds-input')!.hasAttribute('disabled')).toBe(true)
  expect(name.getAttribute('message')).toBe('Built-in variant: it cannot be renamed')
  expect(magmaButton('Delete color')!.hasAttribute('disabled')).toBe(true)

  emit(field('Reference').querySelector('mds-input-select')!, 'mdsInputSelectChange', {
    value: 'tone.neutral',
    values: ['tone.neutral'],
  })
  await vi.waitFor(() => expect(color('variant.primary')?.alias).toBe('tone.neutral'))
  expect(color('variant.primary')).not.toHaveProperty('color')
})

test('the menu of the colour duplicates it and deletes it', async () => {
  // the destructive action stands last in the menu, after a separator
  const menu = root.querySelector('mds-dropdown[target="#palette-color-actions"]')!
  expect([...menu.querySelectorAll('mds-button, mds-separator')].map(
    (one) => one.getAttribute('label') ?? one.tagName.toLowerCase(),
  )).toEqual(['Duplicate', 'mds-separator', 'Delete color'])

  magmaButton('Duplicate')!.click()
  await vi.waitFor(() => expect(heading()).toBe('tone.neutral-copy'))
  await vi.waitFor(() => expect(color('tone.neutral-copy')?.color).toBe(color('tone.neutral')?.color))

  magmaButton('Delete color')!.click()
  await vi.waitFor(() => expect(color('tone.neutral-copy')).toBeUndefined())
  expect(heading()).toBe('tone.porcelain')
})

test('a new colour is named after the colour picked until the person types a name', async () => {
  magmaButton('Add color', list())!.click()
  const modal = await vi.waitFor(() => {
    const found = root.querySelector('mds-modal')
    if (!found) throw new Error('no dialog yet')
    return found
  })
  expect(modal.getAttribute('aria-label')).toBe('New color')
  const nameOf = () => field('Name', modal).querySelector('mds-input')!.getAttribute('value')
  expect(nameOf()).toBe(nearestColorName('#4f8fd9'))

  // the colour field of Magma (#1260): a code typed or a colour picked with its button
  const colorField = () => field('Color', modal).querySelector('mds-input[type="color"]')!
  const pick = async (hex: string) => {
    emit(colorField(), 'mdsInputChange', { value: hex })
    await vi.waitFor(() => expect(colorField().getAttribute('value')).toBe(hex))
  }
  await pick('#ff0000')
  expect(nameOf()).toBe(nearestColorName('#ff0000'))
  // a text that names no colour leaves the colour, and the name, as they were
  emit(colorField(), 'mdsInputChange', { value: '' })
  await new Promise((resolve) => setTimeout(resolve, 0))
  expect(colorField().getAttribute('value')).toBe('#ff0000')
  expect(nameOf()).toBe(nearestColorName('#ff0000'))
  // the echo of the name the studio set is not a name the person typed
  emit(field('Name', modal).querySelector('mds-input')!, 'mdsInputChange', { value: nameOf() })
  await pick('#00ff00')
  expect(nameOf()).toBe(nearestColorName('#00ff00'))

  emit(field('Name', modal).querySelector('mds-input')!, 'mdsInputChange', { value: 'grass' })
  await vi.waitFor(() => expect(nameOf()).toBe('grass'))
  await pick('#0000ff')
  expect(nameOf()).toBe('grass')

  magmaButton('Add color', modal)!.click()
  await vi.waitFor(() => expect(color('label.grass')).toEqual({ name: 'label.grass', color: '#0000ff' }))
  expect(root.querySelector('mds-modal')).toBeNull()
  expect(heading()).toBe('label.grass')
})

test('choosing a reference in the dialog makes a reference in the variant group', async () => {
  magmaButton('Add color', list())!.click()
  const modal = await vi.waitFor(() => {
    const found = root.querySelector('mds-modal')
    if (!found) throw new Error('no dialog yet')
    return found
  })
  emit(modal.querySelector('mds-input-switch[value="alias"]')!, 'mdsInputSwitchChange', {
    name: 'palette-new-kind',
    checked: true,
    value: 'alias',
  })
  await vi.waitFor(() => expect(modal.getAttribute('aria-label')).toBe('New reference'))
  expect(modal.querySelector('mds-banner')!.getAttribute('headline')).toBe('New reference')
  expect(modal.querySelector('mds-input[type="color"]')).toBeNull()
  const group = field('Group', modal).querySelector('mds-input-select')!
  expect(group.getAttribute('value')).toBe('variant')
  expect(group.hasAttribute('disabled')).toBe(true)
  // the first family with a colour of its own, and the name follows it
  expect(field('References', modal).querySelector('mds-input-select')!.getAttribute('value')).toBe(
    'tone.porcelain',
  )
  expect(field('Name', modal).querySelector('mds-input')!.getAttribute('value')).toBe('porcelain')

  emit(field('References', modal).querySelector('mds-input-select')!, 'mdsInputSelectChange', {
    value: 'label.sky',
    values: ['label.sky'],
  })
  await vi.waitFor(() =>
    expect(field('Name', modal).querySelector('mds-input')!.getAttribute('value')).toBe('sky'),
  )

  magmaButton('Add reference', modal)!.click()
  await vi.waitFor(() =>
    expect(color('variant.sky')).toEqual({ name: 'variant.sky', alias: 'label.sky' }),
  )
  expect(heading()).toBe('variant.sky')
})

test('the head of the view is its title and the verdict of the check; the exit takes the preset out', async () => {
  // no action of its own: the exit of the bar takes the preset out, the opening brings one in
  // (vittorio, 2026-11-27: Save and Reset went with the Palette)
  const head = pageHead()!
  expect(head.querySelector('mds-text[tag="h1"]')?.textContent).toBe('Colors')
  expect(head.querySelector('mds-badge')).not.toBeNull()
  expect(head.querySelectorAll('mds-button, mds-button-dropdown')).toHaveLength(0)

  // the actions, in their order, each with the format it reads or hands over
  expect(actions.map(({ label, format }) => [label, format])).toEqual([
    ['Download the preset', 'json'],
    ['Download all tokens', 'misc'],
    ['Download Figma tokens', 'DTCG'],
    ['Download CSS tokens', 'css'],
    ['Download GIMP palette', 'gpl'],
    ['Copy JSON', undefined],
  ])

  // each download hands over the file it says
  const files: string[] = []
  vi.stubGlobal('URL', Object.assign(Object.create(URL), {
    createObjectURL: () => 'blob:tokens',
    revokeObjectURL: () => undefined,
  }))
  const click = vi
    .spyOn(HTMLAnchorElement.prototype, 'click')
    .mockImplementation(function (this: HTMLAnchorElement) {
      files.push(this.download)
    })
  try {
    for (const id of ['zip', 'config', 'figma']) actions.find((one) => one.id === id)!.run()
    await vi.waitFor(() =>
      expect(files).toEqual([
        'magma-design-tokens.zip',
        'magma-design-tokensrc.json',
        'magma-figma-dtcg.zip',
      ]),
    )
  } finally {
    click.mockRestore()
  }
  // what brings a preset in is the opening's (#1402)
  expect(actions.find((one) => one.id === 'import')).toBeUndefined()
})

// ---- #1403: what the view adds to the Palette it replaces ----

/** The families of a group in the list, in the order shown. */
const namesIn = (group: string) => {
  const heading = [...list().querySelectorAll('mds-text[tag="h2"]')].find(
    (one) => one.textContent?.trim() === group,
  )!
  return [...heading.closest('div')!.parentElement!.querySelectorAll('li mds-button')].map((one) =>
    one.getAttribute('label'),
  )
}

/** The line under a field that says where its value comes from, if any. */
const inherits = (label: string) =>
  field(label, colorSection()).parentElement?.querySelector('[data-inherits]')

/** The dialog of a new colour, once open. */
const dialog = () =>
  vi.waitFor(() => {
    const found = root.querySelector('mds-modal')
    if (!found) throw new Error('no dialog yet')
    return found
  })

test('the families stand in chromatic order inside their groups, the variants first', () => {
  expect(namesIn('label')).toEqual([
    'amaranth', 'red', 'orange', 'yellow', 'lime', 'green', 'aqua', 'sky', 'blue', 'violet', 'purple', 'orchid',
  ])
  expect(namesIn('tone')).toEqual(['porcelain', 'kaolin', 'neutral', 'bisque', 'fireclay'])
  expect(namesIn('status')).toEqual(['error', 'warning', 'success', 'info'])
  // each group leads to its place in Groups, named after it
  const link = list().querySelector('mds-button[aria-label="The group tone, in Groups"]')!
  expect(link.getAttribute('href')).toBe('#/colors/groups')
})

test('a value the family does not set says from whom it comes, with a link to where it is decided', async () => {
  expect(inherits('Contrast scale')?.textContent).toBe('Inherits from the group tone')
  expect(inherits('Contrast scale')?.querySelector('mds-link')?.getAttribute('href')).toBe('#/colors/groups')
  expect(inherits('Formula')?.textContent).toBe('Inherits from the preset')
  expect(inherits('Colorspace')?.textContent).toBe('Inherits from the preset')
  // its own export groups come from nowhere else
  expect(inherits('Export groups')).toBeNull()
  // set on the family, the value is its own: no line
  emit(field('Formula', colorSection()).querySelector('mds-input-select')!, 'mdsInputSelectChange', {
    value: 'wcag2',
    values: ['wcag2'],
  })
  await vi.waitFor(() => expect(inherits('Formula')).toBeNull())
})

test('the scale of the family says whether it holds the roles of Magma, and leads to its page', async () => {
  const row = () => inherits('Contrast scale')?.parentElement
  expect(row()?.querySelector('mds-badge')?.getAttribute('label')).toBe('Compatible with Magma')
  expect(row()?.querySelector('mds-link[label="Open the scale tone"]')?.getAttribute('href')).toBe(
    '#/colors/contrast-scales',
  )
})

test('a family that paints Magma is offered the compatible scales alone; one outside Magma all of them', async () => {
  // a scale of twelve steps, for a game
  updateConfig(studio, (draft) => {
    draft.ratios = { wcag3: { game: [1.1, 1.3, 1.6, 2, 2.6, 3.4, 4.5, 6, 8, 10.5, 13.5, 17] } } as never
  })
  const offered = () =>
    [...field('Contrast scale', colorSection()).querySelectorAll('option')].map((one) => one.textContent)
  // label.red paints the variant red: no game for it
  selectFamily(studio, 'label.red')
  await vi.waitFor(() => expect(heading()).toBe('label.red'))
  await vi.waitFor(() => expect(offered().some((one) => one?.startsWith('game'))).toBe(false))
  // brand.rnd paints nothing of Magma: a case outside Magma, the game scale offered and said so
  selectFamily(studio, 'brand.rnd')
  await vi.waitFor(() => expect(heading()).toBe('brand.rnd'))
  await vi.waitFor(() =>
    expect(offered()).toContain('game (12 steps, for the cases outside Magma)'),
  )
  // a family that paints and stands on it anyway (a preset written before) says why it breaks
  updateConfig(studio, (draft) => {
    draft.colors.find((one) => one.name === 'label.red')!.ratios = 'game'
  })
  selectFamily(studio, 'label.red')
  await vi.waitFor(() => expect(field('Contrast scale', colorSection()).getAttribute('variant')).toBe('error'))
  expect(field('Contrast scale', colorSection()).getAttribute('message')).toMatch(/^The roles of Magma name 10 steps/)
  // its own scale: no line of inheritance, the badge beside the field
  expect(inherits('Contrast scale')).toBeNull()
  expect(field('Contrast scale', colorSection()).parentElement?.querySelector('mds-badge')?.getAttribute('label')).toBe(
    'Not compatible with Magma',
  )
})

test('the head of the family says what it paints, in which themes, with a link to Themes', async () => {
  const paints = () => root.querySelector('[data-paints]')
  await vi.waitFor(() => expect(paints()?.textContent).toBe('Tint of the theme business.'))
  expect(paints()?.querySelector('mds-link')?.getAttribute('href')).toBe('#/colors/themes')
  selectFamily(studio, 'label.red')
  await vi.waitFor(() => expect(paints()?.textContent).toBe('It paints the variant red.'))
  selectFamily(studio, 'brand.rnd')
  await vi.waitFor(() =>
    expect(paints()?.textContent).toBe('It paints nothing of Magma: a case outside Magma, which goes out as tokens alone.'),
  )
})

test('the pairs of the check the family touches, counted with their verdict in a closed detail', async () => {
  const touched = () => root.querySelector('[data-touched]')
  // measured after the render that chose the family
  await vi.waitFor(() => expect(Number(touched()?.getAttribute('data-touched'))).toBeGreaterThan(50), SLOW)
  const details = touched()!
  expect(details.localName).toBe('mds-details')
  expect(details.hasAttribute('opened')).toBe(false)
  expect(details.querySelector('mds-badge')?.getAttribute('variant')).toBe('success')
  expect(details.querySelector('mds-badge')?.getAttribute('label')).toMatch(/^\d+ pairs touched$/)
  expect(details.querySelector('[slot="title"]')?.textContent).toBe('all above their floor, in light and in dark')
  expect(details.querySelectorAll('li').length).toBe(Number(details.getAttribute('data-touched')))
  // a label colour changes no pair of the check
  selectFamily(studio, 'label.red')
  await vi.waitFor(() => expect(touched()?.getAttribute('data-touched')).toBe('0'), SLOW)
  expect(touched()?.textContent).toBe('No pair of the contrast check: it changes none.')
}, 30_000)

test('New group opens the dialog on a group to write, which refuses the names of the engine', async () => {
  magmaButton('New group', list())!.click()
  const modal = await dialog()
  const groupName = () => field('Name of the group', modal)
  const add = () => magmaButton('Add color', modal)!
  // nothing written yet: Add waits, and the field says what is missing
  expect(groupName().getAttribute('message')).toBe('Write the name of the group.')
  expect(add().hasAttribute('disabled')).toBe(true)
  // a group the engine derives
  emit(groupName().querySelector('mds-input')!, 'mdsInputChange', { value: 'surface' })
  await vi.waitFor(() => expect(groupName().getAttribute('variant')).toBe('error'))
  expect(groupName().getAttribute('message')).toMatch(/engine makes a group by this name/)
  expect(add().hasAttribute('disabled')).toBe(true)
  // a name typed as a person types it: normalised
  emit(groupName().querySelector('mds-input')!, 'mdsInputChange', { value: 'Game Board' })
  await vi.waitFor(() => expect(add().hasAttribute('disabled')).toBe(false))
  emit(field('Name', modal).querySelector('mds-input')!, 'mdsInputChange', { value: 'lava' })
  await vi.waitFor(() => expect(modal.querySelector('mds-text[tag="code"]')?.textContent).toBe('game-board.lava'))
  add().click()
  await vi.waitFor(() => expect(color('game-board.lava')).toBeDefined())
  // born with its first family, the new group goes last in the list
  const groups = [...list().querySelectorAll('mds-text[tag="h2"]')].map((one) => one.textContent?.trim())
  expect(groups.at(-1)).toBe('game-board')
  expect(heading()).toBe('game-board.lava')
})
