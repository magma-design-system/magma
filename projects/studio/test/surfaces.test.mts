import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { h, render } from 'preact'
import { useState } from 'preact/hooks'
import { act } from 'preact/test-utils'
import { within } from '@testing-library/preact'

import initialConfig from '@maggioli-design-system/design-tokens/.magma-design-tokensrc.json'
import type { MagmaConfig } from '@maggioli-design-system/design-tokens/src/lib/color.mjs'
import type { ThemeConfig } from '@maggioli-design-system/design-tokens/src/lib/surface.mjs'
import { TEXT_ROLES } from '@maggioli-design-system/design-tokens/src/lib/text-role.mjs'
import { SurfaceManager } from '../src/surfaces.js'
import { LangProvider } from '../src/i18n.js'
import { textOf } from './text.mjs'

// The Semantic surface page, written in Magma: the groups are chips, the families chips with
// the swatch of their colour, the levels sliders, the preview two selects and two tabs. jsdom does not upgrade the
// components: the test dispatches the events they emit and reads what the page writes back.

const root = document.createElement('div')
document.body.append(root)

let current: MagmaConfig
const onToggleSurface = vi.fn()
const onToggleGroupSurface = vi.fn()

/** The page with its configuration in state, the theme updated as app.tsx does. */
function Page() {
  const [config, setConfig] = useState(
    () => JSON.parse(JSON.stringify(initialConfig)) as MagmaConfig,
  )
  current = config
  return h(SurfaceManager, {
    config,
    onToggleSurface,
    onToggleGroupSurface,
    onUpdateTheme: (mutate: (theme: ThemeConfig) => void) =>
      setConfig((prev) => {
        const next = JSON.parse(JSON.stringify(prev)) as MagmaConfig
        mutate(next.theme as ThemeConfig)
        return next
      }),
  })
}

beforeEach(() => {
  onToggleSurface.mockReset()
  onToggleGroupSurface.mockReset()
  render(h(Page, {}), root)
})
afterEach(() => render(null, root))

const emit = (element: Element, type: string, detail: unknown) =>
  act(() => {
    element.dispatchEvent(new CustomEvent(type, { detail, bubbles: true }))
  })

const theme = () => current.theme as ThemeConfig & { text: Record<string, number> }

// a slider is named by its text (magma.tsx, Range)
const slider = (name: string) =>
  [...root.querySelectorAll('mds-input-range')].find((one) => textOf(one) === name)!

// The canvases of the preview, one per mode (SurfaceCanvas), each found by its label, which names
// its mode and its colour: `light - canvas #f6f6f6`
const canvasLabels = (scope: HTMLElement = root) => within(scope).queryAllByText(/^\S+ - canvas\b/)
const canvases = (scope: HTMLElement = root) => canvasLabels(scope).map((label) => label.parentElement!)

test('a group is a Magma chip: choosing it hands back the group, status stays on', async () => {
  const chips = [...root.querySelectorAll('mds-chip')]
  expect(chips.map((chip) => chip.getAttribute('label'))).toEqual(
    expect.arrayContaining(['tone', 'status']),
  )

  const status = chips.find((chip) => chip.getAttribute('label') === 'status')!
  expect(status.hasAttribute('selected')).toBe(true)
  expect(status.hasAttribute('disabled')).toBe(true)
  expect(status.parentElement?.querySelector('mds-badge')?.getAttribute('label')).toBe('always on')

  const tone = chips.find((chip) => chip.getAttribute('label') === 'tone')!
  await emit(tone, 'mdsChipSelect', { selected: true })
  expect(onToggleGroupSurface).toHaveBeenLastCalledWith('tone', true)
  await emit(tone, 'mdsChipSelect', { selected: undefined })
  expect(onToggleGroupSurface).toHaveBeenLastCalledWith('tone', false)
})

// the families of a list, as the chips of their row: the group named by the list
const familiesOf = (label: string) => [
  ...within(root).getByRole('group', { name: label }).querySelectorAll('mds-chip'),
]

test('a family is a selectable Magma chip with the swatch of its colour', async () => {
  const families = [...familiesOf('Surface families'), ...familiesOf('Status families')]
  expect(families.length).toBeGreaterThan(4)
  const colors = (initialConfig as MagmaConfig).colors
  for (const family of families) {
    expect(family.hasAttribute('selectable')).toBe(true)
    const color = colors.find((one) => one.name.endsWith(`.${family.getAttribute('label')}`))!
    expect(family.getAttribute('swatch')).toBe(color.color)
  }

  const porcelain = families.find((family) => family.getAttribute('label') === 'porcelain')!
  expect(porcelain.hasAttribute('selected')).toBe(true)
  await emit(porcelain, 'mdsChipSelect', { selected: undefined })
  expect(onToggleSurface).toHaveBeenLastCalledWith('tone.porcelain', false)
  const kaolin = families.find((family) => family.getAttribute('label') === 'kaolin')!
  await emit(kaolin, 'mdsChipSelect', { selected: true })
  expect(onToggleSurface).toHaveBeenLastCalledWith('tone.kaolin', true)

  // a status family follows its group, which is on: the badge beside it says so
  const info = families.find((family) => family.getAttribute('label') === 'info')!
  expect(info.hasAttribute('selected')).toBe(true)
  expect(info.parentElement?.querySelector('mds-badge')?.getAttribute('label')).toBe('via status')
  expect(info.parentElement?.getAttribute('title')).toBe('status.info (follows the status group)')
})

test('the status families sit in a row of their own, under the others, saying they are never a theme', () => {
  const names = (label: string) => familiesOf(label).map((family) => family.getAttribute('label'))

  const status = (initialConfig as MagmaConfig).colors
    .filter((color) => color.name.startsWith('status.'))
    .map((color) => color.name.split('.')[1])
  expect(names('Status families')).toEqual(status)
  expect(names('Surface families')).not.toEqual(expect.arrayContaining([status[0]]))
  expect(names('Surface families')).toEqual(expect.arrayContaining(['porcelain', 'blue', 'maggioli']))

  // the row of the other families, then the note that says why, then the row of the status ones
  const families = within(root).getByRole('group', { name: 'Surface families' })
  const reserved = within(root).getByText(/never a theme/)
  const row = within(root).getByRole('group', { name: 'Status families' })
  expect(families.compareDocumentPosition(reserved) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  expect(reserved.compareDocumentPosition(row) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
})

test('a slider of the levels writes the level of its role and mode', async () => {
  const surface = slider('Surfaces default, light')
  expect(surface.getAttribute('value')).toBe('96')
  await emit(surface, 'mdsInputRangeChange', 90)
  expect(theme().surfaces.light.default).toBe('90%')
  expect(surface.getAttribute('value')).toBe('90')

  const border = slider('Borders strong, dark')
  await emit(border, 'mdsInputRangeChange', 80)
  expect(theme().borders.dark.strong).toBe('80%')

  const target = slider('Text muted, target')
  await emit(target, 'mdsInputRangeChange', 70)
  expect(theme().text.muted).toBe(70)
})

// the card of the preview, which holds its tabs and the panel they show
const preview = () => root.querySelector('mds-tab')!.parentElement!

test('the preview follows the family and the shadow chosen in its selects', async () => {
  const select = (label: string) => root.querySelector(`mds-input-field[label="${label}"] mds-input-select`)!
  const [family, shadow] = [select('Preview family'), select('Preview shadow')]
  const first = family.getAttribute('value')
  const other = [...family.querySelectorAll('option')]
    .map((option) => option.value)
    .find((value) => value !== first)!
  const title = () => preview().querySelector('mds-text[tag="h2"]')?.textContent
  expect(title()).toContain(`surface-${first}`)

  await emit(family, 'mdsInputSelectChange', { value: other, values: [other] })
  expect(family.getAttribute('value')).toBe(other)
  expect(title()).toContain(`surface-${other}`)

  // the page, which hands the shadow down to its preview
  const page = root.firstElementChild as HTMLElement
  expect(page.style.getPropertyValue('--preview-shadow')).toBe('none')
  const lifted = [...shadow.querySelectorAll('option')].map((option) => option.value).find((v) => v !== 'none')!
  await emit(shadow, 'mdsInputSelectChange', { value: lifted, values: [lifted] })
  expect(page.style.getPropertyValue('--preview-shadow')).not.toBe('none')
})

test('the tabs switch the preview between the step charts and the surface boxes', async () => {
  const tabs = root.querySelector('mds-tab')!
  const item = (value: string) => root.querySelector(`mds-tab-item[value="${value}"]`)!
  // a step chart per mode, headed by the name of its mode
  const charts = () => within(preview()).queryAllByText(/^(Light|Dark)$/)
  expect(item('surface').hasAttribute('selected')).toBe(true)
  expect(canvases(preview())).toHaveLength(2)
  expect(charts()).toHaveLength(0)

  await emit(tabs, 'mdsTabChange', { id: 0, value: 'text' })
  expect(item('text').hasAttribute('selected')).toBe(true)
  expect(item('surface').hasAttribute('selected')).toBe(false)
  expect(charts()).toHaveLength(2)
  expect(canvases(preview())).toHaveLength(0)

  await emit(tabs, 'mdsTabChange', { id: 1, value: 'surface' })
  expect(canvases(preview())).toHaveLength(2)
})

test('the page speaks the language of the studio', () => {
  render(h(LangProvider, { value: 'it' }, h(Page, {})), root)
  expect(slider('Superfici default, chiaro').getAttribute('value')).toBe('96')
  expect(slider('Testo muted, obiettivo')).toBeDefined()
  const status = [...root.querySelectorAll('mds-chip')].find((chip) => chip.getAttribute('label') === 'status')!
  expect(status.parentElement?.querySelector('mds-badge')?.getAttribute('label')).toBe('sempre attivo')
  expect(within(root).queryByRole('group', { name: 'Famiglie di stato' })).not.toBeNull()
  expect([...root.querySelectorAll('mds-tab-item')].map((item) => item.getAttribute('label'))).toEqual(['Testi', 'Superficie'])
  // the roles keep their names, the canvas names its mode
  const [label] = canvasLabels()
  expect(label.textContent).toMatch(/^chiaro - canvas #/)
  expect(label.parentElement?.textContent).toContain('border strong')
})

test('the contrast verdicts of the preview are Magma badges, not emoji', () => {
  const verdicts = ['success', 'warning', 'error']
  expect(canvases()).toHaveLength(2)
  for (const canvas of canvases()) {
    // every text role carries its verdict: `text muted`, its colour, its Lc, its badge
    const texts = within(canvas).getAllByText(/^text \S+$/)
    expect(texts).toHaveLength(TEXT_ROLES.length)
    for (const text of texts) expect(verdicts).toContain(text.querySelector('mds-badge')?.getAttribute('variant'))
    // a border of state carries one, a decorative border none
    const strong = within(canvas).getByText('border strong')
    const muted = within(canvas).getByText('border muted')
    expect(verdicts).toContain(strong.querySelector('mds-badge')?.getAttribute('variant'))
    expect(muted.querySelector('mds-badge')).toBeNull()
  }
  expect(root.textContent).not.toMatch(/\u2705|\u26a0/u)
})
