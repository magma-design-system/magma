import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { h, render } from 'preact'
import { act } from 'preact/test-utils'

import initialConfig from '@maggioli-design-system/design-tokens/.magma-design-tokensrc.json'
import type { MagmaConfig } from '@maggioli-design-system/design-tokens/src/lib/color.mjs'
import { Studio } from '../src/app/shell.js'
import { DRAFT_STORAGE_KEY, hashText, type StudioDraft } from '../src/state/draft.js'
import { gateReport } from '../src/engine/gate.js'
import { updateConfig } from '../src/state/studio.js'
import { startStudio } from './studio.mjs'

// The contrast gate in the studio (#698): its verdict beside the title of every stage and per mode
// on each theme of Themes, live while the configuration is edited; an export that asks first while
// the gate fails, never handing out a failing theme by default; and a theme a change broke, said in
// a toast (#1404). The full review, every pair per theme and mode, is tested beside it
// (src/features/full-review). jsdom does not upgrade the Magma components: the test reads the
// markup the studio writes and dispatches the events they emit.

const root = document.createElement('div')
document.body.append(root)

beforeEach(() => {
  // not served by a command: the studio starts from the configuration it bundles
  vi.stubGlobal('fetch', () => Promise.reject(new Error('no server')))
  localStorage.clear()
})
afterEach(() => {
  render(null, root)
  localStorage.clear()
  vi.unstubAllGlobals()
  location.hash = ''
})

const config = () => JSON.parse(JSON.stringify(initialConfig)) as MagmaConfig
/**
 * Text pinned to the least contrasting step of each ramp, under the floors of the gate: the text
 * roles fail, in both modes. A target under the floors no longer fails: the engine holds every
 * role to its floor on the washes of its family, which brings it over the floors of the surfaces
 * too (#1414); a pinned step skips the search.
 */
const failing = () => {
  const low = config()
  low.theme!.text = { default: { step: 10 }, muted: { step: 10 }, subtle: { step: 10 }, disabled: { step: 10 } }
  return low
}

/** A draft of a configuration, made on the one the studio bundles: what a reload restores. */
const storeDraft = (draft: MagmaConfig, view = 'colors') => {
  const stored: StudioDraft = {
    config: draft as StudioDraft['config'],
    selectedName: 'tone.neutral',
    view,
    source: { path: null, hash: hashText(JSON.stringify(initialConfig)) },
    edited: true,
  }
  localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(stored))
}

/** An action of the menu of the exit of the bar, run as a click on its button. */
const runAction = (id: string) =>
  act(() => root.querySelector<HTMLElement>(`#studio-exit mds-button[data-action="${id}"]`)!.click())

/** The studio on a stage, restored on a draft of a configuration. */
const openOn = async (draft: MagmaConfig, view = 'colours') => {
  storeDraft(draft, view)
  location.hash = `#/${view}`
  render(h(Studio, {}), root)
  await vi.waitFor(() => {
    if (!root.querySelector('mds-text[tag="h1"]')) throw new Error('no page yet')
  })
}

const badgeOf = (scope: ParentNode | null | undefined) => {
  const badge = scope?.querySelector('mds-badge')
  return { variant: badge?.getAttribute('variant'), label: badge?.getAttribute('label') }
}
/** The themes the list of the full review names, by their headings. */
const reviewThemes = () =>
  [...root.querySelectorAll('#full-review-list mds-text[tag="h2"]')].map((one) => one.textContent)
/** The verdict of a theme per mode in a part of the page: the group of badges named after it. */
const themeVerdicts = (theme: string, scope = '') =>
  [...root.querySelectorAll(`${scope} [role="group"][aria-label="The contrast gate on ${theme}"] mds-badge`)]
/** The head of the page of Colors shown: the header that holds its title. */
const pageHead = () => root.querySelector('mds-text[tag="h1"]')?.closest('header')
// over the whole document: the dialog of the gate opens on document.body
const magmaButton = (label: string) =>
  document.querySelector<HTMLElement>(`mds-button[label="${label}"]`)

test('the title of every stage carries the verdict of the gate on the configuration edited', async () => {
  for (const view of ['weights', 'themes', 'full-review']) {
    await openOn(config(), view)
    expect(badgeOf(pageHead()), view).toEqual({ variant: 'success', label: 'All contrasts are OK' })
    render(null, root)

    await openOn(failing(), view)
    const { variant, label } = badgeOf(pageHead())
    expect(variant, view).toBe('error')
    expect(label, view).toMatch(/^\d+ contrasts below target$/)
    render(null, root)
  }
})

// #1402: the menu of Colors and its count of the pairs went with the stages; the verdict stays
// beside the title of every stage, and the exit of the bar asks while the gate fails
test('while the gate fails, the exit of the bar asks first, from any page', async () => {
  storeDraft(failing())
  location.hash = '#/theme'
  try {
    render(h(Studio, {}), root)
    const exit = await vi.waitFor(() => {
      const found = root.querySelector<HTMLElement>('#studio-exit')
      if (!found) throw new Error('no exit yet')
      return found
    })
    expect(root.querySelector('#studio-colors')).toBeNull()
    expect(exit.getAttribute('label') ?? (exit as { label?: string }).label).toBe('Download the preset')
    await act(() => {
      exit.dispatchEvent(new CustomEvent('mdsButtonDropdownClick'))
    })
    const dialog = await vi.waitFor(() => {
      const found = document.querySelector('mds-modal')
      if (!found) throw new Error('no dialog yet')
      return found
    })
    expect(dialog.textContent).toContain('Download the preset hands out')
    await act(() => magmaButton('Cancel')!.click())
    expect(document.querySelector('mds-modal')).toBeNull()
  } finally {
    location.hash = ''
  }
})

test('while the gate fails, an export asks first: Cancel never exports, the verb exports anyway', async () => {
  await openOn(failing())
  const files: string[] = []
  vi.stubGlobal('URL', Object.assign(Object.create(URL), {
    createObjectURL: () => 'blob:tokens',
    revokeObjectURL: () => undefined,
  }))
  const click = vi
    .spyOn(HTMLAnchorElement.prototype, 'click')
    .mockImplementation(function (this: HTMLAnchorElement) {
      files.push(this.download)
    })
  const download = () => runAction('zip')
  try {
    await download()
    const dialog = document.querySelector('mds-modal')!
    expect(dialog).not.toBeNull()
    expect(dialog.getAttribute('aria-label')).toMatch(/^Export with \d+ contrasts below target\?$/)
    expect(dialog.textContent).toContain('Download all tokens hands out a configuration that fails')
    // the first pairs, named by their theme, mode and measure
    expect(dialog.querySelector('mds-list mds-list-item')?.textContent).toMatch(
      /^business, light: text-\w+ on surface-\w+, Lc [\d.]+ under \d+$/,
    )
    expect(files).toEqual([])

    await act(() => magmaButton('Cancel')!.click())
    expect(document.querySelector('mds-modal')).toBeNull()
    expect(files).toEqual([])

    await download()
    await act(() => magmaButton('Download anyway')!.click())
    expect(document.querySelector('mds-modal')).toBeNull()
    expect(files).toEqual(['magma-design-tokens.zip'])

    // every way out asks: the exit of the bar, a download of its menu, the copy of the preset
    files.length = 0
    await act(() => {
      root.querySelector('#studio-exit')!.dispatchEvent(new CustomEvent('mdsButtonDropdownClick'))
    })
    expect(document.querySelector('mds-modal')?.textContent).toContain('Download the preset hands out')
    expect(files).toEqual([])
    await act(() => magmaButton('Cancel')!.click())
    await runAction('copy')
    expect(document.querySelector('mds-modal')?.textContent).toContain('Copy JSON hands out')
    expect(magmaButton('Copy anyway')).not.toBeNull()
  } finally {
    click.mockRestore()
  }
})

test('the dialog leads to every pair, on the full review', async () => {
  await openOn(failing())
  await runAction('zip')
  await act(() => magmaButton('See every pair')!.click())
  expect(document.querySelector('mds-modal')).toBeNull()
  await vi.waitFor(() => expect(root.querySelector('h1, [tag="h1"]')?.textContent).toBe('Full review'))
  expect(reviewThemes()).toEqual(gateReport(failing()).themes.map(({ name }) => name))
})

test('Themes says the verdict of each theme per mode, and the CSS of the themes asks through the gate', async () => {
  const report = gateReport(failing())
  await openOn(failing(), 'themes')
  const base = report.themes[0]
  // in the list beside, and again under the name of the theme at the centre
  for (const scope of ['#themes-list', 'main'])
    expect(themeVerdicts(base.name, scope).map((badge) => badge.getAttribute('label')), scope).toEqual([
      `light: ${base.failing.light} below target`,
      `dark: ${base.failing.dark} below target`,
    ])
  // the CSS of the themes leaves from the menu of the exit (#1404), through the gate like the rest
  await runAction('themes')
  expect(document.querySelector('mds-modal')?.textContent).toContain(
    'Download the CSS of the themes hands out',
  )
  expect(magmaButton('Download anyway')).not.toBeNull()
  await act(() => magmaButton('Cancel')!.click())
})

// #1404: the other themes say nothing until a change breaks one (studio.object-model.md, section 4,
// Tema); then a toast that stays names it and its mode, with the way to its item of the full review
// (message-placement, action-failed-elsewhere). A theme that failed already at the last exit is not
// broken by a change; the full review, which shows them all, has none.
test('a change that breaks a theme says so in a toast that stays, with the way to its item of the review', async () => {
  const studio = startStudio()
  location.hash = '#/weights'
  render(h(Studio, { state: studio }), root)
  await vi.waitFor(() => expect(root.querySelector('mds-text[tag="h1"]')).not.toBeNull())
  const toasts = () => [...document.querySelectorAll('mds-toast[data-broken]')]
  expect(toasts()).toEqual([])

  await act(() =>
    updateConfig(studio, (draft) => {
      draft.theme!.text = failing().theme!.text
    }),
  )
  const report = gateReport(failing())
  await vi.waitFor(() => expect(toasts().length).toBe(report.themes.length * 2))
  const editorial = toasts().find((one) => one.getAttribute('data-broken') === 'bisque|dark')!
  expect(editorial.getAttribute('variant')).toBe('error')
  expect(editorial.getAttribute('duration')).toBe('0')
  expect(editorial.hasAttribute('dismissible')).toBe(true)
  expect(editorial.textContent).toMatch(
    /^The theme editorial no longer passes the contrast check in dark: \d+ pairs under their floor\./,
  )
  expect(editorial.querySelector('mds-button[slot="action"]')?.getAttribute('href')).toBe(
    '#/full-review/editorial/dark',
  )

  // closed, it stays closed while the theme stays broken
  await act(() => {
    editorial.dispatchEvent(new CustomEvent('mdsToastClose'))
  })
  expect(toasts().some((one) => one.getAttribute('data-broken') === 'bisque|dark')).toBe(false)

  // the full review shows them all: no toast there
  location.hash = '#/full-review'
  await vi.waitFor(() => expect(toasts()).toEqual([]))

  // mended, nothing to say
  location.hash = '#/weights'
  await act(() =>
    updateConfig(studio, (draft) => {
      draft.theme!.text = config().theme!.text
    }),
  )
  await vi.waitFor(() => expect(toasts()).toEqual([]))
})

test('a theme that already failed at the last exit is broken by no change: no toast', async () => {
  storeDraft(failing())
  const studio = startStudio()
  // the preset opened is the one that fails: the changes, and the broken themes, count from it
  studio.baseline.value = JSON.stringify({ config: failing(), choices: studio.themeChoices.peek() })
  location.hash = '#/weights'
  render(h(Studio, { state: studio }), root)
  await vi.waitFor(() => expect(root.querySelector('mds-text[tag="h1"]')).not.toBeNull())
  expect(studio.verdict.value.state).toBe('fail')
  expect(document.querySelectorAll('mds-toast[data-broken]')).toHaveLength(0)
})
