// @vitest-environment jsdom
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { h, render } from 'preact'

import type { MagmaConfig } from '@maggioli-design-system/design-tokens/src/lib/color.mjs'
import { App } from '../src/app.js'
import type { ConfigAction } from '../src/config-menu.js'
import { nearestColorName } from '../src/color-names.js'

// The Palette page in Magma: the list of the families, the editor of the one selected, its menu,
// the settings of the whole configuration and the dialog of a new colour react to the controls of
// Magma. jsdom does not upgrade the components: the test dispatches the events they emit, with
// their detail, and reads the configuration the page hands to the shell.

const root = document.createElement('div')
document.body.append(root)

let configs: MagmaConfig[] = []
// the actions of the Config menu of the bar, as the App hands them to it
let actions: ConfigAction[] = []
const latest = (): MagmaConfig => configs[configs.length - 1]
const color = (name: string) => latest().colors.find((one) => one.name === name)

beforeEach(async () => {
  // not served by a command: the page starts from the configuration it bundles
  vi.stubGlobal('fetch', () => Promise.reject(new Error('no server')))
  localStorage.clear()
  configs = []
  actions = []
  render(
    h(App, {
      onConfig: (config: MagmaConfig) => configs.push(config),
      onConfigActions: (handed: ConfigAction[]) => (actions = handed),
    }),
    root,
  )
  await vi.waitFor(() => expect(heading()).toBe('tone.neutral'))
  // the actions of the Config menu are handed by an effect, after the paint
  await vi.waitFor(() => expect(actions.length).toBeGreaterThan(0))
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

/** The button of a family in the list, by its name in the group. */
function item (name: string): HTMLElement {
  const found = root.querySelector<HTMLElement>(`.palette-list mds-button[label="${name}"]`)
  if (!found) throw new Error(`no family ${name} in the list`)
  return found
}

const magmaButton = (label: string, scope: ParentNode = root) =>
  scope.querySelector<HTMLElement>(`mds-button[label="${label}"]`)

const switchLabelled = (label: string, scope: ParentNode) =>
  [...scope.querySelectorAll('mds-input-switch')].find((one) => one.textContent?.trim() === label)!

test('the list marks the family shown and opens another one', async () => {
  // the variants first, at the top of the list
  expect(root.querySelector('.palette-list-group > mds-text')?.textContent?.trim()).toBe('variant')
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
  // the bar is drawn only where the list stands above the page (palette.css, measured in a real
  // browser by site.test.mts): here its state, which the sheet follows
  const bar = root.querySelector<HTMLElement>('.palette-list-bar > mds-button')!
  const list = root.querySelector('.palette-list')!
  const open = () => list.classList.contains('palette-list-open')
  expect(bar.getAttribute('label')).toBe('tone.neutral')
  expect(bar.getAttribute('aria-controls')).toBe(list.id)
  expect(bar.getAttribute('aria-expanded')).toBe('false')
  expect(bar.getAttribute('icon')).toBe('mi/baseline/expand-more')
  expect(open()).toBe(false)

  bar.click()
  await vi.waitFor(() => expect(bar.getAttribute('aria-expanded')).toBe('true'))
  expect(bar.getAttribute('icon')).toBe('mi/baseline/expand-less')
  expect(open()).toBe(true)

  // choosing a family shows it and folds the list again
  item('info').click()
  await vi.waitFor(() => expect(heading()).toBe('status.info'))
  expect(bar.getAttribute('label')).toBe('status.info')
  expect(bar.getAttribute('aria-expanded')).toBe('false')
  expect(open()).toBe(false)

  // the bar alone folds it too, the family unchanged
  bar.click()
  await vi.waitFor(() => expect(open()).toBe(true))
  bar.click()
  await vi.waitFor(() => expect(open()).toBe(false))
  expect(heading()).toBe('status.info')
})

test('the pages on the whole configuration have neither the list nor its bar', async () => {
  render(h(App, { view: 'surface', onConfig: (config: MagmaConfig) => configs.push(config) }), root)
  await vi.waitFor(() => expect(root.querySelector('.layout.no-sidebar')).not.toBeNull())
  expect(root.querySelector('.palette-list')).toBeNull()
  expect(root.querySelector('.palette-list-bar')).toBeNull()
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

  // the global settings start closed: the page opens on the family, not on the settings of all;
  // their hue shifting says it is the global one, apart from the one of the family
  expect(root.querySelector('.palette-global')?.hasAttribute('opened')).toBe(false)
  // a separator sets them apart from the settings of the family
  expect(root.querySelector('.palette-global')?.previousElementSibling?.localName).toBe(
    'mds-separator',
  )
  expect(
    root.querySelector('.palette-global .palette-group legend')?.textContent?.trim(),
  ).toBe('Global hue shifting')
  expect(root.querySelector('.palette-color .palette-group legend')?.textContent?.trim()).toBe(
    'Hue shifting',
  )

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
  // the ends start mirrored, the default link
  await vi.waitFor(() =>
    expect(color('tone.neutral')?.hueShift).toEqual({ dark: -18, light: 18, curve: 'smooth' }),
  )
  await vi.waitFor(() => expect(group.querySelectorAll('mds-input-range')).toHaveLength(2))
  expect(group.querySelector('.palette-weights')).not.toBeNull()

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
  custom(root.querySelector('.palette-global')!)
  await vi.waitFor(() => expect(latest().hueShift).toBeDefined())
  await vi.waitFor(() => expect(badge('info')).toBe('hs'))

  // a hue shift of its own on top of it
  custom(root.querySelector('.palette-color .palette-group')!)
  await vi.waitFor(() => expect(badge('neutral')).toBe('hs+'))
  expect(item('neutral').getAttribute('title')).toBe('hue shifting of its own, over the global one')
  expect(badge('info')).toBe('hs')
})

test('a custom curve starts with no dead zone and a linear ramp, and offers every easing', async () => {
  const group = root.querySelector('.palette-color .palette-group')!
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
  const group = root.querySelector('.palette-color .palette-group')!
  emit(field('Mode', group).querySelector('mds-input-select')!, 'mdsInputSelectChange', {
    value: 'custom',
    values: ['custom'],
  })
  await vi.waitFor(() => expect(group.querySelectorAll('mds-input-range')).toHaveLength(2))
  // the link sits in the head of the box of the two ends, named Ends
  const link = () => group.querySelector('.palette-ends mds-input-select[aria-label="Ends"]')!
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

test('a reference says its hue shifting is the one of its source, and opens it', async () => {
  // jsdom lays nothing out: the group comes into view in a browser only
  Element.prototype.scrollIntoView = vi.fn()
  item('primary').click()
  await vi.waitFor(() => expect(heading()).toBe('variant.primary'))
  const source = color('variant.primary')!.alias!
  const note = root.querySelector('.palette-group-note')!
  expect(note.querySelector('mds-banner')?.getAttribute('variant')).toBe('info')

  magmaButton(`Open ${source}`, note)!.click()
  await vi.waitFor(() => expect(heading()).toBe(source))
  await vi.waitFor(() =>
    expect(document.activeElement).toBe(root.querySelector('#palette-hue-shift')),
  )
})

// the request to open the hue shifting is for the source family: the effects of the render
// before it, still pending when the person clicks (a slow machine, a quick hand), run at the start
// of the next render and must leave it for the render of the source (seen in CI on #1326)
test('the source opens with the focus on its hue shifting even while the effects of the reference are pending', async () => {
  Element.prototype.scrollIntoView = vi.fn()
  item('primary').click()
  // the render runs in a microtask, its effects after the paint, in a task: stop between the two
  await Promise.resolve()
  await Promise.resolve()
  expect(heading()).toBe('variant.primary')
  const source = color('variant.primary')!.alias!
  magmaButton(`Open ${source}`, root.querySelector('.palette-group-note')!)!.click()
  await vi.waitFor(() => expect(heading()).toBe(source))
  await vi.waitFor(() =>
    expect(document.activeElement).toBe(root.querySelector('#palette-hue-shift')),
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

test('the head of a page keeps Reset in view; the Config menu brings the configuration in and takes it out', async () => {
  // nothing that imports or exports is left in the head, and no menu for one action
  const head = root.querySelector('.studio-page-actions')!
  expect(head.querySelector('mds-button-dropdown')).toBeNull()
  expect([...head.querySelectorAll('mds-button')].map((one) => one.getAttribute('label'))).toEqual([
    'Reset',
  ])
  expect(root.querySelector('#studio-more')).toBeNull()

  // the actions, in their order, each with the format it reads or hands over
  expect(actions.map(({ label, format }) => [label, format])).toEqual([
    ['Import config', 'json'],
    ['Copy JSON', undefined],
    ['Download all tokens', 'misc'],
    ['Download config', 'json'],
    ['Download Figma tokens', 'DTCG'],
    ['Download CSS tokens', 'css'],
    ['Download GIMP palette', 'gpl'],
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
  // Import config opens the file picker of the App
  const picker = root.querySelector<HTMLInputElement>('input[type="file"]')!
  const opened = vi.spyOn(picker, 'click').mockImplementation(() => undefined)
  actions.find((one) => one.id === 'import')!.run()
  expect(opened).toHaveBeenCalled()
})

test('Reset, in view, takes the configuration back to the one Magma builds with once it has an edit', async () => {
  const reset = () => root.querySelector<HTMLElement>('#studio-reset')!
  // nothing to discard on the configuration of Magma
  expect(reset().hasAttribute('disabled')).toBe(true)
  magmaButton('Duplicate')!.click()
  await vi.waitFor(() => expect(color('tone.neutral-copy')).toBeDefined())
  await vi.waitFor(() => expect(reset().hasAttribute('disabled')).toBe(false))
  reset().click()
  await vi.waitFor(() => expect(color('tone.neutral-copy')).toBeUndefined())
  expect(reset().hasAttribute('disabled')).toBe(true)
})

test('a page of Colors opens at its top, not at the scroll the page before it left', async () => {
  const main = root.querySelector('main.content')!
  const set: number[] = []
  Object.defineProperty(main, 'scrollTop', { configurable: true, get: () => 0, set: (top: number) => set.push(top) })
  render(h(App, { view: 'scales', onConfig: (config: MagmaConfig) => configs.push(config) }), root)
  await vi.waitFor(() => expect(set).toContain(0))
})
