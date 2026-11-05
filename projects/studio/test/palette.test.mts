// @vitest-environment jsdom
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { h, render } from 'preact'

import type { MagmaConfig } from '@maggioli-design-system/design-tokens/src/lib/color.mjs'
import { App } from '../src/app.js'
import { nearestColorName } from '../src/color-names.js'

// The Palette page in Magma: the list of the families, the editor of the one selected, its menu,
// the settings of the whole configuration and the dialog of a new colour react to the controls of
// Magma. jsdom does not upgrade the components: the test dispatches the events they emit, with
// their detail, and reads the configuration the page hands to the shell.

const root = document.createElement('div')
document.body.append(root)

let configs: MagmaConfig[] = []
const latest = (): MagmaConfig => configs[configs.length - 1]
const color = (name: string) => latest().colors.find((one) => one.name === name)

beforeEach(async () => {
  // not served by a command: the page starts from the configuration it bundles
  vi.stubGlobal('fetch', () => Promise.reject(new Error('no server')))
  localStorage.clear()
  configs = []
  render(h(App, { onConfig: (config: MagmaConfig) => configs.push(config) }), root)
  await vi.waitFor(() => expect(heading()).toBe('tone.neutral'))
})

afterEach(() => {
  render(null, root)
  localStorage.clear()
  vi.unstubAllGlobals()
})

const emit = (el: Element, type: string, detail?: unknown) =>
  el.dispatchEvent(new CustomEvent(type, { detail, bubbles: true }))

const heading = () => root.querySelector('#palette-color-title')?.textContent?.trim()

/** The field of Magma labelled so, inside the scope. */
function field (label: string, scope: ParentNode = root): Element {
  const found = [...scope.querySelectorAll('mds-input-field')].find(
    (one) => one.getAttribute('label') === label,
  )
  if (!found) throw new Error(`no field ${label}`)
  return found
}

/** The row of a family in the list, by its name in the group. */
function item (name: string): HTMLButtonElement {
  const found = [...root.querySelectorAll<HTMLButtonElement>('.palette-list button')].find(
    (one) => one.querySelector('mds-text')?.textContent?.trim() === name,
  )
  if (!found) throw new Error(`no family ${name} in the list`)
  return found
}

const magmaButton = (label: string, scope: ParentNode = root) =>
  scope.querySelector<HTMLElement>(`mds-button[label="${label}"]`)

const switchLabelled = (label: string, scope: ParentNode) =>
  [...scope.querySelectorAll('mds-input-switch')].find((one) => one.textContent?.trim() === label)!

test('the list marks the family shown and opens another one', async () => {
  expect(item('neutral').getAttribute('aria-current')).toBe('true')
  expect(item('info').hasAttribute('aria-current')).toBe(false)
  // the references carry their badge
  expect(item('primary').querySelector('mds-badge')?.getAttribute('label')).toBe('ref')

  item('info').click()
  await vi.waitFor(() => expect(heading()).toBe('status.info'))
  expect(item('info').getAttribute('aria-current')).toBe('true')
  expect(item('neutral').hasAttribute('aria-current')).toBe(false)
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

test('Smooth switches the colour, and the one of the global settings the configuration', async () => {
  emit(switchLabelled('Smooth', root.querySelector('.palette-color')!), 'mdsInputSwitchChange', {
    name: '',
    checked: true,
    value: '',
  })
  await vi.waitFor(() => expect(color('tone.neutral')?.smooth).toBe(true))
  expect(latest().smooth).toBeFalsy()

  emit(switchLabelled('Smooth', root.querySelector('.palette-global')!), 'mdsInputSwitchChange', {
    name: '',
    checked: true,
    value: '',
  })
  await vi.waitFor(() => expect(latest().smooth).toBe(true))
})

test('a custom hue shift shows its sliders and writes what they give', async () => {
  const group = root.querySelector('.palette-color .palette-group')!
  expect(group.querySelectorAll('mds-input-range')).toHaveLength(0)
  emit(field('Mode', group).querySelector('mds-input-select')!, 'mdsInputSelectChange', {
    value: 'custom',
    values: ['custom'],
  })
  await vi.waitFor(() =>
    expect(color('tone.neutral')?.hueShift).toEqual({ dark: -18, light: 10, curve: 'smooth' }),
  )
  await vi.waitFor(() => expect(group.querySelectorAll('mds-input-range')).toHaveLength(2))
  expect(group.querySelector('.palette-weights')).not.toBeNull()

  emit(field('Dark (degrees)', group).querySelector('mds-input-range')!, 'mdsInputRangeChange', -30)
  await vi.waitFor(() => expect(color('tone.neutral')?.hueShift?.dark).toBe(-30))
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
  magmaButton('Add color', root.querySelector('.palette-list')!)!.click()
  const modal = await vi.waitFor(() => {
    const found = root.querySelector('mds-modal')
    if (!found) throw new Error('no dialog yet')
    return found
  })
  expect(modal.getAttribute('aria-label')).toBe('New color')
  const nameOf = () => field('Name', modal).querySelector('mds-input')!.getAttribute('value')
  expect(nameOf()).toBe(nearestColorName('#4f8fd9'))

  // until Magma has a colour field (#1260) the picker is a native input
  const pick = async (hex: string) => {
    const picker = modal.querySelector<HTMLInputElement>('input[type="color"]')!
    picker.value = hex
    picker.dispatchEvent(new Event('input', { bubbles: true }))
    await vi.waitFor(() => expect(field('Color', modal).getAttribute('message')).toBe(hex))
  }
  await pick('#ff0000')
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
  magmaButton('Add color', root.querySelector('.palette-list')!)!.click()
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
  expect(modal.querySelector('input[type="color"]')).toBeNull()
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

test('Download all tokens is the main action of the head, the other downloads in its menu', async () => {
  const split = root.querySelector('mds-button-dropdown')!
  expect(split.getAttribute('label')).toBe('Download all tokens (zip)')
  expect(split.getAttribute('icon')).toBe('mi/outline/file-download')
  expect([...split.querySelectorAll('mds-button')].map((item) => item.getAttribute('label'))).toEqual([
    'Figma tokens (DTCG)',
    'Config (json)',
    'CSS tokens',
    'GIMP palette',
  ])

  // the primary action of the split button downloads the zip of every token
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
    emit(split, 'mdsButtonDropdownClick')
    await vi.waitFor(() => expect(files).toEqual(['magma-design-tokens.zip']))
  } finally {
    click.mockRestore()
  }
})
