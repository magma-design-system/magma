import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { h, render } from 'preact'
import { act } from 'preact/test-utils'

import initialConfig from '@maggioli-design-system/design-tokens/.magma-design-tokensrc.json'
import type { MagmaConfig } from '@maggioli-design-system/design-tokens/src/lib/color.mjs'
import { App } from '../src/app.js'
import type { ConfigAction } from '../src/config-menu.js'
import { Studio } from '../src/shell.js'
import { ContrastCheck } from '../src/contrast.js'
import { DRAFT_STORAGE_KEY, hashText, type StudioDraft } from '../src/draft.js'
import { gateReport, type GateReport } from '../src/gate.js'
import { NO_THEME_CHOICES, resetThemeChoices } from '../src/theme-choices.js'
import { ThemesManager } from '../src/themes.js'
import { textOf } from './text.mjs'

// The contrast gate in the studio (#698): every pair it judges, per theme and per mode, on the
// Contrast check page; its verdict beside the title of every page of Colors and on each card of
// Themes, live while the configuration is edited; and an export that asks first while the gate
// fails, never handing out a failing theme by default. jsdom does not upgrade the Magma
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
  resetThemeChoices()
  localStorage.clear()
  vi.unstubAllGlobals()
})

const config = () => JSON.parse(JSON.stringify(initialConfig)) as MagmaConfig
/** Text targets under the floors of the gate: the text roles fail, in both modes. */
const failing = () => {
  const low = config()
  low.theme!.text = { default: 20, muted: 15, subtle: 10, disabled: 5 }
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

/** The pages of Colors restored on a draft of a configuration. */
// the actions of the Config menu of the bar, as the App hands them to it
let actions: ConfigAction[] = []
const runAction = (id: string) => act(() => actions.find((action) => action.id === id)!.run())

const openOn = async (draft: MagmaConfig, view = 'colors') => {
  storeDraft(draft, view)
  actions = []
  render(h(App, { onConfigActions: (handed: ConfigAction[]) => (actions = handed) }), root)
  await vi.waitFor(() => {
    if (!root.querySelector('mds-text[tag="h1"]')) throw new Error('no page yet')
    // handed by an effect, after the paint
    if (!actions.length) throw new Error('no actions yet')
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
/** The row of a pair in the card of a theme, found by the pair its first cell names. */
const row = (theme: string, pair: string) =>
  [...(themeCard(theme)?.querySelectorAll('mds-table-row') ?? [])].find(
    (one) => one.querySelector('mds-table-cell')?.textContent === pair,
  )
/** The verdict of a pair in a mode: its cell in the column the table heads with the mode. */
const cell = (theme: string, pair: string, mode: 'Light' | 'Dark') => {
  const found = row(theme, pair)
  const heads = [...(found?.closest('mds-table')?.querySelectorAll('mds-table-header-cell') ?? [])]
  const column = heads.findIndex((head) => head.getAttribute('label') === mode)
  return badgeOf(found?.querySelectorAll('mds-table-cell')[column])
}
/** The head of the page of Colors shown: the header that holds its title. */
const pageHead = () => root.querySelector('mds-text[tag="h1"]')?.closest('header')
const show = (report: GateReport) => render(h(ContrastCheck, { report }), root)
// over the whole document: the dialog of the gate opens on document.body
const magmaButton = (label: string) =>
  document.querySelector<HTMLElement>(`mds-button[label="${label}"]`)

test('the Contrast check page shows every pair of every theme, its two modes side by side', () => {
  const report = gateReport(config())
  show(report)
  const cards = [...root.querySelectorAll('mds-card')]
  expect(cards.map((card) => card.querySelector('mds-text[tag="h2"]')?.textContent)).toEqual([
    'business',
    'porcelain',
    'editorial',
  ])
  // a table per category of the gate, a row per pair, in the order the gate measures them
  const business = themeCard('business')!
  expect([...business.querySelectorAll('h3, [tag="h3"]')].map(
    (title) => title.textContent,
  )).toEqual([
    'Text on the surfaces',
    'Text on the solid fills',
    'Text of a hue on its washes',
    'Text on the neutral washes',
    'Coloured text on the surfaces',
    'Borders on the surfaces',
  ])
  expect(business.querySelectorAll('mds-table-row').length).toBe(report.themes[0].pairs.length)
  // the measure and the verdict of a pair in each mode, the target it is held to
  const muted = 'text-muted on surface-raised'
  expect(cell('business', muted, 'Light')).toEqual({ variant: 'success', label: 'OK' })
  expect(cell('business', muted, 'Dark')).toEqual({ variant: 'success', label: 'OK' })
  expect(row('business', muted)!.textContent).toContain('Lc 75, enforced')
  expect(row('business', 'accent-on-emphasis on accent-emphasis')!.textContent).toContain(
    'Lc 75 light, 70 dark, enforced',
  )
  expect(row('business', 'border-muted on surface-default')!.textContent).toContain('no floor')
  expect(root.querySelector('[role="status"]')?.textContent).toMatch(/^Every enforced pair meets its target/)
})

test('a pair under its target says so in the mode it fails, and the switch keeps only those', async () => {
  const report = gateReport(failing())
  show(report)
  expect(root.querySelector('[role="status"]')?.textContent).toMatch(
    /pairs below target: the build of Magma would refuse this configuration/,
  )
  expect(cell('business', 'text-muted on surface-raised', 'Light')).toEqual({
    variant: 'error',
    label: 'under Lc 75',
  })
  // each card says how many pairs fail, per mode
  const verdicts = themeVerdicts('business')
  expect(themeCard('business')?.contains(verdicts[0] ?? null)).toBe(true)
  expect(verdicts.map((badge) => badge.getAttribute('label'))).toEqual([
    `light: ${report.themes[0].failing.light} below target`,
    `dark: ${report.themes[0].failing.dark} below target`,
  ])

  const all = root.querySelectorAll('mds-table-row').length
  await act(() => {
    root.querySelector('mds-input-switch')!.dispatchEvent(
      new CustomEvent('mdsInputSwitchChange', { detail: { checked: true }, bubbles: true }),
    )
  })
  const kept = [...root.querySelectorAll('mds-table-row')]
  expect(kept.length).toBeGreaterThan(0)
  expect(kept.length).toBeLessThan(all)
  for (const one of kept) {
    const variants = [...one.querySelectorAll('mds-badge')].map((badge) => badge.getAttribute('variant'))
    expect(variants.some((variant) => ['error', 'warning', 'info'].includes(variant!))).toBe(true)
  }
})

test('a mode a theme is not offered in is measured, not judged', () => {
  show(gateReport(failing(), { ...NO_THEME_CHOICES, modes: { neutral: ['light'] } }))
  expect(cell('business', 'text-muted on surface-raised', 'Light').variant).toBe('error')
  expect(cell('business', 'text-muted on surface-raised', 'Dark')).toEqual({
    variant: 'dark',
    label: 'not offered',
  })
  const verdicts = themeVerdicts('business')
  expect(verdicts.at(-1)?.getAttribute('label')).toBe('dark: not offered')
})

test('the title of every page of Colors carries the verdict of the gate on the configuration edited', async () => {
  await openOn(config(), 'surface')
  expect(badgeOf(pageHead())).toEqual({ variant: 'success', label: 'All contrasts are OK' })
  render(null, root)

  await openOn(failing(), 'surface')
  const { variant, label } = badgeOf(pageHead())
  expect(variant).toBe('error')
  expect(label).toMatch(/^\d+ contrasts below target$/)
})

test('the Colors section counts the pairs that fail, in the bar, in view wherever the work is', async () => {
  storeDraft(failing())
  location.hash = '#/theme'
  try {
    render(h(Studio, {}), root)
    const verdict = gateReport(failing()).verdict
    const notification = await vi.waitFor(() => {
      const found = root.querySelector('#studio-colors mds-notification[slot="notification"]')
      if (!found) throw new Error('no count yet')
      return found
    })
    expect(verdict.state === 'fail' && String(verdict.violations)).toBe(notification.getAttribute('value'))
    expect(notification.getAttribute('max')).toBe('99')
    // the name of the section stays its own: the count is read with it, not in place of it
    expect(textOf(root.querySelector('#studio-colors'))).toBe('Colors')

    // a configuration that passes shows no count
    render(null, root)
    localStorage.clear()
    render(h(Studio, {}), root)
    await vi.waitFor(() => {
      // the verdict at the head of the Colors menu
      if (!root.querySelector('mds-dropdown[target="#studio-colors"] mds-badge'))
        throw new Error('no verdict yet')
    })
    expect(root.querySelector('#studio-colors mds-notification')).toBeNull()
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

    // every way out asks: a download of the menu, the copy of the configuration
    files.length = 0
    await runAction('config')
    expect(document.querySelector('mds-modal')?.textContent).toContain('Download config hands out')
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
    h(ThemesManager, {
      config: failing(),
      report,
      guard: ({ label, proceed }: { label: string; proceed: string }) => asked.push({ label, proceed }),
    }),
    root,
  )
  expect(themeVerdicts(report.themes[0].name).map((badge) => badge.getAttribute('label'))).toEqual([
    `light: ${report.themes[0].failing.light} below target`,
    `dark: ${report.themes[0].failing.dark} below target`,
  ])
  await act(() => magmaButton('Copy CSS')!.click())
  expect(asked).toEqual([{ label: 'Copy CSS', proceed: 'Copy anyway' }])
})
