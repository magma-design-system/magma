// @vitest-environment jsdom
import { afterEach, expect, test } from 'vitest'
import { h, render } from 'preact'
import { act } from 'preact/test-utils'

import initialConfig from '@maggioli-design-system/design-tokens/.magma-design-tokensrc.json'
import type { MagmaConfig } from '@maggioli-design-system/design-tokens/src/lib/color.mjs'
import { COLOR_MODES_PROPERTY, namedThemeCss, themeOf } from '@maggioli-design-system/design-tokens/semantic.model'
import { semantic } from '@maggioli-design-system/design-tokens/semantic.config'
import { validateTheme } from '@maggioli-design-system/design-tokens/src/lib/theme-manifest.mjs'
import { MODE_CHOICES, RESERVED_THEME_NAMES, ThemesManager, themeNameProblem } from '../src/themes.js'

// The themes view of the studio: it builds the export CSS while rendering, so a throw anywhere
// in that path (e.g. a helper used but never imported) silently drops the whole block from the
// page. A theme has a name of its own, not the name of the family it is drawn from.

const root = document.createElement('div')
document.body.append(root)
afterEach(() => render(null, root))

const show = () => render(h(ThemesManager, { config: initialConfig as unknown as MagmaConfig }), root)

const cardsOf = () => [...root.querySelectorAll('.themes-grid > .themes-card')]
const exportOf = () => root.querySelector('.themes-export')?.textContent ?? ''
const emit = (element: Element, type: string, detail: unknown) =>
  act(() => {
    element.dispatchEvent(new CustomEvent(type, { detail, bubbles: true }))
  })

test('the themes view renders a card per theme, the base first, each named apart from its family', () => {
  show()

  const cards = cardsOf()
  expect(cards.length).toBeGreaterThan(1)
  expect(cards[0].querySelector('.themes-attr')?.textContent).toBe(':root')
  expect(cards[0].querySelector('.themes-name')?.textContent).toBe('business')
  expect(cards[0].querySelector('.themes-family')?.textContent).toContain(semantic.tint)
  const editorial = cards.find((card) => card.querySelector('.themes-name')?.textContent === 'editorial')
  expect(editorial?.querySelector('.themes-family')?.textContent).toContain('bisque')
  expect(editorial?.querySelector('.themes-attr')?.textContent).toBe("data-theme-name='editorial'")
})

test('a theme is drawn from a family of any group, one created in the studio too, never from status', () => {
  const config = JSON.parse(JSON.stringify(initialConfig)) as MagmaConfig
  const blue = config.colors.find((color) => color.name === 'label.blue')!
  blue.surface = true
  config.colors.push({ ...blue, name: 'product.ocean' })
  render(h(ThemesManager, { config }), root)

  const families = cardsOf().map((card) => card.querySelector('.themes-family')?.textContent ?? '')
  expect(families.some((family) => family.includes('blue'))).toBe(true)
  expect(families.some((family) => family.includes('ocean'))).toBe(true)
  // status carries surfaces (its group is on in the configuration), yet it is no theme
  expect(config.groups?.status?.surface).toBe(true)
  for (const status of ['info', 'success', 'error', 'warning']) {
    expect(families.some((family) => family.includes(status))).toBe(false)
  }

  // a family of another group repoints its own ramp, never a `tone-` ramp that does not exist
  const exported = exportOf()
  const block = (name: string) => exported.match(new RegExp(`:root\\[data-theme-name='${name}'\\] \\{[^}]*\\}`))?.[0] ?? ''
  expect(block('blue')).toContain('--label-blue-')
  expect(block('blue')).not.toContain('--tone-blue-')
  expect(block('ocean')).toContain('--product-ocean-')
})

test('the export repoints the tint ramp for every non-base theme', () => {
  show()

  const exported = exportOf()
  const blocks = exported.match(/:root\[data-theme-name='[^']+'\] \{[^}]*\}/g) ?? []
  expect(blocks.length).toBeGreaterThan(0)
  for (const block of blocks) expect(block).toContain('--magma-tint-scale-')
})

test('the export prints each theme as themes.css does: the shipped ones by their name and accents', () => {
  show()

  const exported = exportOf()
  const names = [...exported.matchAll(/^:root\[data-theme-name='([^']+)'\] \{/gm)].map((m) => m[1])
  expect(names).toContain('editorial')
  expect(names).not.toContain('bisque')
  // a theme Magma ships prints its block of themes.css; any other the family alone, by its name
  const expected = names.map((name) =>
    name in semantic.themes
      ? namedThemeCss(themeOf(name, semantic.themes[name]))
      : namedThemeCss(themeOf(name, { surface: name })),
  )
  expect(exported).toBe(expected.join('\n\n'))
  expect(exported).toContain(":root[data-theme-name='editorial'].pref-contrast-more {")
})

test('a theme of the person never takes a name Magma ships, nor a name already given', () => {
  for (const name of ['business', 'editorial', 'default', 'cool', 'warm'])
    expect(RESERVED_THEME_NAMES.has(name)).toBe(true)
  expect(themeNameProblem('editorial', 'porcelain', {})).toMatch(/Magma ships/)
  expect(themeNameProblem('My Theme', 'porcelain', {})).toMatch(/lowercase/)
  expect(themeNameProblem('studio', 'porcelain', { kaolin: 'studio' })).toMatch(/kaolin/)
  expect(themeNameProblem('my-product', 'porcelain', { porcelain: 'my-product' })).toBeNull()
})

test('a theme of the person takes its name in a Magma field, and the export follows the name', async () => {
  show()

  // a family Magma draws no theme from: named by the person, the family name until then
  const card = cardsOf().find((each) => each.querySelector('.themes-name-field') !== null)!
  const family = card.querySelector('.themes-family code')!.textContent!
  const input = card.querySelector('.themes-name-field mds-input')!
  expect(input.getAttribute('value')).toBe(family)

  await emit(input, 'mdsInputChange', { value: 'my-product ' })
  expect(card.querySelector('.themes-attr')?.textContent).toBe("data-theme-name='my-product'")
  expect(card.querySelector('.themes-name')?.textContent).toBe('my-product')
  expect(exportOf()).toContain(":root[data-theme-name='my-product'] {")
  expect(card.querySelector('.themes-name-field mds-input-field')?.hasAttribute('variant')).toBe(false)

  // a name Magma ships is refused: the field says why, and the export carries the reason
  await emit(input, 'mdsInputChange', { value: 'editorial' })
  const field = card.querySelector('.themes-name-field')!
  expect(field.querySelector('mds-input-field')?.getAttribute('variant')).toBe('error')
  expect(field.querySelector('mds-input')?.getAttribute('aria-invalid')).toBe('true')
  expect(field.querySelector('mds-input-field')?.getAttribute('message')).toMatch(/Magma ships/)
  expect(exportOf()).toContain(`/* the theme drawn from ${family}: editorial is a theme Magma ships`)
})

test('an accent is a Magma select: another variant marks the override and repoints the export', async () => {
  show()

  const editorial = cardsOf().find((card) => card.querySelector('.themes-name')?.textContent === 'editorial')!
  const [accent] = [...editorial.querySelectorAll('.themes-accent')]
  const select = accent.querySelector('mds-input-select')!
  const before = exportOf()
  const current = select.getAttribute('value')
  // a variant that is neither the current one nor the base of the role
  const other = [...select.querySelectorAll('option')]
    .filter((option) => !option.textContent?.endsWith('(base)'))
    .map((option) => option.value)
    .find((value) => value !== current)!

  await emit(select, 'mdsInputSelectChange', { value: other, values: [other] })
  expect(select.getAttribute('value')).toBe(other)
  expect(accent.querySelector('mds-badge')?.getAttribute('label')).toMatch(/override|changed/)
  expect(exportOf()).not.toBe(before)
})

test('a theme shows the canvas of Semantic surface per mode, its accents on each', () => {
  show()
  const card = root.querySelector('.themes-grid > .themes-card')!
  const canvases = [...card.querySelectorAll('.surfaces-canvas')]
  expect(canvases.map((one) => one.querySelector('.surfaces-canvas-label')?.textContent?.split(' ')[0])).toEqual([
    'light',
    'dark',
  ])
  for (const canvas of canvases) {
    const surfaces = [...canvas.querySelectorAll('.surfaces-box')].map((box) => box.textContent?.trim().split(' ')[0])
    expect(surfaces).toEqual(['sunken', 'muted', 'raised', 'overlay'])
    // the verdicts of the text roles and the accents of the theme, on its own canvas
    expect(canvas.querySelectorAll('.surfaces-text mds-badge').length).toBeGreaterThan(0)
    expect(canvas.querySelector('.themes-samples')).not.toBeNull()
  }
})

// The colour modes of a theme (#1274): both unless the theme says one, as `color.modes` of the theme
// file. Each choice of the select is a list of modes the format takes.
test('each choice of the modes is a value of color.modes in the theme format', () => {
  expect(MODE_CHOICES.map((choice) => choice.label)).toEqual(['Light and dark', 'Light only', 'Dark only'])
  for (const { value } of MODE_CHOICES) {
    const theme = { format: 1, name: 'night', color: { tint: 'bisque', modes: value.split(' ') } }
    expect(validateTheme(theme)).toEqual({ valid: true, errors: [] })
  }
})

const canvasesOf = (card: Element) =>
  [...card.querySelectorAll('.surfaces-canvas')].map((canvas) => ({
    mode: canvas.querySelector('.surfaces-canvas-label')?.textContent?.split(' ')[0],
    off: canvas.classList.contains('surfaces-canvas-off'),
    label: canvas.querySelector('.surfaces-canvas-label')?.textContent ?? '',
  }))

test('a theme of one mode dims the other in its preview and declares the mode in the export', async () => {
  show()

  const editorial = cardsOf().find((card) => card.querySelector('.themes-name')?.textContent === 'editorial')!
  const select = editorial.querySelector('.themes-modes-field mds-input-select')!
  // under the accents, in the same settings
  expect(select.closest('.themes-settings')?.querySelector('.themes-accents')).not.toBeNull()
  expect(select.getAttribute('value')).toBe('light dark')
  expect(canvasesOf(editorial).map(({ off }) => off)).toEqual([false, false])
  const both = exportOf()
  expect(both).not.toContain(COLOR_MODES_PROPERTY)

  await emit(select, 'mdsInputSelectChange', { value: 'dark', values: ['dark'] })
  expect(select.getAttribute('value')).toBe('dark')
  const [light, dark] = canvasesOf(editorial)
  expect(light).toMatchObject({ mode: 'light', off: true })
  expect(light.label).toContain('not offered by the theme')
  expect(dark).toMatchObject({ mode: 'dark', off: false })
  // the block themes.css would print for the theme of one mode: the lock first, once
  const locked = namedThemeCss(themeOf('editorial', { ...(semantic.themes.editorial as object), modes: ['dark'] }))
  expect(locked).toMatch(new RegExp(`^:root\\[data-theme-name='editorial'\\] \\{\n  ${COLOR_MODES_PROPERTY}: dark;\n`))
  expect(exportOf()).toContain(locked)
  expect(exportOf().match(new RegExp(COLOR_MODES_PROPERTY, 'g'))).toHaveLength(1)
  // the other cards keep both
  for (const card of cardsOf().filter((card) => card !== editorial))
    expect(canvasesOf(card).some(({ off }) => off)).toBe(false)

  // both again: no lock, nothing dimmed, the export as before
  await emit(select, 'mdsInputSelectChange', { value: 'light dark', values: ['light dark'] })
  expect(canvasesOf(editorial).map(({ off }) => off)).toEqual([false, false])
  expect(exportOf()).toBe(both)
})

test('the base theme of one mode declares it under its own name, never in :root', async () => {
  show()

  const base = cardsOf()[0]
  const name = base.querySelector('.themes-name')!.textContent!
  await emit(base.querySelector('.themes-modes-field mds-input-select')!, 'mdsInputSelectChange', {
    value: 'light',
    values: ['light'],
  })
  expect(canvasesOf(base).map(({ off }) => off)).toEqual([false, true])
  // the base :root holds every theme: a lock there would reach the themes of both modes
  expect(exportOf()).toContain(`:root[data-theme-name='${name}'] {\n  ${COLOR_MODES_PROPERTY}: light;\n}`)
  expect(exportOf()).not.toMatch(new RegExp(`^:root \\{[^}]*${COLOR_MODES_PROPERTY}`, 'm'))
})
