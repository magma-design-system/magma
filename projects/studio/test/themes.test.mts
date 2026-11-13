import { afterEach, expect, test, vi } from 'vitest'
import { h, render } from 'preact'
import { act } from 'preact/test-utils'
import { within } from '@testing-library/preact'

import initialConfig from '@maggioli-design-system/design-tokens/.magma-design-tokensrc.json'
import type { MagmaConfig } from '@maggioli-design-system/design-tokens/src/lib/color.mjs'
import { COLOR_MODES_PROPERTY, namedThemeCss, themeOf } from '@maggioli-design-system/design-tokens/semantic.model'
import { semantic } from '@maggioli-design-system/design-tokens/semantic.config'
import { validateTheme } from '@maggioli-design-system/design-tokens/src/lib/theme-manifest.mjs'
import { MODE_CHOICES, RESERVED_THEME_NAMES, ThemesManager, themeNameProblem } from '../src/themes.js'
import { resetThemeChoices } from '../src/theme-choices.js'

// The themes view of the studio: it builds the export CSS while rendering, so a throw anywhere
// in that path (e.g. a helper used but never imported) silently drops the whole block from the
// page. A theme has a name of its own, not the name of the family it is drawn from.

const root = document.createElement('div')
document.body.append(root)
afterEach(() => {
  render(null, root)
  resetThemeChoices()
})

const show = () => render(h(ThemesManager, { config: initialConfig as unknown as MagmaConfig }), root)

// The page found as a person reads it (#1398): the cards are the items of the list of the themes,
// a theme is named by the heading of its card, the rest by its text and the label of its field.

/** The cards of the themes, the base first: the items of the list of the page. */
const cardsOf = () => within(within(root).getByRole('list')).getAllByRole('listitem')
/** The name of the theme of a card: its heading. */
const nameOf = (card: Element) => card.querySelector('mds-text[tag="h2"]')?.textContent
/** The card of the theme of a name. */
const cardOf = (name: string) => cardsOf().find((card) => nameOf(card) === name)!
/** What a card says the theme is drawn from: `drawn from bisque`, the family in code. */
const familyOf = (card: HTMLElement) => within(card).getByText('drawn from')
/** How the theme switches in, in code: `:root` for the base, its attribute for any other. */
const attrOf = (card: HTMLElement) => within(card).getByText(/^(:root|data-theme-name=.*)$/).textContent
/** The field of a card by its label: `Name`, `Modes`, `Accent`. */
const fieldOf = (card: Element, label: string) => card.querySelector(`mds-input-field[label="${label}"]`)
/** The accents of a theme: the group its card names after it. */
const accentsOf = (card: HTMLElement) =>
  within(card).getByRole('group', { name: `The accents of ${nameOf(card)}` })
/** The CSS of the export: the block of code of the page. */
const exportOf = () => root.querySelector('pre')?.textContent ?? ''

const emit = (element: Element, type: string, detail: unknown) =>
  act(() => {
    element.dispatchEvent(new CustomEvent(type, { detail, bubbles: true }))
  })

test('the themes view renders a card per theme, the base first, each named apart from its family', () => {
  show()

  const cards = cardsOf()
  expect(cards.length).toBeGreaterThan(1)
  expect(attrOf(cards[0])).toBe(':root')
  expect(nameOf(cards[0])).toBe('business')
  expect(familyOf(cards[0]).textContent).toContain(semantic.tint)
  const editorial = cardOf('editorial')
  expect(familyOf(editorial).textContent).toContain('bisque')
  expect(attrOf(editorial)).toBe("data-theme-name='editorial'")
})

test('a theme is drawn from a family of any group, one created in the studio too, never from status', () => {
  const config = JSON.parse(JSON.stringify(initialConfig)) as MagmaConfig
  const blue = config.colors.find((color) => color.name === 'label.blue')!
  blue.surface = true
  config.colors.push({ ...blue, name: 'product.ocean' })
  render(h(ThemesManager, { config }), root)

  const families = cardsOf().map((card) => familyOf(card).textContent ?? '')
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

test('the export keeps its CSS closed under its header, and Copy CSS takes it closed', async () => {
  const writeText = vi.fn<(text: string) => Promise<void>>(async () => {})
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
  show()

  const details = within(root).getByText('The CSS of the themes').closest('mds-details')!
  expect(details.hasAttribute('opened')).toBe(false)
  expect(details.querySelector('[slot="title"]')?.textContent).toBe('The CSS of the themes')
  expect(details.querySelector('pre')?.textContent).toBe(exportOf())
  // the header and the copy stay in view, above what closes and outside it
  const head = within(root).getByText('Export', { selector: 'mds-text[tag="h2"]' })
  const copy = root.querySelector('mds-button[label="Copy CSS"]')!
  for (const kept of [head, copy]) {
    expect(details.contains(kept)).toBe(false)
    expect(kept.compareDocumentPosition(details) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  }

  await act(async () => {
    copy.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  })
  expect(writeText).toHaveBeenCalledWith(exportOf() + '\n')
  Reflect.deleteProperty(navigator, 'clipboard')
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
  const card = cardsOf().find((each) => fieldOf(each, 'Name') !== null)!
  const family = familyOf(card).querySelector('code')!.textContent!
  const input = fieldOf(card, 'Name')!.querySelector('mds-input')!
  expect(input.getAttribute('value')).toBe(family)

  await emit(input, 'mdsInputChange', { value: 'my-product ' })
  expect(attrOf(card)).toBe("data-theme-name='my-product'")
  expect(nameOf(card)).toBe('my-product')
  expect(exportOf()).toContain(":root[data-theme-name='my-product'] {")
  expect(fieldOf(card, 'Name')?.hasAttribute('variant')).toBe(false)

  // a name Magma ships is refused: the field says why, and the export carries the reason
  await emit(input, 'mdsInputChange', { value: 'editorial' })
  const field = fieldOf(card, 'Name')!
  expect(field.getAttribute('variant')).toBe('error')
  expect(field.querySelector('mds-input')?.getAttribute('aria-invalid')).toBe('true')
  expect(field.getAttribute('message')).toMatch(/Magma ships/)
  expect(exportOf()).toContain(`/* the theme drawn from ${family}: editorial is a theme Magma ships`)
})

test('an accent is a Magma select: another variant marks the override and repoints the export', async () => {
  show()

  // the field of the first accent role, its badge beside it
  const [accent] = [...accentsOf(cardOf('editorial')).querySelectorAll('mds-input-field')]
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
  expect(accent.parentElement?.querySelector('mds-badge')?.getAttribute('label')).toMatch(/override|changed/)
  expect(exportOf()).not.toBe(before)
})

// The canvas of Semantic surface (SurfaceCanvas, surfaces.tsx), found by its label, which names
// its mode and its colour and, for a mode out of use, says why: `light - canvas #f6f6f6 - not
// offered by the theme`. On it, each surface is its role then its colour in code (`sunken
// #f0f0f0`), each text role `text muted` with its colour, its Lc and its verdict.
const canvasesOf = (scope: HTMLElement) =>
  within(scope)
    .queryAllByText(/^\S+ - canvas\b/)
    .map((label) => {
      const [mode, , off] = (label.textContent ?? '').split(' - ')
      return { canvas: label.parentElement!, mode, off }
    })
const surfacesOf = (canvas: HTMLElement) =>
  within(canvas)
    .queryAllByText((text, element) => /^[a-z]+$/.test(text) && element?.firstElementChild?.tagName === 'CODE')
    .map((surface) => surface.textContent?.split(' ')[0])
const textRolesOf = (canvas: HTMLElement) => within(canvas).queryAllByText(/^text \S+$/)

test('a theme shows the canvas of Semantic surface per mode, its accents on each', () => {
  show()
  const card = cardsOf()[0]
  // two parts, the columns of its row: what the theme is with its settings, then its modes
  const [info, modes, ...more] = [...card.children] as HTMLElement[]
  expect(more).toEqual([])
  expect(info.contains(card.querySelector('mds-text[tag="h2"]'))).toBe(true)
  expect(info.contains(accentsOf(card))).toBe(true)
  expect(info.contains(fieldOf(card, 'Modes'))).toBe(true)
  expect(canvasesOf(info)).toEqual([])
  const canvases = canvasesOf(modes)
  expect(canvases.map(({ mode }) => mode)).toEqual(['light', 'dark'])
  for (const { canvas } of canvases) {
    expect(surfacesOf(canvas)).toEqual(['sunken', 'muted', 'raised', 'overlay'])
    // the verdicts of the text roles and the accents of the theme, on its own canvas
    expect(textRolesOf(canvas).filter((role) => role.querySelector('mds-badge')).length).toBeGreaterThan(0)
    for (const role of Object.keys(semantic.accents)) expect(within(canvas).queryByText(role)).not.toBeNull()
  }
})

// Each mode of a theme links to the Theme section, the theme in that mode (vittorio, 2026-11-07):
// the person tests the theme where it is shown on a product
const linksOf = (card: Element) => [...card.querySelectorAll('mds-button[href^="#/theme/"]')]
const testsOf = (card: Element) =>
  linksOf(card).map((link) => ({
    href: link.getAttribute('href'),
    label: link.getAttribute('label'),
    name: link.getAttribute('aria-label'),
  }))

test('each mode of a theme links to the Theme section, that theme in that mode', async () => {
  show()

  const editorial = cardOf('editorial')
  expect(testsOf(editorial)).toEqual([
    { href: '#/theme/editorial/light', label: 'Test in light', name: 'Test in light, editorial' },
    { href: '#/theme/editorial/dark', label: 'Test in dark', name: 'Test in dark, editorial' },
  ])
  // under the canvas of its mode, outside it: the canvas paints the colours of the theme
  const canvases = canvasesOf(editorial)
  for (const link of linksOf(editorial)) {
    const mode = link.getAttribute('href')?.split('/').pop()
    expect(link.previousElementSibling).toBe(canvases.find((canvas) => canvas.mode === mode)?.canvas)
    expect(canvases.some(({ canvas }) => canvas.contains(link))).toBe(false)
  }
  expect(testsOf(cardsOf()[0]).map(({ href }) => href)).toEqual(['#/theme/business/light', '#/theme/business/dark'])

  // a mode the theme does not offer: the section cannot show the theme in it, no link
  await emit(fieldOf(editorial, 'Modes')!.querySelector('mds-input-select')!, 'mdsInputSelectChange', {
    value: 'dark',
    values: ['dark'],
  })
  expect(testsOf(editorial).map(({ href }) => href)).toEqual(['#/theme/editorial/dark'])

  // a theme of the person links by the name given; a name the section refuses, no link at all
  const card = cardsOf().find((each) => fieldOf(each, 'Name') !== null)!
  const input = fieldOf(card, 'Name')!.querySelector('mds-input')!
  await emit(input, 'mdsInputChange', { value: 'my-product' })
  expect(testsOf(card).map(({ href }) => href)).toEqual(['#/theme/my-product/light', '#/theme/my-product/dark'])
  await emit(input, 'mdsInputChange', { value: 'editorial' })
  expect(testsOf(card)).toEqual([])
})

test('a family of any group opted into a surface is a theme, the ramp of its group in the export', () => {
  const config = JSON.parse(JSON.stringify(initialConfig)) as MagmaConfig
  config.colors.find((color) => color.name === 'label.violet')!.surface = true
  render(h(ThemesManager, { config }), root)

  const violet = cardsOf().find((card) => familyOf(card).textContent?.includes('violet'))
  expect(violet).toBeDefined()
  // its ramp is label-violet, not a tone-violet that does not exist
  const block = exportOf().match(/:root\[data-theme-name='violet'\] \{[^}]*\}/)?.[0] ?? ''
  expect(block).toContain('var(--label-violet-01)')
  expect(block).not.toContain('tone-violet')
})

test('a status family is no theme, not even one opted in on its own', () => {
  const families = () => cardsOf().map((card) => familyOf(card).textContent ?? '')
  show()
  expect(families().some((family) => family.includes('info'))).toBe(false)

  const config = JSON.parse(JSON.stringify(initialConfig)) as MagmaConfig
  config.colors.find((color) => color.name === 'status.info')!.surface = true
  render(h(ThemesManager, { config }), root)
  expect(families().some((family) => family.includes('info'))).toBe(false)
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

test('a theme of one mode dims the other in its preview and declares the mode in the export', async () => {
  show()

  const editorial = cardOf('editorial')
  const field = fieldOf(editorial, 'Modes')!
  const select = field.querySelector('mds-input-select')!
  // under the accents, in the same settings
  const accents = accentsOf(editorial)
  expect(accents.parentElement?.contains(field)).toBe(true)
  expect(accents.contains(field)).toBe(false)
  expect(accents.compareDocumentPosition(field) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  expect(select.getAttribute('value')).toBe('light dark')
  // the canvas of a mode the theme does not offer says so on its label
  const offOf = (card: HTMLElement) => canvasesOf(card).map(({ off }) => off)
  expect(offOf(editorial)).toEqual([undefined, undefined])
  const both = exportOf()
  expect(both).not.toContain(COLOR_MODES_PROPERTY)

  await emit(select, 'mdsInputSelectChange', { value: 'dark', values: ['dark'] })
  expect(select.getAttribute('value')).toBe('dark')
  const [light, dark] = canvasesOf(editorial)
  expect(light).toMatchObject({ mode: 'light', off: 'not offered by the theme' })
  expect(dark).toMatchObject({ mode: 'dark', off: undefined })
  // the block themes.css would print for the theme of one mode: the lock first, once
  const locked = namedThemeCss(themeOf('editorial', { ...(semantic.themes.editorial as object), modes: ['dark'] }))
  expect(locked).toMatch(new RegExp(`^:root\\[data-theme-name='editorial'\\] \\{\n  ${COLOR_MODES_PROPERTY}: dark;\n`))
  expect(exportOf()).toContain(locked)
  expect(exportOf().match(new RegExp(COLOR_MODES_PROPERTY, 'g'))).toHaveLength(1)
  // the other cards keep both
  for (const card of cardsOf().filter((card) => card !== editorial)) expect(offOf(card).some(Boolean)).toBe(false)

  // both again: no lock, nothing dimmed, the export as before
  await emit(select, 'mdsInputSelectChange', { value: 'light dark', values: ['light dark'] })
  expect(offOf(editorial)).toEqual([undefined, undefined])
  expect(exportOf()).toBe(both)
})

test('the base theme of one mode declares it under its own name, never in :root', async () => {
  show()

  const base = cardsOf()[0]
  const name = nameOf(base)!
  await emit(fieldOf(base, 'Modes')!.querySelector('mds-input-select')!, 'mdsInputSelectChange', {
    value: 'light',
    values: ['light'],
  })
  expect(canvasesOf(base).map(({ off }) => off)).toEqual([undefined, 'not offered by the theme'])
  // the base :root holds every theme: a lock there would reach the themes of both modes
  expect(exportOf()).toContain(`:root[data-theme-name='${name}'] {\n  ${COLOR_MODES_PROPERTY}: light;\n}`)
  expect(exportOf()).not.toMatch(new RegExp(`^:root \\{[^}]*${COLOR_MODES_PROPERTY}`, 'm'))
})
