import { afterEach, expect, test, vi } from 'vitest'
import { h, render } from 'preact'
import { useState } from 'preact/hooks'

import initialConfig from '@maggioli-design-system/design-tokens/.magma-design-tokensrc.json'
import type {
  ColorConfig,
  GroupConfig,
  MagmaConfig,
} from '@maggioli-design-system/design-tokens/src/lib/color.mjs'
import { GroupsManager } from '../src/groups.js'
import { textOf } from './text.mjs'

// The Groups page answers to the controls of Magma: the selection of each colour, the batch
// action, the view of the selection, the selection by export and the settings of each group.
// jsdom does not upgrade the components: the test dispatches the events they emit, with their
// detail, and reads what the page renders.

const root = document.createElement('div')
document.body.append(root)

afterEach(() => {
  render(null, root)
  localStorage.clear()
  vi.unstubAllGlobals()
})

const bundled = initialConfig as unknown as MagmaConfig

function groupsOf (config: MagmaConfig): Map<string, ColorConfig[]> {
  const map = new Map<string, ColorConfig[]>()
  for (const color of config.colors) {
    const group = color.name.split('.')[0]
    map.set(group, [...(map.get(group) ?? []), color])
  }
  return map
}

interface Calls {
  update: Array<[string, GroupConfig]>
  byExport: string[]
  opened: number
}

// the page with the state the app keeps for it: the config and the selection
function show (): Calls {
  const calls: Calls = { update: [], byExport: [], opened: 0 }
  function Harness () {
    const [config, setConfig] = useState(bundled)
    const [selected, setSelected] = useState<Set<string>>(() => new Set())
    return h(GroupsManager, {
      config,
      groups: groupsOf(config),
      scaleNamesFor: () => ['default', 'tone'],
      labelFor: (_formula, name) => name,
      preview: null,
      previewError: null,
      onUpdateGroup: (group, patch) => {
        calls.update.push([group, patch])
        setConfig((prev) => ({ ...prev, groups: { ...prev.groups, [group]: patch } }))
      },
      selected,
      onToggleSelect: (name) =>
        setSelected((prev) => {
          const next = new Set(prev)
          if (next.has(name)) next.delete(name)
          else next.add(name)
          return next
        }),
      exportNames: ['default', 'tones'],
      onSelectByExport: (name) => calls.byExport.push(name),
      onOpenBatch: () => {
        calls.opened += 1
      },
    })
  }
  render(h(Harness, {}), root)
  return calls
}

const emit = (element: Element, type: string, detail: unknown) =>
  element.dispatchEvent(new CustomEvent(type, { detail, bubbles: true }))

// a render of Preact after a state change
const flush = () => new Promise((resolve) => setTimeout(resolve, 0))

const card = (title: string): HTMLElement =>
  [...root.querySelectorAll<HTMLElement>('mds-card')].find(
    (el) => el.querySelector('mds-text[tag="h2"]')?.textContent === title,
  )!

// the checkbox of a colour, named after it: the one switch of the page is Group selected
const colourSwitch = (scope: Element, name: string): HTMLElement =>
  [...scope.querySelectorAll<HTMLElement>('mds-input-switch[type="checkbox"]')].find(
    (el) => el.textContent === name,
  )!

// the status that counts the selection, among those of the page (the app has its own)
const count = () =>
  [...root.querySelectorAll('[role="status"]')]
    .map((status) => status.textContent?.trim())
    .find((text) => text?.endsWith(' selected'))

// a field of Magma by the label it shows, and the select it holds
const selectIn = (scope: Element, label: string) =>
  scope.querySelector(`mds-input-field[label="${label}"] mds-input-select`)

const batchButton = () =>
  [...root.querySelectorAll<HTMLElement>('mds-button')].find(
    (el) => textOf(el) === 'Batch export',
  )!

test('every colour has its own checkbox, always on the page and named after the colour', () => {
  show()
  const tone = card('tone')
  const checks = [...tone.querySelectorAll('mds-input-switch')]
  expect(checks.map((el) => el.textContent)).toEqual([
    'porcelain',
    'kaolin',
    'neutral',
    'fireclay',
    'bisque',
  ])
  // a checkbox of Magma, which names its control "Select porcelain" from its text
  for (const check of checks) {
    expect(check.getAttribute('type')).toBe('checkbox')
    expect(check.hasAttribute('hidden')).toBe(false)
  }
})

test('ticking colours counts them and enables the batch action, which opens the batch', async () => {
  const calls = show()
  expect(count()).toBe('0 selected')
  expect(batchButton().hasAttribute('disabled')).toBe(true)

  emit(colourSwitch(card('tone'), 'porcelain'), 'mdsInputSwitchChange', { name: '', checked: true, value: '' })
  await flush()
  emit(colourSwitch(card('status'), 'info'), 'mdsInputSwitchChange', { name: '', checked: true, value: '' })
  await flush()

  expect(count()).toBe('2 selected')
  expect(colourSwitch(card('tone'), 'porcelain').hasAttribute('checked')).toBe(true)
  expect(batchButton().hasAttribute('disabled')).toBe(false)
  batchButton().click()
  expect(calls.opened).toBe(1)
})

test('group selected lifts the ticked colours into a card of their own, out of their group', async () => {
  show()
  emit(colourSwitch(card('tone'), 'kaolin'), 'mdsInputSwitchChange', { name: '', checked: true, value: '' })
  await flush()
  expect(card('Selected colors')).toBeUndefined()

  const groupSelected = root.querySelector('mds-input-switch[type="switch"]')!
  expect(groupSelected.textContent?.trim()).toBe('Group selected')
  emit(groupSelected, 'mdsInputSwitchChange', { name: '', checked: true, value: '' })
  await flush()

  expect(colourSwitch(card('Selected colors'), 'kaolin')).toBeDefined()
  expect(colourSwitch(card('tone'), 'kaolin')).toBeUndefined()
  // the group still counts all of its colours
  expect(card('tone').textContent).toContain('5 colors')
})

test('select by export hands the export over once, then goes back to its placeholder', async () => {
  const calls = show()
  const select = selectIn(root, 'Select by export')!
  expect(select.getAttribute('placeholder')).toBe('Choose an export')
  expect([...select.querySelectorAll('option')].map((option) => option.value)).toEqual([
    'default',
    'tones',
  ])

  emit(select, 'mdsInputSelectChange', { value: 'tones', values: ['tones'] })
  expect(calls.byExport).toEqual(['tones'])
  // the render of the pick, then the one of the reset: the bridge drops as an echo a change equal
  // to the value just set, so the second pick waits for the placeholder to be the value set
  await flush()
  await vi.waitFor(() => expect(select.getAttribute('value')).toBe(''))
  // back on its placeholder, the same export can be picked again
  emit(select, 'mdsInputSelectChange', { value: 'tones', values: ['tones'] })
  expect(calls.byExport).toEqual(['tones', 'tones'])
})

test('the formula and the ratios of a group are written to its settings', async () => {
  const calls = show()
  const [formula, ratios] = [...card('status').querySelectorAll('mds-input-select')]
  expect(formula.closest('mds-input-field')?.getAttribute('label')).toBe('Formula')
  expect(formula.getAttribute('size')).toBe('md')

  emit(formula, 'mdsInputSelectChange', { value: 'wcag2', values: ['wcag2'] })
  await flush()
  expect(calls.update.at(-1)).toEqual(['status', { surface: true, formula: 'wcag2' }])
  expect(selectIn(card('status'), 'Formula')?.getAttribute('value')).toBe('wcag2')

  // inherit again: the field goes away from the settings
  emit(formula, 'mdsInputSelectChange', { value: '', values: [] })
  await flush()
  expect(calls.update.at(-1)).toEqual(['status', { surface: true, formula: undefined }])

  emit(ratios, 'mdsInputSelectChange', { value: 'tone', values: ['tone'] })
  await flush()
  expect(calls.update.at(-1)?.[1].ratios).toBe('tone')
})

test('the export of a group is written when the field is left or Enter is pressed, not per keystroke', async () => {
  const calls = show()
  const field = () => card('label').querySelector('mds-input-field[label="Export"] mds-input')!

  // the person types in the field, which has the focus
  emit(field(), 'mdsInputFocus', undefined)
  emit(field(), 'mdsInputChange', { value: 'city,' })
  await flush()
  // the half-typed list stays in the field as typed, and the group is not touched yet
  expect(field().getAttribute('value')).toBe('city,')
  expect(calls.update).toEqual([])

  emit(field(), 'mdsInputChange', { value: 'city, palette' })
  await flush()
  emit(field(), 'mdsInputBlur', undefined)
  await flush()
  expect(calls.update).toEqual([['label', { export: ['city', 'palette'] }]])
  expect(field().getAttribute('value')).toBe('city, palette')

  // Enter writes it too; an empty field takes the export off the group
  emit(field(), 'mdsInputFocus', undefined)
  emit(field(), 'mdsInputChange', { value: '' })
  await flush()
  emit(field(), 'mdsInputKeydown', new KeyboardEvent('keydown', { key: 'Enter' }))
  await flush()
  expect(calls.update.at(-1)).toEqual(['label', { export: undefined }])

  // leaving the field without a change writes nothing
  emit(field(), 'mdsInputBlur', undefined)
  await flush()
  expect(calls.update).toHaveLength(2)
})

test('in the app, select by export selects the colours of the export and opens the batch', async () => {
  const PATH = '/project/.magma-design-tokensrc.json'
  vi.stubGlobal('fetch', async (url: string) => {
    if (url !== '/api/config') return new Response('{}', { status: 404 })
    return new Response(JSON.stringify({ path: PATH, config: bundled, readOnly: null }))
  })
  // loaded here, so a page of the app that does not build fails this test alone
  const { App } = await import('../src/app.js')
  render(h(App, { view: 'groups' }), root)

  const select = await vi.waitFor(() => {
    const el = selectIn(root, 'Select by export')
    if (!el) throw new Error('no groups page yet')
    return el
  })
  emit(select, 'mdsInputSelectChange', { value: 'tones', values: ['tones'] })

  const modal = await vi.waitFor(() => {
    const el = root.querySelector('mds-modal')
    if (!el) throw new Error('no batch dialog yet')
    return el
  })
  expect(modal.getAttribute('aria-label')).toBe('Batch export (5)')
  expect(count()).toBe('5 selected')
})
