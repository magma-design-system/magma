import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { h, render } from 'preact'
import { act } from '@testing-library/preact'

import { LangProvider } from '../../shared/i18n/i18n.js'
import type { Route } from '../../shared/routes/routes.js'
import { bundled, updateConfig, type StudioState } from '../../state/studio.js'
import { inStudio, startStudio } from '../../../test/studio.mjs'
import { textOf } from '../../../test/text.mjs'
import { OpeningPage } from './opening.js'

// The opening (#1402, a page of features/): the starts as cards, the draft first when there is one,
// resuming it the main action; Magma's preset, or a preset of a project from its file; a ready theme
// with its look and its modes; a brand colour. Each start opens the preset and leads on to Colours.
// jsdom does not upgrade the Magma components: the tests read the markup the page writes.

const root = document.createElement('div')
document.body.append(root)
beforeEach(() => {
  vi.stubGlobal('fetch', () => Promise.reject(new Error('no server')))
  localStorage.clear()
})
afterEach(() => {
  render(null, root)
  vi.unstubAllGlobals()
})

/** The opening on a state, in a language, the addresses it leads to collected. */
function show (studio: StudioState, lang: 'en' | 'it' = 'en') {
  const opened: Route[] = []
  render(h(LangProvider, { value: lang }, inStudio(studio, h(OpeningPage, { onOpen: (route: Route) => void opened.push(route) }))), root)
  return opened
}
const cards = () => [...root.querySelectorAll('mds-card')]
const titles = () => cards().map((card) => card.querySelector('mds-text[tag="h2"]')?.textContent)
const button = (label: string) =>
  [...root.querySelectorAll<HTMLElement>('mds-button')].find((one) => textOf(one) === label)!
const colours: Route = { section: 'colours' }

test('the starts are cards in line, with no draft to resume when the work has no change', async () => {
  const studio = startStudio()
  show(studio)
  expect(root.querySelector('mds-text[tag="h1"]')?.textContent).toBe('Opening')
  expect(titles()).toEqual(["Magma's preset", 'A ready theme', 'A brand colour'])
  // no control of the stages, no verification: no stepper, no verdict
  expect(root.querySelector('mds-stepper-bar, mds-badge')).toBeNull()
})

test('the draft comes first, and resuming it is the main action, at the stage it was on', async () => {
  const studio = startStudio()
  updateConfig(studio, (draft) => {
    draft.smooth = true
  })
  studio.workPlace.value = '#/colors/semantic-surface'
  const opened = show(studio)
  expect(titles()[0]).toBe('Your draft')
  const draft = cards()[0]
  expect(draft.querySelector('mds-card-header mds-text[tag="p"]')?.textContent).toBe(
    '1 change since the last exit, on Weights.',
  )
  const resume = button('Resume on Weights')
  // the main action: the default tone, strong; the other starts weak
  expect([resume.getAttribute('variant'), resume.getAttribute('tone')]).toEqual([null, null])
  expect(button("Open Magma's preset").getAttribute('tone')).toBe('weak')
  resume.click()
  expect(opened).toEqual([{ section: 'colors', view: 'surface' }])
  // the work is not touched
  expect(studio.config.value.smooth).toBe(true)
})

test("Magma's preset opens on Colours", () => {
  const studio = startStudio()
  updateConfig(studio, (draft) => {
    draft.smooth = true
  })
  const opened = show(studio)
  button("Open Magma's preset").click()
  expect(studio.config.value).toEqual(bundled())
  expect(opened).toEqual([colours])
})

test('a ready theme shows its look and its modes, and opens a theme of the product on Colours', () => {
  const studio = startStudio()
  const opened = show(studio)
  const ready = cards().find((card) => card.querySelector('mds-text[tag="h2"]')?.textContent === 'A ready theme')!
  const rows = [...ready.querySelectorAll('mds-text[typography="label"]')].map((one) => [
    one.textContent,
    one.nextElementSibling?.textContent,
  ])
  expect(rows).toEqual([
    ['business', 'neutral, accent primary; light and dark'],
    ['editorial', 'bisque, accent secondary; light and dark'],
  ])
  // the colours of its tint and its accent, data painted inline
  const swatches = [...ready.querySelectorAll<HTMLElement>('span[aria-hidden="true"] > span')]
  expect(swatches).toHaveLength(4)
  for (const one of swatches) expect(one.style.background).not.toBe('')
  button('Start from editorial').click()
  expect(studio.selectedName.value).toBe('tone.myeditorial')
  expect(studio.themeChoices.value.names).toEqual({ myeditorial: 'my-editorial' })
  expect(opened).toEqual([colours])
})

test('a brand colour opens a theme of the product from the colour, on Colours', () => {
  const studio = startStudio()
  const opened = show(studio)
  const field = root.querySelector('mds-input[type="color"]')!
  expect(field.closest('mds-input-field')?.getAttribute('label')).toBe('Brand colour')
  field.dispatchEvent(new CustomEvent('mdsInputChange', { detail: { value: '#aa3311' } }))
  return act(() => undefined).then(() => {
    button('Start from this colour').click()
    const brand = studio.selectedName.value
    expect(brand).toMatch(/^brand\./)
    expect(studio.config.value.colors.find(({ name }) => name === brand)?.color).toBe('#aa3311')
    expect(opened).toEqual([colours])
  })
})

test('the preset of a project opens from its file; one the schema refuses stays, the page says why', async () => {
  const studio = startStudio()
  const opened = show(studio)
  const picker = root.querySelector<HTMLInputElement>('input[type="file"]')!
  const clicked = vi.spyOn(picker, 'click').mockImplementation(() => undefined)
  button('Import a preset').click()
  expect(clicked).toHaveBeenCalled()
  const pick = async (text: string) => {
    // a file as the state reads it: its name and its text (jsdom's File has no text())
    Object.defineProperty(picker, 'files', {
      configurable: true,
      value: [{ name: 'product.json', text: async () => text }],
    })
    await act(async () => {
      picker.dispatchEvent(new Event('change'))
      await new Promise((done) => setTimeout(done, 0))
    })
  }
  const product = { ...bundled(), smooth: true }
  await pick(JSON.stringify(product))
  await vi.waitFor(() => expect(opened).toEqual([colours]))
  expect(studio.config.value).toEqual(product)
  await pick('{ "colors": [] }')
  await vi.waitFor(() =>
    expect(root.querySelector('mds-banner[variant="error"]')?.textContent).toMatch(/^Could not load product.json/),
  )
  expect(opened).toEqual([colours])
})

test('the opening speaks Italian from its own catalogue', () => {
  show(startStudio(), 'it')
  expect(root.querySelector('mds-text[tag="h1"]')?.textContent).toBe('Partenza')
  expect(titles()).toEqual(['Il preset di Magma', 'Un tema pronto', 'Un colore di brand'])
  expect(button('Parti da editorial')).toBeDefined()
  expect(button('Importa un preset')).toBeDefined()
})
