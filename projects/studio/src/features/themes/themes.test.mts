import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { h, render } from 'preact'
import { act } from 'preact/test-utils'
import { within } from '@testing-library/preact'

import { validateTheme } from '@maggioli-design-system/design-tokens/src/lib/theme-manifest.mjs'
import { LangProvider } from '../../shared/i18n/i18n.js'
import type { StudioState } from '../../state/studio.js'
import { ThemesPage } from './themes.js'
import { inStudio, startStudio } from '../../../test/studio.mjs'

// The stage Themes (#1404; the Themes page of the Colors section until then): the themes in a list
// beside, the one at the centre with its verdict, its pairs and its fields in line, the scene of the
// product beside. jsdom does not upgrade the components of Magma: the test reads the markup the page
// writes and dispatches the events they emit. What the themes are and the CSS they print are tested
// in the engine (src/engine/theme-list.test.mts), the actions that move or delete a theme in the
// state (src/state/themes.test.mts).

const root = document.createElement('div')
document.body.append(root)

let studio: StudioState
let addresses: string[] = []

beforeEach(() => {
  vi.stubGlobal('fetch', () => Promise.reject(new Error('no server')))
  localStorage.clear()
  studio = startStudio()
  addresses = []
})
afterEach(() => {
  render(null, root)
  studio.dispose()
  localStorage.clear()
  vi.unstubAllGlobals()
})

const show = (theme?: string, lang: 'en' | 'it' = 'en') =>
  act(() => {
    render(
      h(
        LangProvider,
        { value: lang },
        inStudio(studio, h(ThemesPage, { theme, onTheme: (name: string) => addresses.push(name) })),
      ),
      root,
    )
  })

const emit = (element: Element, type: string, detail?: unknown) =>
  act(() => {
    element.dispatchEvent(new CustomEvent(type, { detail, bubbles: true }))
  })

/** The list of the themes: the complementary region named so (by its id in Italian). */
const list = () => root.querySelector<HTMLElement>('#themes-list')!
/** The groups of the list, each its heading and the themes under it, by name. */
const groups = () =>
  [...list().querySelectorAll('mds-text[tag="h2"]')].map((heading) => [
    heading.textContent,
    [...heading.parentElement!.querySelectorAll('li > mds-button')].map((one) => one.getAttribute('label')),
  ])
/** The name of the theme at the centre: its heading. */
const centre = () => root.querySelector('#themes-theme-title')?.textContent
/** A field of the theme at the centre, by its label. */
const field = (label: string) => root.querySelector(`main mds-input-field[label="${label}"]`)
/** The select of a field. */
const select = (label: string) => field(label)!.querySelector('mds-input-select')!

test('the list holds the ready themes, the base first, then the product\'s, each a link with its verdict', async () => {
  await show()
  expect(within(root).getByRole('complementary', { name: 'The themes of the preset' })).toBe(list())
  expect(groups()).toEqual([
    ['Ready themes', ['business', 'editorial']],
    ['Themes of the product', ['porcelain']],
  ])
  const links = [...list().querySelectorAll('li > mds-button')]
  expect(links.map((one) => one.getAttribute('href'))).toEqual([
    '#/themes/business',
    '#/themes/editorial',
    '#/themes/porcelain',
  ])
  // the theme at the centre, by default the base, marked in the list
  expect(links.map((one) => one.getAttribute('aria-current'))).toEqual(['page', null, null])
  // the verdict of each theme per mode, under its name
  expect(
    [...list().querySelectorAll('[role="group"]')].map((group) => group.getAttribute('aria-label')),
  ).toEqual([
    'The contrast gate on business',
    'The contrast gate on editorial',
    'The contrast gate on porcelain',
  ])
  // a new theme is born in the opening
  const born = [...list().querySelectorAll('mds-button')].find((one) => one.getAttribute('label') === 'New theme')
  expect(born?.getAttribute('href')).toBe('#/opening')
})

test('the theme at the centre is the one the address names, by its name or its family, else the base', async () => {
  await show('editorial')
  expect(centre()).toBe('editorial')
  await show('bisque')
  expect(centre()).toBe('editorial')
  await show('nowhere')
  expect(centre()).toBe('business')
})

test('what a theme is, under its name: the base on :root, a ready theme, a theme of the product', async () => {
  const line = () => root.querySelector('main mds-text[tag="p"].max-w-text:not(header *)')?.textContent
  await show()
  expect(line()).toBe('The base theme: the page wears it with no data-theme-name="business", in :root.')
  expect(root.querySelector('main mds-badge[label="base"]')).not.toBeNull()
  await show('editorial')
  expect(line()).toBe('A ready theme Magma ships: a page wears it with data-theme-name="editorial".')
  expect(root.querySelector('main mds-badge[label="ready"]')).not.toBeNull()
  await show('porcelain')
  expect(line()).toBe('A theme of the product: a page wears it with data-theme-name="porcelain".')
})

test('the pairs of the theme at the centre, counted with their verdict in a closed detail', async () => {
  await show('editorial')
  const details = root.querySelector('main mds-details[data-touched]')!
  expect(Number(details.getAttribute('data-touched'))).toBeGreaterThan(50)
  expect(details.hasAttribute('opened')).toBe(false)
  expect(details.querySelector('mds-badge')?.getAttribute('label')).toMatch(/^\d+ pairs of the theme$/)
  // every pair is of the theme at the centre
  for (const theme of details.querySelectorAll('li mds-text[typography="caption"]:first-child'))
    expect(theme.textContent).toBe('editorial')
})

test('a theme of the product takes its name in a field: the choice and the address follow', async () => {
  await show('porcelain')
  expect(field('Name')).not.toBeNull()
  const input = field('Name')!.querySelector('mds-input')!
  await emit(input, 'mdsInputChange', { value: 'cold-desk' })
  await emit(input, 'mdsInputBlur')
  expect(studio.themeChoices.value.names).toEqual({ porcelain: 'cold-desk' })
  expect(addresses).toEqual(['cold-desk'])
  // a name it cannot take says why, in the field and in the list
  await show('porcelain')
  await emit(input, 'mdsInputChange', { value: 'editorial' })
  await emit(input, 'mdsInputBlur')
  await show('porcelain')
  expect(field('Name')!.getAttribute('variant')).toBe('error')
  expect(field('Name')!.getAttribute('message')).toBe('editorial is a theme Magma ships: pick a name of your own')
  expect(list().textContent).toContain('Not painted until it has a name it can use')
  // the base and the ready themes have the name Magma gives them
  await show('editorial')
  expect(field('Name')).toBeNull()
})

test('the tint of a theme of the product is a select of the families; the base and the ready ones say why theirs is fixed', async () => {
  await show('porcelain')
  const tint = select('Tint')
  expect(tint.getAttribute('value')).toBe('tone.porcelain')
  const options = [...tint.querySelectorAll('option')].map((one) => one.value)
  expect(options).toContain('label.blue')
  expect(options).not.toContain('tone.bisque')
  expect(options.some((one) => one.startsWith('status.') || one.startsWith('variant.'))).toBe(false)
  // choosing moves the theme to the family, undone from a toast (state/themes.ts)
  await emit(tint, 'mdsInputSelectChange', { value: 'label.blue' })
  expect(studio.config.value.colors.find((one) => one.name === 'label.blue')?.surface).toBe(true)
  expect(studio.lastUndo.value?.said.text).toBe('The theme {theme} takes its tint from {family}.')

  await show('editorial')
  expect(field('Tint')).toBeNull()
  expect(root.querySelector('main')!.textContent).toContain(
    'The tint of a ready theme comes with its file: open it in the opening to make a theme of your own.',
  )
  await show()
  expect(root.querySelector('main')!.textContent).toContain('The tint of the base theme is the neutral family of Magma.')
})

test('each family the theme takes a colour from links to it in Colours, which shows it', async () => {
  await show('editorial')
  const links = [...root.querySelectorAll('main section mds-link')]
  // editorial points its accent at variant.secondary, as its file says
  expect(links.map((one) => one.closest('mds-text')?.textContent?.trim())).toEqual([
    'tone.bisque, in Colors The tint of a ready theme comes with its file: open it in the opening to make a theme of your own.',
    'variant.secondary, in Colors',
    'variant.ai, in Colors',
  ])
  for (const link of links) expect(link.getAttribute('href')).toBe('#/colours')
  await act(() => (links[0] as HTMLElement).click())
  expect(studio.selectedName.value).toBe('tone.bisque')
})

test('an accent is a select of the variants, its sample on the theme in light and in dark with the Lc', async () => {
  await show('editorial')
  const accent = select('Accent')
  // editorial points it at secondary, as its file says; the variant of the layer says it is the base
  expect(accent.getAttribute('value')).toBe('variant-secondary')
  expect([...accent.querySelectorAll('option')].find((one) => one.value === 'variant-primary')?.textContent).toBe(
    'primary (base)',
  )
  const samples = () => [...field('Accent')!.parentElement!.querySelectorAll('.themes-sample')]
  expect(samples().map((one) => one.getAttribute('data-mode'))).toEqual(['light', 'dark'])
  for (const sample of samples()) expect(sample.textContent).toMatch(/Lc \d+$/)
  await emit(accent, 'mdsInputSelectChange', { value: 'variant-primary' })
  expect(studio.themeChoices.value.accents).toEqual({ bisque: { accent: 'variant-primary' } })
  expect(select('Accent').getAttribute('value')).toBe('variant-primary')
})

// The colour modes of a theme (#1274): both unless the theme says one, as `color.modes` of the theme
// file. Each choice of the select is a list of modes the format takes.
test('the modes of a theme: each choice a value of color.modes; one mode turns the other tab of the scene off', async () => {
  await show('editorial')
  const modes = select('Modes')
  const choices = [...modes.querySelectorAll('option')]
  expect(choices.map((one) => one.textContent)).toEqual(['Light and dark', 'Light only', 'Dark only'])
  for (const { value } of choices) {
    const theme = { format: 1, name: 'night', color: { tint: 'bisque', modes: value.split(' ') } }
    expect(validateTheme(theme)).toEqual({ valid: true, errors: [] })
  }
  const tabs = () =>
    [...root.querySelectorAll('aside mds-tab[aria-label="Mode"] mds-tab-item')].map((one) => [
      one.getAttribute('value'),
      one.hasAttribute('disabled'),
      one.hasAttribute('selected'),
      one.getAttribute('title'),
    ])
  expect(tabs()).toEqual([
    ['light', false, true, null],
    ['dark', false, false, null],
  ])
  await emit(modes, 'mdsInputSelectChange', { value: 'dark' })
  expect(studio.themeChoices.value.modes).toEqual({ bisque: ['dark'] })
  expect(tabs()).toEqual([
    ['light', true, false, 'editorial is dark only'],
    ['dark', false, true, null],
  ])
})

test('the scene beside shows the theme in the mode of its tab, and with more contrast when asked', async () => {
  await show('editorial')
  const frame = () => root.querySelector('aside iframe')
  expect(frame()?.getAttribute('src')).toBe('scene.html')
  expect(frame()?.getAttribute('title')).toBe('The theme editorial on a page of a product, light mode')
  await emit(root.querySelector('aside mds-tab[aria-label="Mode"]')!, 'mdsTabChange', { id: 1, value: 'dark' })
  expect(frame()?.getAttribute('title')).toBe('The theme editorial on a page of a product, dark mode')
  const contrast = root.querySelector('aside mds-input-switch')!
  expect(contrast.textContent).toBe('More contrast')
  await emit(contrast, 'mdsInputSwitchChange', { checked: true })
  expect(contrast.hasAttribute('checked') || (contrast as { checked?: boolean }).checked).toBeTruthy()
})

test('a theme is deleted from its menu, undone from a toast; the base theme has no menu', async () => {
  await show()
  expect(root.querySelector('#themes-theme-actions')).toBeNull()
  await show('editorial')
  const remove = [...root.querySelectorAll('mds-dropdown mds-button')].find(
    (one) => one.getAttribute('label') === 'Delete theme',
  )!
  expect(remove.getAttribute('variant')).toBe('error')
  await act(() => (remove as HTMLElement).click())
  expect(studio.config.value.colors.find((one) => one.name === 'tone.bisque')?.surface).toBeFalsy()
  expect(studio.lastUndo.value?.said).toEqual({ text: 'The theme {theme} deleted.', vars: { theme: 'editorial' } })
  // the stage goes back to the base theme
  expect(addresses).toEqual([''])
})

test('in Italian the page speaks from its own catalogue, and the studio\'s for the shared words', async () => {
  await show('porcelain', 'it')
  expect(root.querySelector('main mds-text[tag="h1"]')?.textContent).toBe('Temi')
  expect(groups().map(([heading]) => heading)).toEqual(['Temi pronti', 'Temi del prodotto'])
  expect(field('Tinta')).not.toBeNull()
  expect(field('Accento AI')).not.toBeNull()
  expect(root.querySelector('aside mds-input-switch')?.textContent).toBe('Più contrasto')
})
