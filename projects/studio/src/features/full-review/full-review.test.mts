import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { h, render } from 'preact'
import { act } from 'preact/test-utils'

import initialConfig from '@maggioli-design-system/design-tokens/.magma-design-tokensrc.json'
import type { MagmaConfig } from '@maggioli-design-system/design-tokens/src/lib/color.mjs'
import { gateReport } from '../../engine/gate.js'
import { LangProvider } from '../../shared/i18n/i18n.js'
import { setThemeAccent, setThemeModes } from '../../state/theme-choices.js'
import { updateConfig, type StudioState } from '../../state/studio.js'
import { inStudio, startStudio } from '../../../test/studio.mjs'
import { FullReviewPage } from './full-review.js'
import { GateDialog } from './gate-dialog.js'

// The full review (#1404; the Contrast check page of #698 and #1401 until then): every theme in
// every mode, an item of a list beside, marked as looked at until a change touches it, the item at
// the centre with its scene and its pairs in their groups; and the dialog an export opens while the
// gate fails, each in the language of the studio from the catalogue of the page. jsdom does not
// upgrade the Magma components: the test reads the markup the page writes and dispatches the
// events they emit. The items and the looks as data are tested in the engine
// (src/engine/review.test.mts); the verdict in the bar and the flow of an export are the shell's
// (test/contrast.test.mts).

const root = document.createElement('div')
document.body.append(root)

let studio: StudioState
let items: string[] = []

beforeEach(() => {
  vi.stubGlobal('fetch', () => Promise.reject(new Error('no server')))
  localStorage.clear()
  studio = startStudio()
  items = []
})
afterEach(() => {
  render(null, root)
  studio.dispose()
  localStorage.clear()
  vi.unstubAllGlobals()
})

const config = () => JSON.parse(JSON.stringify(initialConfig)) as MagmaConfig
/**
 * Text pinned to the least contrasting step of each ramp, under the floors of the gate: the text
 * roles fail, in both modes (a pinned step skips the search of the engine, #1414).
 */
const failing = () => {
  const low = config()
  low.theme!.text = { default: { step: 10 }, muted: { step: 10 }, subtle: { step: 10 }, disabled: { step: 10 } }
  return low
}

const show = (theme?: string, mode?: 'light' | 'dark', lang: 'en' | 'it' = 'en') =>
  act(() => {
    render(
      h(
        LangProvider,
        { value: lang },
        inStudio(
          studio,
          h(FullReviewPage, {
            theme,
            mode,
            onItem: (one: string, its: string) => items.push(`${one}/${its}`),
          }),
        ),
      ),
      root,
    )
  })

/** The list of the review: each theme by its heading, each of its modes with how it stands. */
const listed = () =>
  [...root.querySelectorAll('#full-review-list mds-text[tag="h2"]')].map((heading) => [
    heading.textContent,
    [...heading.parentElement!.querySelectorAll('li')].map(
      (li) =>
        `${li.querySelector('mds-button')?.getAttribute('label')} ${li.querySelector('mds-button')?.getAttribute('data-look')} ${li.querySelector('mds-badge')?.getAttribute('label')}`,
    ),
  ])
/** The item at the centre: its heading. */
const centre = () => root.querySelector('#full-review-item-title')?.textContent
/** How the review stands, the line under the title. */
const summary = () => root.querySelector('[data-summary]')?.textContent
/** A button of the item at the centre, by its label. */
const action = (label: string) =>
  [...root.querySelectorAll('main mds-button')].find((one) => one.getAttribute('label') === label) as
    | HTMLElement
    | undefined
/** The groups of the pairs of the item: their headings, and how many rows each table holds. */
const pairGroups = () =>
  [...root.querySelectorAll('[data-pairs]')].map(
    (group) =>
      `${group.querySelector('mds-text[tag="h3"]')?.textContent}:${group.querySelectorAll('mds-table-row').length}`,
  )

test('every theme in every mode it is used in is an item of the list, each with how it stands and what blocks', async () => {
  await show()
  expect(listed()).toEqual([
    ['business', ['Light open OK', 'Dark open OK']],
    ['porcelain', ['Light open OK', 'Dark open OK']],
    ['editorial', ['Light open OK', 'Dark open OK']],
  ])
  // each item a link to its address, named with how it stands, its icon a shape of its own
  const first = root.querySelector('#full-review-list li mds-button')!
  expect(first.getAttribute('href')).toBe('#/full-review/business/light')
  expect(first.getAttribute('aria-label')).toBe('business, light: not looked at')
  expect(first.getAttribute('icon')).toBe('mi/baseline/radio-button-unchecked')
  expect(summary()).toBe('0 of 6 looked at, none blocks the exit')

  // a theme of one mode has one item
  setThemeModes(studio, 'bisque', ['dark'])
  await show()
  expect(listed()[2]).toEqual(['editorial', ['Dark open OK']])
})

test('the item at the centre is the one the address names, else the first left to look at', async () => {
  await show('editorial', 'dark')
  expect(centre()).toBe('editorial, dark')
  expect(root.querySelector('#full-review-list li mds-button[aria-current="page"]')?.getAttribute('href')).toBe(
    '#/full-review/editorial/dark',
  )
  await show()
  expect(centre()).toBe('business, light')
})

test('its pairs in their groups: what blocks, what is reported, the debt; the scene of the theme in its mode', async () => {
  updateConfig(studio, (draft) => {
    draft.theme!.text = failing().theme!.text
  })
  await show('editorial', 'dark')
  const report = gateReport(failing())
  const editorial = report.themes.find((one) => one.name === 'editorial')!
  const count = (state: string) => editorial.pairs.filter((pair) => pair.cells.dark.state === state).length
  expect(pairGroups()).toEqual([
    `Blocking (${count('fail')}):${count('fail')}`,
    `Reported (${count('below')}):${count('below')}`,
    `Debt (${count('accepted')}):${count('accepted')}`,
  ])
  expect(count('fail')).toBeGreaterThan(0)
  // a row: the roles of the pair and its category, its target, its measure and verdict in the mode
  const row = root.querySelector('[data-pairs="blocking"] mds-table-row')!
  const cells = [...row.querySelectorAll('mds-table-cell')]
  expect(cells[0].textContent).toMatch(/^text-\w+ on [\w-]+/)
  expect(cells[1].textContent).toMatch(/^Lc \d+, enforced$/)
  expect(cells[2].querySelector('mds-badge')?.getAttribute('variant')).toBe('error')
  expect([...row.closest('mds-table')!.querySelectorAll('mds-table-header-cell')].map((one) => one.getAttribute('label')))
    .toEqual(['Pair', 'Target', 'Dark'])
  // the list says it blocks, the head that the exit is blocked
  expect(listed()[2][1]).toContain(`Dark open ${count('fail')} block`)
  expect(summary()).toBe('0 of 6 looked at, 6 block the exit')
  // the scene of the theme, in the mode of the item
  expect(root.querySelector('aside iframe')?.getAttribute('title')).toBe(
    'The theme editorial on a page of a product, dark mode',
  )
  // none of a group: it says so
  await show('business', 'light')
  updateConfig(studio, (draft) => {
    draft.theme!.text = config().theme!.text
  })
  await show('business', 'light')
  expect(root.querySelector('[data-pairs="blocking"]')?.textContent).toContain('No pair blocks.')
})

test('an item marked as looked at stays at the centre, offers the next one, and is taken back by the person', async () => {
  await show()
  await act(() => action('Mark as looked at')!.click())
  // the item stays where it is: its address is written in place
  expect(items).toEqual(['business/light'])
  await show('business', 'light')
  expect(centre()).toBe('business, light')
  expect(root.querySelector('main mds-badge[label="Looked at"]')).not.toBeNull()
  expect(listed()[0][1][0]).toBe('Light looked OK')
  expect(summary()).toBe('1 of 6 looked at, none blocks the exit')
  expect(action('Next to look at: business, dark')?.getAttribute('href')).toBe('#/full-review/business/dark')
  await act(() => action('Take the mark back')!.click())
  expect(listed()[0][1][0]).toBe('Light open OK')
})

test('a change that touches an item after the look takes the look back, and says so', async () => {
  await show('editorial', 'light')
  await act(() => action('Mark as looked at')!.click())
  await show('editorial', 'light')
  // the accent of editorial moves its pairs on the fills: the look goes
  setThemeAccent(studio, 'bisque', 'accent', 'variant-primary')
  await show('editorial', 'light')
  expect(listed()[2][1][0]).toBe('Light changed OK')
  expect(root.querySelector('main mds-badge[label="Changed after you looked"]')).not.toBeNull()
  expect(root.querySelector('main')!.textContent).toContain(
    'A change touched this theme in this mode after you looked at it: look at it again.',
  )
  expect(summary()).toBe('0 of 6 looked at, 1 changed after you looked, none blocks the exit')
  expect(action('Mark as looked at')).toBeDefined()
})

test('in Italian the page speaks from its own catalogue, and the studio\'s for the shared words', async () => {
  await show('business', 'light', 'it')
  expect(root.querySelector('main mds-text[tag="h1"]')?.textContent).toBe('Giro completo')
  expect(summary()).toBe("Guardati 0 su 6, nessuno blocca l'uscita")
  expect(centre()).toBe('business, chiaro')
  expect(pairGroups().map((one) => one.split(' (')[0])).toEqual(['Bloccano', 'Segnalate', 'Debito'])
  expect(action('Segna come guardato')).toBeDefined()
  expect(root.querySelector('aside mds-input-switch')?.textContent).toBe('Più contrasto')
})

// the dialog speaks from the catalogue of the page; the verb of the action from the studio's
test('the dialog of an export while the gate fails names the action, the pairs, and repeats its verb', () => {
  const report = gateReport(failing())
  const action = { label: 'Download all tokens', proceed: 'Download anyway', run: () => {} }
  const noop = () => {}
  render(
    h(LangProvider, { value: 'it' }, h(GateDialog, { action, report, onCancel: noop, onConfirm: noop, onReview: noop })),
    root,
  )
  const banner = root.querySelector('mds-banner')!
  expect(banner.getAttribute('headline')).toMatch(/^Esportare con \d+ contrasti sotto l'obiettivo\?$/)
  // five pairs named, the rest counted
  expect(root.querySelectorAll('mds-list-item')).toHaveLength(5)
  expect(root.textContent).toMatch(/e ancora \d+/)
  expect(
    [...root.querySelectorAll('mds-button[slot="action"]')].map((button) => button.getAttribute('label')),
  ).toEqual(['Annulla', 'Scarica comunque'])
})
