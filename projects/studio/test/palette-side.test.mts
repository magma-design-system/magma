// @vitest-environment jsdom
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { h, render } from 'preact'

import initialConfig from '@maggioli-design-system/design-tokens/.magma-design-tokensrc.json'
import type { MagmaConfig } from '@maggioli-design-system/design-tokens/src/lib/color.mjs'
import { translator } from '../src/i18n.js'
import { PaletteSide, paintsLine } from '../src/palette-side.js'
import { paintedBy } from '../src/paints.js'
import { sceneStyle } from '../src/scene-css.js'
import { resetThemeChoices, updateThemeChoices } from '../src/theme-choices.js'

// The side of the Palette: the ramps of the family, or the theme on a page of a product, small as
// a phone, painted with the configuration at every change, what the family paints first (#1308).
// jsdom does not upgrade the components nor loads the page of the frame: the test dispatches the
// events they emit and reads the markup the side writes.

const config = initialConfig as unknown as MagmaConfig
const root = document.createElement('div')
document.body.append(root)
beforeEach(() => localStorage.clear())
afterEach(() => {
  render(null, root)
  resetThemeChoices()
})

const show = (family: string) =>
  render(h(PaletteSide, { config, family, ramps: h('div', { class: 'palette-ramps' }) }), root)
const filters = () => [...root.querySelectorAll('.palette-side-head mds-tab')]
const choose = (filter: Element, value: string) =>
  filter.dispatchEvent(new CustomEvent('mdsTabChange', { detail: { id: 0, value }, bubbles: true }))

test('the side shows the ramps first, the theme in a frame on request, and remembers it', async () => {
  show('tone.neutral')
  expect(root.querySelector('.palette-ramps')).not.toBeNull()
  expect(root.querySelector('iframe')).toBeNull()
  expect(root.querySelector('.palette-side')?.getAttribute('data-show')).toBe('ramps')

  choose(filters()[0], 'theme')
  const frame = await vi.waitFor(() => {
    const found = root.querySelector('iframe.palette-side-frame')
    if (!found) throw new Error('no frame yet')
    return found
  })
  expect(frame.getAttribute('src')).toBe('scene.html')
  expect(frame.getAttribute('title')).toBe('The theme business on a page of a product, light mode')
  expect(localStorage.getItem('magma-studio:palette-side')).toBe('theme')
})

test('the frame shows the theme the family edited backs, else the base one', async () => {
  localStorage.setItem('magma-studio:palette-side', 'theme')
  show('tone.bisque')
  await vi.waitFor(() =>
    expect(root.querySelector('iframe')?.getAttribute('title')).toContain('The theme editorial'),
  )
  render(null, root)
  show('label.red')
  await vi.waitFor(() =>
    expect(root.querySelector('iframe')?.getAttribute('title')).toContain('The theme business'),
  )
})

test('a theme of one mode is seen in that mode only', async () => {
  localStorage.setItem('magma-studio:palette-side', 'theme')
  updateThemeChoices((prev) => ({ ...prev, modes: { bisque: ['dark'] } }))
  show('tone.bisque')
  await vi.waitFor(() =>
    expect(root.querySelector('iframe')?.getAttribute('title')).toBe(
      'The theme editorial on a page of a product, dark mode',
    ),
  )
  const items = [...filters()[1].querySelectorAll('mds-tab-item')]
  expect(items.map((item) => [item.getAttribute('value'), item.hasAttribute('disabled')])).toEqual([
    ['light', true],
    ['dark', false],
  ])
  expect(items[0].getAttribute('title')).toBe('editorial is dark only')
})

test('the side says what the family paints, and the elements the page puts first', async () => {
  localStorage.setItem('magma-studio:palette-side', 'theme')
  show('status.error')
  await vi.waitFor(() =>
    expect(root.querySelector('.palette-side-note')?.textContent).toBe(
      // jsdom loads no scene: no element of it is marked
      'error paints the variant error, which no element of the page takes.',
    ),
  )
  const painted = (family: string) =>
    paintedBy(family, { config, themes: sceneStyle(config)!.themes })
  const en = translator('en')
  expect(paintsLine(en, 'status.error', painted('status.error'), ['mds-banner', 'mds-input-field', 'mds-banner'])).toBe(
    'error paints the variant error, first in the page: banner and input field.',
  )
  expect(paintsLine(en, 'brand.maggioli', painted('brand.maggioli'), ['mds-button'])).toBe(
    'maggioli paints the variants primary and secondary through variant.primary, first in the page: button.',
  )
  // the neutral variants of a theme are its whole page: the line says the surfaces alone
  expect(paintsLine(en, 'tone.bisque', painted('tone.bisque'), [])).toBe(
    'bisque is the family of the theme editorial, whose surfaces are the whole page.',
  )
  // in Italian the line is put together from whole clauses, its lists joined by "e" (#1336)
  const it = translator('it')
  expect(paintsLine(it, 'brand.maggioli', painted('brand.maggioli'), ['mds-button', 'mds-banner'])).toBe(
    'maggioli dipinge le varianti primary e secondary tramite variant.primary, in testa alla pagina: button e banner.',
  )
  expect(paintsLine(it, 'status.error', painted('status.error'), [])).toBe(
    'error dipinge la variante error, che nessun elemento della pagina usa.',
  )
})

test('a family that paints nothing says so instead of a page that would not move', async () => {
  localStorage.setItem('magma-studio:palette-side', 'theme')
  show('brand.rnd')
  await vi.waitFor(() => expect(root.querySelector('.palette-side-none')).not.toBeNull())
  expect(root.querySelector('.palette-side-none')?.textContent?.replace(/\s+/g, ' ').trim()).toBe(
    'brand.rnd paints no component of Magma: no variant of a component takes it, no theme points an accent at it and no theme is drawn from it.',
  )
  expect(root.querySelector('iframe')).toBeNull()
  // no mode to choose for a page that is not there
  expect(filters()).toHaveLength(1)
})
