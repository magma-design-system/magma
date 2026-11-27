import { afterEach, expect, test, vi } from 'vitest'
import { h, render } from 'preact'
import { act } from 'preact/test-utils'

import { TEXT_ROLES } from '@maggioli-design-system/design-tokens/src/lib/text-role.mjs'
import { DEFAULT_TARGETS } from '@maggioli-design-system/design-tokens/src/lib/contrast-gate.js'
import { WeightsPage } from './weights.js'
import { LangProvider } from '../../shared/i18n/i18n.js'
import { updateConfig, type StudioState } from '../../state/studio.js'
import { inStudio, startStudio } from '../../../test/studio.mjs'
import { textOf } from '../../../test/text.mjs'

// The stage Weights (#1403; Semantic surface until then) answers to the controls of Magma: the tabs
// of the modes, the sliders of the surfaces, the borders and the texts, the pairs they touch and the
// scene beside. jsdom does not upgrade the components: the test dispatches the events they emit and
// reads the state of the studio.

const root = document.createElement('div')
document.body.append(root)
afterEach(() => {
  render(null, root)
  localStorage.clear()
  vi.unstubAllGlobals()
})

const SLOW = { timeout: 10_000 }

/** The stage on a state of its own, not served by a command, in a language. */
function show (lang: 'en' | 'it' = 'en'): StudioState {
  vi.stubGlobal('fetch', () => Promise.reject(new Error('no server')))
  const studio = startStudio()
  render(h(LangProvider, { value: lang }, inStudio(studio, h(WeightsPage, null))), root)
  return studio
}

const emit = (element: Element, type: string, detail: unknown) =>
  act(() => {
    element.dispatchEvent(new CustomEvent(type, { detail, bubbles: true }))
  })
// a slider is named by its text (magma.tsx, Range)
const sliders = () => [...root.querySelectorAll('mds-input-range')]
const slider = (name: string) => sliders().find((one) => textOf(one) === name)!
const valueOf = (name: string) => slider(name)?.getAttribute('value')
const tab = (value: string) => root.querySelector(`mds-tab-item[value="${value}"]`)!
const chooseMode = (value: string) => emit(root.querySelector('mds-tab')!, 'mdsTabChange', { id: 0, value })
const theme = (studio: StudioState) => studio.config.value.theme!

test('one mode at a time: the tab chooses the sliders of the surfaces and the borders', async () => {
  show()
  expect(root.querySelector('h1, mds-text[tag="h1"]')?.textContent).toBe('Weights')
  expect(tab('light').hasAttribute('selected')).toBe(true)
  // five surfaces and three borders in the mode of the tab, four texts for both modes
  expect(sliders().map(textOf)).toEqual([
    'Surfaces sunken, light', 'Surfaces muted, light', 'Surfaces default, light',
    'Surfaces raised, light', 'Surfaces overlay, light',
    'Borders muted, light', 'Borders default, light', 'Borders strong, light',
    ...TEXT_ROLES.map((role) => `Text ${role}, target`),
  ])
  expect(valueOf('Surfaces default, light')).toBe('96')

  await chooseMode('dark')
  expect(tab('dark').hasAttribute('selected')).toBe(true)
  expect(valueOf('Surfaces default, dark')).toBe('22')
  expect(slider('Surfaces default, light')).toBeUndefined()
  // the targets of the texts stand the same under either tab
  expect(slider('Text muted, target')).toBeDefined()
})

// an mds-input-range kept across the tabs takes the level of the other mode with the bounds of this
// one, clamps it and hands it back as a change: every surface went to 50% in the browser
test('the sliders of a mode are its own: the tab mounts them anew, the levels untouched', async () => {
  const studio = show()
  const before = slider('Surfaces default, light')
  const borders = slider('Borders strong, light')
  await chooseMode('dark')
  await chooseMode('light')
  expect(slider('Surfaces default, light')).not.toBe(before)
  expect(slider('Borders strong, light')).not.toBe(borders)
  // and the weights are those the preset had
  expect(theme(studio)).toEqual(startStudio().config.value.theme)
})

test('a slider writes the level of its role in the mode of the tab, a text target for both', async () => {
  const studio = show()
  await emit(slider('Surfaces default, light'), 'mdsInputRangeChange', 97)
  expect(theme(studio).surfaces.light.default).toBe('97%')
  await chooseMode('dark')
  await emit(slider('Borders strong, dark'), 'mdsInputRangeChange', 80)
  expect(theme(studio).borders.dark.strong).toBe('80%')
  expect(theme(studio).borders.light.strong).toBe('64%')
  await emit(slider('Text muted, target'), 'mdsInputRangeChange', 70)
  expect(theme(studio).text?.muted).toBe(70)
})

test('a surface moved past its neighbour pushes it along: the order of depth holds', async () => {
  const studio = show()
  await emit(slider('Surfaces sunken, light'), 'mdsInputRangeChange', 98)
  expect(theme(studio).surfaces.light).toEqual({
    sunken: '98%', muted: '98%', default: '98%', raised: '98%', overlay: '100%',
  })
  // the sliders it pushed show their new level
  expect(valueOf('Surfaces muted, light')).toBe('98')
  // and down: overlay under raised brings raised along
  await emit(slider('Surfaces overlay, light'), 'mdsInputRangeChange', 90)
  expect(Object.values(theme(studio).surfaces.light)).toEqual(['90%', '90%', '90%', '90%', '90%'])
  // equal surfaces are allowed: nothing is flagged
  expect(root.querySelector('mds-banner')).toBeNull()
})

test('a preset loaded out of order is flagged, until a slider puts it back in order', async () => {
  const studio = show()
  updateConfig(studio, (draft) => {
    draft.theme!.surfaces.light.sunken = '98%'
    draft.theme!.surfaces.light.muted = '90%'
  })
  await vi.waitFor(() => expect(root.querySelector('mds-banner')).not.toBeNull())
  const banner = root.querySelector('mds-banner')!
  expect(banner.getAttribute('headline')).toBe('1 surface is lighter than the one above it')
  expect(banner.querySelector('li')?.textContent).toBe('sunken at 98 over muted at 90')
  // the other mode is in order
  await chooseMode('dark')
  expect(root.querySelector('mds-banner')).toBeNull()
  await chooseMode('light')
  await emit(slider('Surfaces muted, light'), 'mdsInputRangeChange', 95)
  expect(theme(studio).surfaces.light.sunken).toBe('95%')
  expect(root.querySelector('mds-banner')).toBeNull()
})

test('beside each text target, the floor of the check, and a mark when the target is under it', async () => {
  show()
  const floors = [...root.querySelectorAll('mds-text')]
    .map((text) => text.textContent)
    .filter((text) => /^floor \d+$/.test(text ?? ''))
  expect(floors).toEqual(TEXT_ROLES.map((role) => `floor ${DEFAULT_TARGETS.text[role]}`))
  const marks = () => root.querySelectorAll('mds-badge[label="under the floor"]').length
  const before = marks()
  await emit(slider('Text default, target'), 'mdsInputRangeChange', DEFAULT_TARGETS.text.default - 10)
  expect(marks()).toBe(before + 1)
  await emit(slider('Text default, target'), 'mdsInputRangeChange', DEFAULT_TARGETS.text.default)
  expect(marks()).toBe(before)
})

test('the pairs the weights of the mode touch, counted in a closed detail, measured again per mode', async () => {
  show()
  const touched = () => root.querySelector('[data-touched]')
  await vi.waitFor(() => expect(Number(touched()?.getAttribute('data-touched'))).toBeGreaterThan(50), SLOW)
  const details = touched()!
  expect(details.localName).toBe('mds-details')
  expect(details.hasAttribute('opened')).toBe(false)
  // every pair listed names its state in the mode of the tab only
  // the verdict of the title names the mode measured
  expect(details.querySelector('[slot="title"]')?.textContent).toBe('all above their floor, in light')
  const items = [...details.querySelectorAll('li')]
  expect(items.every((item) => item.textContent?.includes('Light: ') && !item.textContent.includes('Dark: '))).toBe(true)
  await chooseMode('dark')
  await vi.waitFor(() => {
    const listed = [...(touched()?.querySelectorAll('li') ?? [])]
    expect(listed.length).toBeGreaterThan(50)
    expect(listed.every((item) => item.textContent?.includes('Dark: '))).toBe(true)
  }, SLOW)
  expect(touched()?.querySelector('[slot="title"]')?.textContent).toBe('all above their floor, in dark')
}, 30_000)

test('the scene beside is the base theme, in the mode of the tab', async () => {
  show()
  const line = () => root.querySelector('[data-scene-line]')?.textContent
  await vi.waitFor(() => expect(line()).toBe('The scene of the product, in the theme business, in light: it follows the tab.'))
  expect(root.querySelector('iframe')?.getAttribute('src')).toBe('scene.html')
  expect(root.querySelector('iframe')?.getAttribute('title')).toBe('The product in the theme business, light mode')
  await chooseMode('dark')
  expect(line()).toBe('The scene of the product, in the theme business, in dark: it follows the tab.')
  expect(root.querySelector('iframe')?.getAttribute('title')).toBe('The product in the theme business, dark mode')
})

test('the stage speaks the language of the studio', async () => {
  show('it')
  expect(root.querySelector('mds-text[tag="h1"]')?.textContent).toBe('Pesi')
  expect([...root.querySelectorAll('mds-tab-item')].map((item) => item.getAttribute('label'))).toEqual(['Chiaro', 'Scuro'])
  expect(valueOf('Superfici default, chiaro')).toBe('96')
  expect(slider('Testo muted, obiettivo')).toBeDefined()
  expect(root.textContent).toContain('luminosità in chiaro, 85-100')
  expect(root.textContent).toContain('il canvas della pagina')
})
