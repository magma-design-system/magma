import { afterEach, expect, test } from 'vitest'
import { h, render } from 'preact'
import { act } from 'preact/test-utils'

import initialConfig from '@maggioli-design-system/design-tokens/.magma-design-tokensrc.json'
import type { MagmaConfig } from '@maggioli-design-system/design-tokens/src/lib/color.mjs'
import { gateReport, type GateReport } from '../../engine/gate.js'
import { NO_THEME_CHOICES } from '../../engine/theme-choices.js'
import { LangProvider } from '../../shared/i18n/i18n.js'
import { ContrastCheck } from './contrast-check.js'
import { GateDialog } from './gate-dialog.js'

// The Contrast check page (#698; #1401, a page of features/): every pair the contrast gate judges,
// per theme and per mode, with its verdict, and the dialog an export opens while the gate fails,
// each in the language of the studio from the catalogue of the page. jsdom does not upgrade the
// Magma components: the test reads the markup the page writes and dispatches the events they emit.
// The verdict in the bar and the flow of an export are the shell's (test/contrast.test.mts).

const root = document.createElement('div')
document.body.append(root)

afterEach(() => {
  render(null, root)
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

const show = (report: GateReport, lang: 'en' | 'it' = 'en') =>
  render(h(LangProvider, { value: lang }, h(ContrastCheck, { report })), root)

const badgeOf = (scope: ParentNode | null | undefined) => {
  const badge = scope?.querySelector('mds-badge')
  return { variant: badge?.getAttribute('variant'), label: badge?.getAttribute('label') }
}
/** The card of a theme: the one its heading names. */
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

// the texts of the page come from its own catalogue (i18n-it.ts), the shared ones from the
// studio's
test('in Italian the page speaks from its own catalogue, and the studio\'s for the shared words', () => {
  show(gateReport(failing()), 'it')
  const business = themeCard('business')!
  expect(business.querySelector('[tag="h3"]')?.textContent).toBe('Testo sulle superfici')
  expect(
    [...business.querySelectorAll('mds-table-header-cell')].slice(0, 4).map((head) => head.getAttribute('label')),
  ).toEqual(['Coppia', 'Obiettivo', 'Chiaro', 'Scuro'])
  expect(root.querySelector('[role="status"]')?.textContent).toMatch(
    /coppie sotto l'obiettivo: la build di Magma rifiuterebbe questa configurazione/,
  )
  expect(root.querySelector('mds-input-switch')?.textContent?.trim()).toBe(
    'Solo le coppie sotto il loro obiettivo',
  )
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
