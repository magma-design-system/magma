import { afterEach, expect, test, vi } from 'vitest'
import { h, render } from 'preact'
import { useState } from 'preact/hooks'
import { act } from 'preact/test-utils'
import { within } from '@testing-library/preact'

import initialConfig from '@maggioli-design-system/design-tokens/.magma-design-tokensrc.json'
import type { MagmaConfig } from '@maggioli-design-system/design-tokens/src/lib/color.mjs'
import { ScalesManager, type RatioSet } from '../src/scales.js'
import { App } from '../src/app.js'
import { LangProvider, type Lang } from '../src/i18n.js'
import { textOf } from './text.mjs'

// The Contrast scales page is written in Magma: its stops, its distribution and its menus are
// mds-* components. jsdom does not upgrade them, so the test dispatches the events they emit and
// reads the attributes Preact writes. A stop or a count of steps is handed back when the person
// commits it (Enter, leaving the field, the arrows of the field), as a native input does, never at
// every key: a stop handed back at every key would be sorted under the caret.

const base = initialConfig as unknown as MagmaConfig
// one color on the tint scale, so that deleting tint asks first
const config: MagmaConfig = {
  ...base,
  colors: base.colors.map((color, index) => (index === 0 ? { ...color, ratios: 'tint' } : color)),
}
const SCALES: RatioSet = {
  default: [8, 16, 23, 34, 45, 66, 74, 84, 92, 100],
  tint: [10, 30, 50, 70, 90],
  'custom-1': [20, 40, 60],
}

const root = document.createElement('div')
document.body.append(root)
afterEach(() => act(() => render(null, root)))

function show (selectedName = config.colors[1].name, lang: Lang = 'en') {
  const spies = {
    onChangeScale: vi.fn(),
    onAddScale: vi.fn(),
    onRenameScale: vi.fn(),
    onDeleteScale: vi.fn(),
    onSelectColor: vi.fn(),
    onFormulaChange: vi.fn(),
  }
  // the page keeps the scales as app.tsx does: the stops written, a copy named custom-N
  function Page () {
    const [ratioSet, setRatioSet] = useState<RatioSet>(SCALES)
    return h(ScalesManager, {
      config,
      formula: 'wcag3',
      ratioSet,
      // the scales as loaded: what Reset takes a scale back to
      loaded: SCALES,
      builtinScales: ['default', 'tint'],
      sampleScales: new Map(),
      selectedName,
      labelFor: (name: string) => name,
      originFor: (name: string) => (name === 'custom-1' ? 'custom' : 'builtin'),
      onSelectColor: spies.onSelectColor,
      onFormulaChange: spies.onFormulaChange,
      onChangeScale: (name: string, values: number[]) => {
        spies.onChangeScale(name, values)
        setRatioSet((set) => ({ ...set, [name]: values }))
      },
      onRenameScale: spies.onRenameScale,
      onAddScale: (from: string) => {
        spies.onAddScale(from)
        setRatioSet((set) => {
          let index = 1
          while (set[`custom-${index}`]) index += 1
          return { ...set, [`custom-${index}`]: [...set[from]] }
        })
      },
      onDeleteScale: spies.onDeleteScale,
    })
  }
  act(() => render(h(LangProvider, { value: lang }, h(Page, {})), root))
  return spies
}

const emit = (element: Element, type: string, detail?: unknown) =>
  act(() => {
    element.dispatchEvent(new CustomEvent(type, { detail, bubbles: true }))
  })

/** The titles of the cards of the page: the h2 in the head of each mds-card. */
const titles = () => [...root.querySelectorAll('mds-card mds-card-header mds-text[tag="h2"]')]
/** The card of a scale, the mds-card its title heads. */
const card = (name: string) =>
  titles()
    .find((title) => title.textContent === name)!
    .closest('mds-card')!
/** The button of the actions of a scale, in the head of its card. */
const more = (name: string) => card(name).querySelector('mds-card-header mds-button[slot="action"]')!
/** The menu of a scale: the dropdown the button of its card opens, outside the card. */
const menu = (name: string) => root.querySelector(`mds-dropdown[target="#${more(name).id}"]`)!
/** The steps of a scale, the group of its stops. */
const steps = (name: string, label = `The steps of ${name}`) =>
  within(card(name) as HTMLElement).getByRole('group', { name: label })
const stops = (name: string) =>
  [...steps(name).querySelectorAll('mds-input')].map((input) => input.getAttribute('value'))
const stop = (name: string, step: number) =>
  card(name).querySelector(`mds-input[aria-label="Step ${step}"]`)!
const menuItem = (name: string, label: string) =>
  [...menu(name).querySelectorAll<HTMLElement>('mds-button')].find(
    (button) => textOf(button) === label,
  )!
/** The select of the distribution of a scale, in its field. */
const distribution = (name: string, label = 'Distribution') =>
  card(name).querySelector(`mds-input-field[label="${label}"] mds-input-select`)!
const click = (element: HTMLElement) => act(() => element.click())

test('a card per scale: its title, its badge, its count, its menu with Delete last', () => {
  show()
  // after the card of the usage, a card per scale, titled by its name in an h2
  expect(titles().map((title) => title.textContent)).toEqual([
    'The colors of a scale, by group',
    ...Object.keys(SCALES),
  ])
  const tint = card('tint')
  expect(tint.querySelector('mds-badge')?.getAttribute('label')).toBe('Built-in')
  expect(card('custom-1').querySelector('mds-badge')).toBeNull()
  expect(tint.textContent).toContain('5 steps, used by 1 color')
  // the menu opens from the button in the head of the card it names, one menu per button
  expect(more('tint').getAttribute('aria-label')).toBe('Actions of the scale tint')
  expect(root.querySelectorAll(`mds-dropdown[target="#${more('tint').id}"]`)).toHaveLength(1)
  // beside the card, outside it: mds-card clips what overflows it
  expect(tint.querySelector('mds-dropdown')).toBeNull()
  expect([...menu('tint').querySelectorAll('mds-button')].map(textOf))
    .toEqual(['Rename', 'Duplicate', 'Delete'])
  expect(menuItem('tint', 'Delete').getAttribute('variant')).toBe('error')
  // the default scale is mandatory, a built-in keeps its name
  expect(menuItem('default', 'Delete').hasAttribute('disabled')).toBe(true)
  expect(menuItem('tint', 'Rename').hasAttribute('disabled')).toBe(true)
  expect(menuItem('custom-1', 'Rename').hasAttribute('disabled')).toBe(false)
})

test('the page speaks the language of the studio', () => {
  show(config.colors[1].name, 'it')
  const tint = card('tint')
  expect(tint.querySelector('mds-badge')?.getAttribute('label')).toBe('Integrata')
  expect(tint.textContent).toContain('5 gradini, usata da 1 colore')
  expect(more('tint').getAttribute('aria-label')).toBe('Azioni della scala tint')
  expect([...menu('tint').querySelectorAll('mds-button')].map(textOf)).toEqual(['Rinomina', 'Duplica', 'Elimina'])
  expect(steps('tint', 'I gradini di tint').querySelector('mds-input[aria-label="Gradino 1"]')).not.toBeNull()
  // the option a distribution starts on, translated; the easings keep their names
  const options = [...distribution('tint', 'Distribuzione').querySelectorAll('option')].map((option) => option.textContent)
  expect(options).toEqual(expect.arrayContaining(['manuale', 'sine-in-out']))
  click(menuItem('tint', 'Elimina'))
  const dialog = root.querySelector('mds-modal')!
  expect(dialog.getAttribute('aria-label')).toBe('Vuoi eliminare la scala tint?')
  expect(dialog.textContent).toContain('usata da 1 colore: se la elimini, passa alla scala "default"')
  expect([...dialog.querySelectorAll('mds-button[slot="action"]')].map(textOf)).toEqual(['Annulla', 'Elimina'])
})

test('a stop typed is written when the person commits it, clamped and in order', () => {
  const spies = show()
  const field = stop('tint', 1)
  // the person types: the field keeps the draft, the scale waits
  emit(field, 'mdsInputFocus')
  emit(field, 'mdsInputChange', { value: '6' })
  emit(field, 'mdsInputChange', { value: '60' })
  expect(spies.onChangeScale).not.toHaveBeenCalled()
  expect(field.getAttribute('value')).toBe('60')
  // Enter commits: the stop moves to its place among the others
  emit(field, 'mdsInputKeydown', new KeyboardEvent('keydown', { key: 'Enter' }))
  expect(spies.onChangeScale).toHaveBeenLastCalledWith('tint', [30, 50, 60, 70, 90])
  expect(stops('tint')).toEqual(['30', '50', '60', '70', '90'])
  // leaving the field commits too, past the end of the axis it stops at the end
  emit(stop('tint', 5), 'mdsInputFocus')
  emit(stop('tint', 5), 'mdsInputChange', { value: '200' })
  emit(stop('tint', 5), 'mdsInputBlur')
  expect(stops('tint')).toEqual(['30', '50', '60', '70', '106'])
})

test('a field left empty keeps its stop', () => {
  const spies = show()
  const field = stop('tint', 2)
  emit(field, 'mdsInputFocus')
  emit(field, 'mdsInputChange', { value: '' })
  emit(field, 'mdsInputBlur')
  expect(spies.onChangeScale).not.toHaveBeenCalled()
  expect(stop('tint', 2).getAttribute('value')).toBe('30')
})

test('the arrows of a stop write it at once, the focus being on the arrows', () => {
  const spies = show()
  emit(stop('custom-1', 2), 'mdsInputChange', { value: '41' })
  expect(spies.onChangeScale).toHaveBeenLastCalledWith('custom-1', [20, 41, 60])
  expect(stops('custom-1')).toEqual(['20', '41', '60'])
})

test('a step is removed and added from its buttons', () => {
  show()
  click(card('custom-1').querySelector<HTMLElement>('mds-button[aria-label="Remove step 2"]')!)
  expect(stops('custom-1')).toEqual(['20', '60'])
  // two steps at least: their remove buttons are off
  expect(card('custom-1').querySelector('mds-button[aria-label="Remove step 1"]')?.hasAttribute('disabled')).toBe(true)
  // Add step closes the group of the steps
  const add = [...steps('custom-1').querySelectorAll<HTMLElement>(':scope > mds-button')].find(
    (button) => textOf(button) === 'Add step',
  )!
  click(add)
  expect(stops('custom-1')).toEqual(['20', '40', '60'])
})

test('choosing an easing regenerates the stops, and its fields regenerate them again', () => {
  const spies = show()
  const select = distribution('custom-1')
  expect(select.getAttribute('value')).toBe('manual')
  expect([...select.querySelectorAll('option')].map((option) => option.value)).toContain('sine-in-out')
  emit(select, 'mdsInputSelectChange', { value: 'linear' })
  expect(spies.onChangeScale).toHaveBeenLastCalledWith('custom-1', [20, 40, 60])
  expect(distribution('custom-1').getAttribute('value')).toBe('linear')
  // the fields of the easing show up, labelled; five steps from 20 to 60
  const steps = card('custom-1').querySelector('mds-input-field[label="Steps"] mds-input')!
  emit(steps, 'mdsInputChange', { value: '5' })
  expect(stops('custom-1')).toEqual(['20', '30', '40', '50', '60'])
  emit(select, 'mdsInputSelectChange', { value: 'quad-in' })
  expect(stops('custom-1')).toEqual(['20', '23', '30', '43', '60'])
  // dragging or typing a stop goes back to manual
  emit(stop('custom-1', 1), 'mdsInputChange', { value: '21' })
  expect(distribution('custom-1').getAttribute('value')).toBe('manual')
  expect(card('custom-1').querySelector('mds-input-field[label="Steps"]')).toBeNull()
})

test('Duplicate in the menu adds a copy of the scale', () => {
  const spies = show()
  click(menuItem('tint', 'Duplicate'))
  expect(spies.onAddScale).toHaveBeenCalledWith('tint')
  expect(stops('custom-2')).toEqual(['10', '30', '50', '70', '90'])
  // Add scale copies the default one
  click(root.querySelector<HTMLElement>('mds-button[label="Add scale"]')!)
  expect(spies.onAddScale).toHaveBeenLastCalledWith('default')
  expect(stops('custom-3')).toEqual(SCALES.default.map(String))
})

test('Delete asks first for a scale some colors use, and deletes at once one nobody uses', () => {
  const spies = show()
  click(menuItem('tint', 'Delete'))
  expect(spies.onDeleteScale).not.toHaveBeenCalled()
  const dialog = root.querySelector('mds-modal')!
  expect(dialog.getAttribute('aria-label')).toBe('Delete the scale tint?')
  expect(dialog.textContent).toContain('used by 1 color')
  const buttons = [...dialog.querySelectorAll<HTMLElement>('mds-button[slot="action"]')]
  // Cancel first, Delete last in the red
  expect(buttons.map(textOf)).toEqual(['Cancel', 'Delete'])
  click(buttons[1])
  expect(spies.onDeleteScale).toHaveBeenCalledWith('tint')
  expect(root.querySelector('mds-modal')).toBeNull()

  click(menuItem('custom-1', 'Delete'))
  expect(spies.onDeleteScale).toHaveBeenLastCalledWith('custom-1')
  expect(root.querySelector('mds-modal')).toBeNull()
})

test('Rename opens a dialog that refuses an empty name or one taken', () => {
  const spies = show()
  click(menuItem('custom-1', 'Rename'))
  const dialog = root.querySelector('mds-modal')!
  const field = dialog.querySelector('mds-input')!
  const rename = () =>
    [...root.querySelectorAll<HTMLElement>('mds-modal mds-button')].find((b) => textOf(b) === 'Rename')!
  // unchanged: nothing to rename yet
  expect(rename().hasAttribute('disabled')).toBe(true)
  emit(field, 'mdsInputChange', { value: 'tint' })
  expect(root.querySelector('mds-modal mds-input-field')?.getAttribute('message')).toBe('A scale named "tint" exists already')
  expect(rename().hasAttribute('disabled')).toBe(true)
  emit(field, 'mdsInputChange', { value: '  brand  ' })
  expect(rename().hasAttribute('disabled')).toBe(false)
  click(rename())
  expect(spies.onRenameScale).toHaveBeenCalledWith('custom-1', 'brand')
  expect(root.querySelector('mds-modal')).toBeNull()
})

test('the usage panel picks a scale and samples its first color', () => {
  const spies = show()
  // the card of the usage: the scale it inspects and the colors on it, by group
  const usage = card('The colors of a scale, by group')
  const select = usage.querySelector('mds-input-field[label="Scale"] mds-input-select')!
  emit(select, 'mdsInputSelectChange', { value: 'tint' })
  expect(spies.onSelectColor).toHaveBeenCalledWith(config.colors[0].name)
  const chips = [...usage.querySelectorAll<HTMLElement>('mds-chip')]
  expect(chips).toHaveLength(1)
  const [chip] = chips
  const [color] = config.colors
  // a selectable chip with the swatch of the colour, and no icon
  expect(chip.getAttribute('label')).toBe(color.name.split('.')[1])
  expect(chip.hasAttribute('selectable')).toBe(true)
  expect(chip.getAttribute('swatch')).toBe(color.color)
  expect(chip.hasAttribute('icon')).toBe(false)
  emit(chip, 'mdsChipSelect', { element: chip, selected: true })
  expect(spies.onSelectColor).toHaveBeenLastCalledWith(color.name)
  // the sample clicked again stays selected, though mds-chip unselects itself
  emit(chip, 'mdsChipSelect', { element: chip, selected: undefined })
  expect((chip as unknown as { selected?: boolean }).selected).toBe(true)
  // the formula is a Magma select too
  emit(root.querySelector('mds-input-field[label="Formula"] mds-input-select')!, 'mdsInputSelectChange', { value: 'wcag2' })
  expect(spies.onFormulaChange).toHaveBeenCalledWith('wcag2')
})

// the states beside each scale (#1308): jsdom loads no page in the frames, the test reads the
// line over the cards and the frames the page writes
const frames = () => [...root.querySelectorAll('iframe')].map((frame) => frame.getAttribute('title'))
/** The toolbar over the cards: the line that says what the states show, and their mode. */
const statesHead = () => within(root).getByRole('toolbar', { name: 'The states beside the scales' })
const statesLine = () => statesHead().querySelector('mds-text')?.textContent

test('beside each scale, the states of the sample colour, in one mode for the page', () => {
  show('status.error')
  expect(statesLine()).toBe(
    'Beside each scale, error solved on it paints the components it paints, in the theme business.',
  )
  expect(frames()).toEqual([
    'The states of status.error on the scale default, light mode',
    'The states of status.error on the scale tint, light mode',
    'The states of status.error on the scale custom-1, light mode',
  ])
  // the states of a scale stand beside its card
  const beside = card('tint').nextElementSibling
  expect(beside?.localName).toBe('iframe')
  expect(beside?.getAttribute('title')).toBe('The states of status.error on the scale tint, light mode')
  emit(statesHead().querySelector('mds-tab[aria-label="Mode"]')!, 'mdsTabChange', { id: 1, value: 'dark' })
  expect(frames().every((title) => title?.endsWith('dark mode'))).toBe(true)
})

test('an alias follows no scale, and a family that paints nothing has no states', () => {
  show('variant.primary')
  expect(statesLine()).toBe(
    'variant.primary takes the ramp of brand.maggioli whatever its scale: the states of brand.maggioli show beside its scales.',
  )
  expect(frames()).toEqual([])
  act(() => render(null, root))
  show('brand.rnd')
  expect(statesLine()).toBe(
    'brand.rnd paints no component of Magma: no variant of a component takes it, no theme points an accent at it and no theme is drawn from it.',
  )
  expect(frames()).toEqual([])
  expect(statesHead().querySelector('mds-tab')).toBeNull()
})

// Reset beside the distribution (#1330): back to the steps of the configuration loaded, on manual
const reset = (name: string) =>
  [...distribution(name).closest('mds-input-field')!.parentElement!.children].find(
    (one): one is HTMLElement => one.localName === 'mds-button' && textOf(one) === 'Reset',
  )!
const easing = (name: string) => distribution(name).getAttribute('value')

test('Reset takes a scale back to the steps it was loaded with, once they changed', () => {
  const spies = show()
  // nothing to take back yet
  expect(reset('default').hasAttribute('disabled')).toBe(true)
  expect(reset('default').getAttribute('title')).toBe('default holds the steps of the loaded configuration')
  expect(reset('default').getAttribute('variant')).toBe('dark')
  expect(reset('default').getAttribute('tone')).toBe('outline')
  // a stop typed, one removed, one added
  emit(stop('default', 1), 'mdsInputChange', { value: '12' })
  click(card('default').querySelector<HTMLElement>('mds-button[aria-label="Remove step 10"]')!)
  expect(stops('default')).toEqual(['12', '16', '23', '34', '45', '66', '74', '84', '92'])
  expect(reset('default').hasAttribute('disabled')).toBe(false)
  click(reset('default'))
  expect(spies.onChangeScale).toHaveBeenLastCalledWith('default', SCALES.default)
  expect(stops('default')).toEqual(SCALES.default.map(String))
  expect(easing('default')).toBe('manual')
  expect(reset('default').hasAttribute('disabled')).toBe(true)
  // the other scales are left alone
  expect(stops('tint')).toEqual(SCALES.tint.map(String))
})

test('Reset takes a scale back to manual after an easing regenerated it', () => {
  show()
  // linear from 10 to 90 in five steps gives the same stops: the easing alone turns Reset on
  emit(distribution('tint'), 'mdsInputSelectChange', { value: 'linear' })
  expect(stops('tint')).toEqual(SCALES.tint.map(String))
  expect(reset('tint').hasAttribute('disabled')).toBe(false)
  emit(card('tint').querySelector('mds-input-field[label="Steps"] mds-input')!, 'mdsInputChange', { value: '3' })
  expect(stops('tint')).toEqual(['10', '50', '90'])
  click(reset('tint'))
  expect(stops('tint')).toEqual(SCALES.tint.map(String))
  expect(easing('tint')).toBe('manual')
  expect(card('tint').querySelector('mds-input-field[label="Steps"]')).toBeNull()
  expect(reset('tint').hasAttribute('disabled')).toBe(true)
  // an easing picked again starts from the five stops on screen, not from the three typed before
  emit(distribution('tint'), 'mdsInputSelectChange', { value: 'quad-in' })
  expect(stops('tint')).toEqual(['10', '15', '30', '55', '90'])
  expect(card('tint').querySelector('mds-input-field[label="Steps"] mds-input')?.getAttribute('value')).toBe('5')
})

test('Reset is off on a scale the loaded configuration did not have', () => {
  show()
  click(menuItem('tint', 'Duplicate'))
  expect(stops('custom-2')).toEqual(SCALES.tint.map(String))
  expect(reset('custom-2').hasAttribute('disabled')).toBe(true)
  expect(reset('custom-2').getAttribute('title')).toBe('the loaded configuration has no scale named custom-2')
})

// the whole studio mounts twice and solves every scale and the gate at each edit: a loaded CI
// runner takes seconds where a laptop takes one (the heavy tests of start.test.mts wait as long)
const SLOW = { timeout: 10_000 }

test('after an import, Reset takes a scale back to the steps of the file imported, over a reload too', async () => {
  // not served by a command: the studio starts from the configuration it bundles
  vi.stubGlobal('fetch', () => Promise.reject(new Error('no server')))
  localStorage.clear()
  try {
    const studio = () => h(App, { view: 'scales' })
    act(() => render(studio(), root))
    const builtin = ['8', '16', '23', '34', '45', '66', '74', '84', '92', '100']
    await vi.waitFor(() => expect(stops('default')).toEqual(builtin), SLOW)
    expect(reset('default').hasAttribute('disabled')).toBe(true)

    // a configuration with a default scale of its own, imported from the Config menu
    const imported = [5, 15, 25, 35, 45, 55, 65, 75, 85, 95]
    // the File of jsdom has no text(): the studio reads only the name and the text of the file
    const json = JSON.stringify({ ...base, ratios: { wcag3: { default: imported } } })
    const file = { name: 'product.json', text: async () => json }
    const picker = root.querySelector<HTMLInputElement>('input[type="file"]')!
    Object.defineProperty(picker, 'files', { configurable: true, value: [file] })
    await act(async () => {
      picker.dispatchEvent(new Event('change'))
    })
    await vi.waitFor(() => expect(stops('default')).toEqual(imported.map(String)), SLOW)
    expect(reset('default').hasAttribute('disabled')).toBe(true)

    // edited, then reset: the steps of the file, not the built-in ones
    emit(stop('default', 1), 'mdsInputChange', { value: '9' })
    expect(stops('default')[0]).toBe('9')
    click(reset('default'))
    expect(stops('default')).toEqual(imported.map(String))
    expect(reset('default').hasAttribute('disabled')).toBe(true)

    // a reload restores the draft, and with it what was loaded
    emit(stop('default', 1), 'mdsInputChange', { value: '9' })
    // the draft is written by an effect, after the paint
    await vi.waitFor(() => expect(localStorage.getItem('magma-design-tokens:playground:draft')).toContain('"loadedRatios"'), SLOW)
    act(() => render(null, root))
    act(() => render(studio(), root))
    await vi.waitFor(() => expect(stops('default')[0]).toBe('9'), SLOW)
    click(reset('default'))
    expect(stops('default')).toEqual(imported.map(String))

    // the Reset of the page loads the bundled configuration again: its steps are the loaded ones
    emit(stop('default', 1), 'mdsInputChange', { value: '9' })
    click(root.querySelector<HTMLElement>('#studio-reset')!)
    await vi.waitFor(() => expect(stops('default')).toEqual(builtin), SLOW)
    expect(reset('default').hasAttribute('disabled')).toBe(true)
  } finally {
    localStorage.clear()
    vi.unstubAllGlobals()
  }
}, 30_000)
