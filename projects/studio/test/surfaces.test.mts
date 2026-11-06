// @vitest-environment jsdom
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { h, render } from 'preact'
import { useState } from 'preact/hooks'
import { act } from 'preact/test-utils'

import initialConfig from '@maggioli-design-system/design-tokens/.magma-design-tokensrc.json'
import type { MagmaConfig } from '@maggioli-design-system/design-tokens/src/lib/color.mjs'
import type { ThemeConfig } from '@maggioli-design-system/design-tokens/src/lib/surface.mjs'
import { SurfaceManager } from '../src/surfaces.js'

// The Semantic surface page, written in Magma: the groups are chips, the families toggle
// buttons, the levels sliders, the preview two selects and two tabs. jsdom does not upgrade the
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
  [...root.querySelectorAll('mds-input-range')].find((one) => one.textContent === name)!

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

test('a family is a toggle button with the swatch of its colour', async () => {
  const families = [...root.querySelectorAll<HTMLButtonElement>('button.surfaces-family')]
  expect(families.length).toBeGreaterThan(4)
  for (const family of families) expect(family.querySelector('.studio-swatch')).not.toBeNull()

  const porcelain = families.find((family) => family.textContent?.includes('porcelain'))!
  expect(porcelain.getAttribute('aria-pressed')).toBe('true')
  await act(() => porcelain.click())
  expect(onToggleSurface).toHaveBeenCalledWith('tone.porcelain', false)

  // a status family follows its group, which is on: it says so
  const info = families.find((family) => family.textContent?.includes('info'))!
  expect(info.hasAttribute('data-inherited')).toBe(true)
  expect(info.querySelector('mds-badge')?.getAttribute('label')).toBe('via status')
})

test('the status families sit in a row of their own, under the others, saying they are never a theme', () => {
  const lists = [...root.querySelectorAll('.surfaces-choices[role="group"]')]
  const names = (label: string) =>
    [...lists.find((list) => list.getAttribute('aria-label') === label)!.querySelectorAll('button.surfaces-family')].map(
      (family) => family.textContent?.replace('via status', '').trim(),
    )

  const status = (initialConfig as MagmaConfig).colors
    .filter((color) => color.name.startsWith('status.'))
    .map((color) => color.name.split('.')[1])
  expect(names('Status families')).toEqual(status)
  expect(names('Surface families')).not.toEqual(expect.arrayContaining([status[0]]))
  expect(names('Surface families')).toEqual(expect.arrayContaining(['porcelain', 'blue', 'maggioli']))

  const reserved = root.querySelector('.surfaces-reserved')!
  expect(reserved.textContent).toContain('never a theme')
  const families = root.querySelector('.surfaces-choices[aria-label="Surface families"]')!
  expect(families.compareDocumentPosition(reserved) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
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

test('the preview follows the family and the shadow chosen in its selects', async () => {
  const [family, shadow] = [...root.querySelectorAll('.surfaces-preview mds-input-select')]
  const first = family.getAttribute('value')
  const other = [...family.querySelectorAll('option')]
    .map((option) => option.value)
    .find((value) => value !== first)!
  const title = () => root.querySelector('.surfaces-preview [tag="h2"]')?.textContent
  expect(title()).toContain(`surface-${first}`)

  await emit(family, 'mdsInputSelectChange', { value: other, values: [other] })
  expect(family.getAttribute('value')).toBe(other)
  expect(title()).toContain(`surface-${other}`)

  const page = root.querySelector<HTMLElement>('.surfaces')!
  expect(page.style.getPropertyValue('--preview-shadow')).toBe('none')
  const lifted = [...shadow.querySelectorAll('option')].map((option) => option.value).find((v) => v !== 'none')!
  await emit(shadow, 'mdsInputSelectChange', { value: lifted, values: [lifted] })
  expect(page.style.getPropertyValue('--preview-shadow')).not.toBe('none')
})

test('the tabs switch the preview between the step charts and the surface boxes', async () => {
  const tabs = root.querySelector('mds-tab')!
  const item = (value: string) => root.querySelector(`mds-tab-item[value="${value}"]`)!
  expect(item('surface').hasAttribute('selected')).toBe(true)
  expect(root.querySelectorAll('.surfaces-canvas')).toHaveLength(2)
  expect(root.querySelector('.surfaces-chart')).toBeNull()

  await emit(tabs, 'mdsTabChange', { id: 0, value: 'text' })
  expect(item('text').hasAttribute('selected')).toBe(true)
  expect(item('surface').hasAttribute('selected')).toBe(false)
  expect(root.querySelectorAll('.surfaces-chart')).toHaveLength(2)
  expect(root.querySelector('.surfaces-canvas')).toBeNull()

  await emit(tabs, 'mdsTabChange', { id: 1, value: 'surface' })
  expect(root.querySelectorAll('.surfaces-canvas')).toHaveLength(2)
})

test('the contrast verdicts of the preview are Magma badges, not emoji', () => {
  const verdicts = ['success', 'warning', 'error']
  for (const canvas of root.querySelectorAll('.surfaces-canvas')) {
    // every text role carries its verdict
    for (const text of canvas.querySelectorAll('.surfaces-text'))
      expect(verdicts).toContain(text.querySelector('mds-badge')?.getAttribute('variant'))
    // a border of state carries one, a decorative border none
    const borders = [...canvas.querySelectorAll('.surfaces-border')]
    const strong = borders.find((border) => border.textContent?.includes('border strong'))!
    const muted = borders.find((border) => border.textContent?.includes('border muted'))!
    expect(verdicts).toContain(strong.querySelector('mds-badge')?.getAttribute('variant'))
    expect(muted.querySelector('mds-badge')).toBeNull()
  }
  expect(root.textContent).not.toMatch(/\u2705|\u26a0/u)
})
