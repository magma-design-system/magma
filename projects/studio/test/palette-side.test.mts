// @vitest-environment jsdom
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { h, render } from 'preact'

import initialConfig from '@maggioli-design-system/design-tokens/.magma-design-tokensrc.json'
import type { MagmaConfig } from '@maggioli-design-system/design-tokens/src/lib/color.mjs'
import { PaletteSide } from '../src/palette-side.js'
import { resetThemeChoices, updateThemeChoices } from '../src/theme-choices.js'

// The side of the Palette: the ramps of the family, or the theme on a page of a product, small as
// a phone, painted with the configuration at every change. jsdom does not upgrade the components:
// the test dispatches the events they emit and reads the markup the side writes.

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
const filters = () => [...root.querySelectorAll('.palette-side-head mds-filter')]
const choose = (filter: Element, value: string) =>
  filter.dispatchEvent(new CustomEvent('mdsFilterChange', { detail: { value }, bubbles: true }))

test('the side shows the ramps first, the theme in a frame on request, and remembers it', async () => {
  show('neutral')
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
  show('bisque')
  await vi.waitFor(() =>
    expect(root.querySelector('iframe')?.getAttribute('title')).toContain('The theme editorial'),
  )
  render(null, root)
  show('red')
  await vi.waitFor(() =>
    expect(root.querySelector('iframe')?.getAttribute('title')).toContain('The theme business'),
  )
})

test('a theme of one mode is seen in that mode only', async () => {
  localStorage.setItem('magma-studio:palette-side', 'theme')
  updateThemeChoices((prev) => ({ ...prev, modes: { bisque: ['dark'] } }))
  show('bisque')
  await vi.waitFor(() =>
    expect(root.querySelector('iframe')?.getAttribute('title')).toBe(
      'The theme editorial on a page of a product, dark mode',
    ),
  )
  const items = [...filters()[1].querySelectorAll('mds-filter-item')]
  expect(items.map((item) => [item.getAttribute('value'), item.hasAttribute('disabled')])).toEqual([
    ['light', true],
    ['dark', false],
  ])
  expect(items[0].getAttribute('title')).toBe('editorial is dark only')
})
