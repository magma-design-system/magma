import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { h, render } from 'preact'
import { act } from 'preact/test-utils'

import initialConfig from '@maggioli-design-system/design-tokens/.magma-design-tokensrc.json'
import type { MagmaConfig } from '@maggioli-design-system/design-tokens/src/lib/color.mjs'
import { COLORS_PAGES } from '../src/shared/routes/routes.js'
import { Studio } from '../src/app/shell.js'
import { DRAFT_STORAGE_KEY, hashText, type StudioDraft } from '../src/state/draft.js'
import { gateReport } from '../src/engine/gate.js'
import { ThemesManager } from '../src/themes.js'
import { inStudio, startStudio } from './studio.mjs'

// The contrast gate in the studio (#698): its verdict beside the title of every page of Colors
// and on each card of Themes, live while the configuration is edited; and an export that asks
// first while the gate fails, never handing out a failing theme by default. The Contrast check
// page, every pair per theme and mode, is tested beside it (src/features/contrast-check). jsdom does not upgrade the Magma
// components: the test reads the markup the studio writes and dispatches the events they emit.

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

/** The studio on a page of Colors, restored on a draft of a configuration. */
const openOn = async (draft: MagmaConfig, view = 'colours') => {
  storeDraft(draft, view)
  location.hash =
    view === 'colours'
      ? '#/colours'
      : `#/colors/${COLORS_PAGES.find((page) => page.id === view)!.slug}`
  render(h(Studio, {}), root)
  await vi.waitFor(() => {
    if (!root.querySelector('mds-text[tag="h1"]')) throw new Error('no page yet')
  })
}

const badgeOf = (scope: ParentNode | null | undefined) => {
  const badge = scope?.querySelector('mds-badge')
  return { variant: badge?.getAttribute('variant'), label: badge?.getAttribute('label') }
}
/** The card of a theme on the Contrast check page: the one its heading names. */
const themeCard = (theme: string) =>
  [...root.querySelectorAll('mds-card')].find(
    (card) => card.querySelector('mds-text[tag="h2"]')?.textContent === theme,
  )
/** The verdict of a theme per mode: the group of badges named after the theme. */
const themeVerdicts = (theme: string) =>
  [...root.querySelectorAll(`[role="group"][aria-label="The contrast gate on ${theme}"] mds-badge`)]
/** The head of the page of Colors shown: the header that holds its title. */
const pageHead = () => root.querySelector('mds-text[tag="h1"]')?.closest('header')
// over the whole document: the dialog of the gate opens on document.body
const magmaButton = (label: string) =>
  document.querySelector<HTMLElement>(`mds-button[label="${label}"]`)

test('the title of every page of Colors carries the verdict of the gate on the configuration edited', async () => {
  await openOn(config(), 'surface')
  expect(badgeOf(pageHead())).toEqual({ variant: 'success', label: 'All contrasts are OK' })
  render(null, root)

  await openOn(failing(), 'surface')
  const { variant, label } = badgeOf(pageHead())
  expect(variant).toBe('error')
  expect(label).toMatch(/^\d+ contrasts below target$/)
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

test('the dialog leads to every pair, on the Contrast check page', async () => {
  await openOn(failing())
  await runAction('zip')
  await act(() => magmaButton('See every pair')!.click())
  expect(document.querySelector('mds-modal')).toBeNull()
  expect(root.querySelector('h1, [tag="h1"]')?.textContent).toBe('Contrast check')
  for (const { name } of gateReport(failing()).themes) expect(themeCard(name), name).toBeDefined()
})

test('the Themes page says the verdict of each theme per mode, and its export asks through the gate', async () => {
  const report = gateReport(failing())
  const asked: Array<{ label: string; proceed: string }> = []
  render(
    inStudio(
      startStudio(),
      h(ThemesManager, {
        config: failing(),
        report,
        guard: ({ label, proceed }: { label: string; proceed: string }) => asked.push({ label, proceed }),
      }),
    ),
    root,
  )
  expect(themeVerdicts(report.themes[0].name).map((badge) => badge.getAttribute('label'))).toEqual([
    `light: ${report.themes[0].failing.light} below target`,
    `dark: ${report.themes[0].failing.dark} below target`,
  ])
  await act(() => magmaButton('Copy CSS')!.click())
  expect(asked).toEqual([{ label: 'Copy CSS', proceed: 'Copy anyway' }])
})
