import { afterEach, expect, test } from 'vitest'
import { h, render } from 'preact'

import initialConfig from '@maggioli-design-system/design-tokens/.magma-design-tokensrc.json'
import type { MagmaConfig } from '@maggioli-design-system/design-tokens/src/lib/color.mjs'
import { LangProvider } from '../../shared/i18n/i18n.js'
import { DiffView } from './diffs.js'

// The Diffs page (#1401, a page of features/): the palette generated from the configuration
// edited against the one Magma builds with (.magma-design-tokensrc.json), a card per colour that
// moved, was added or was removed, in the language of the studio from the catalogue of the page.

const root = document.createElement('div')
document.body.append(root)

afterEach(() => {
  render(null, root)
})

const config = () => JSON.parse(JSON.stringify(initialConfig)) as MagmaConfig
type Colour = MagmaConfig['colors'][number]

/** The configuration Magma builds with, edited: one colour moved, one added, one removed. */
const edited = () => {
  const draft = config()
  const fireclay = draft.colors.find((one) => one.name === 'tone.fireclay')!
  fireclay.color = '#B07A60'
  draft.colors.push({ ...(JSON.parse(JSON.stringify(fireclay)) as Colour), name: 'tone.probe', color: '#5A8F6B' })
  draft.colors = draft.colors.filter((one) => one.name !== 'tone.kaolin')
  return draft
}

const show = (draft: MagmaConfig, lang: 'en' | 'it' = 'en') =>
  render(h(LangProvider, { value: lang }, h(DiffView, { config: draft })), root)

/** The card of a colour, by the path its heading names. */
const card = (path: string) =>
  [...root.querySelectorAll('mds-card')].find(
    (one) => one.querySelector('mds-text[tag="h2"]')?.textContent === path,
  )
const badgeOf = (scope: Element | undefined) => {
  const badge = scope?.querySelector('mds-badge')
  return { variant: badge?.getAttribute('variant'), label: badge?.getAttribute('label') }
}
const status = () => root.querySelector('[role="status"]')?.textContent

test('the configuration Magma builds with has no difference', () => {
  show(config())
  expect(status()).toBe('No differences from the committed configuration.')
  expect(root.querySelectorAll('mds-card')).toHaveLength(0)
})

test('a colour moved, added or removed has a card, its badge says how', () => {
  show(edited())
  expect(status()).toBe('1 changed, 1 new, 1 removed')
  // moved: how far, the largest perceptual distance, and how many steps
  const moved = badgeOf(card('tone.fireclay'))
  expect(moved.variant).toBe('warning')
  expect(moved.label).toMatch(/^ΔE \d+\.\d - \d+ steps$/)
  expect(badgeOf(card('tone.probe'))).toEqual({ variant: 'success', label: 'new' })
  expect(badgeOf(card('tone.kaolin'))).toEqual({ variant: 'error', label: 'removed' })
  // the colours that did not move have no card
  expect(card('tone.neutral')).toBeUndefined()
})

test('each mode of a colour shows its steps, the changed ones outlined, and says how each moved', () => {
  show(edited())
  const moved = card('tone.fireclay')!
  const labels = [...moved.querySelectorAll('mds-text[tag="p"]')].map((one) => one.textContent)
  expect(labels).toEqual(['light', 'dark'])
  const steps = [...moved.querySelectorAll('.diffs-step')]
  const changed = steps.filter((step) => step.classList.contains('diffs-step-changed'))
  expect(changed.length).toBeGreaterThan(0)
  expect(changed[0].getAttribute('title')).toMatch(/^\w+: #[0-9a-f]{6} to #[0-9a-f]{6} \(ΔE \d+\.\d\)$/i)
  // every step of a new colour was added
  const added = [...card('tone.probe')!.querySelectorAll('.diffs-step')]
  expect(added.every((step) => step.classList.contains('diffs-step-changed'))).toBe(true)
  expect(added[0].getAttribute('title')).toMatch(/: added \(#[0-9a-f]{6}\)$/i)
})

test('a configuration the generator refuses says why, with no card', () => {
  const broken = config()
  broken.colors[0].color = '#not-a-colour'
  show(broken)
  const banner = root.querySelector('mds-banner')
  expect(banner?.getAttribute('variant')).toBe('error')
  expect(banner?.textContent).toMatch(/not-a-colour/)
  expect(root.querySelectorAll('mds-card')).toHaveLength(0)
})

// the texts of the page come from its own catalogue (i18n-it.ts), the shared ones (the modes, the
// count of the steps) from the studio's
test('in Italian the page speaks from its own catalogue, and the studio\'s for the shared words', () => {
  show(edited(), 'it')
  expect(status()).toBe('cambiati: 1, nuovi: 1, rimossi: 1')
  expect(badgeOf(card('tone.probe')).label).toBe('nuovo')
  expect(badgeOf(card('tone.kaolin')).label).toBe('rimosso')
  expect(badgeOf(card('tone.fireclay')).label).toMatch(/ - \d+ gradini$/)
  const moved = card('tone.fireclay')!
  expect([...moved.querySelectorAll('mds-text[tag="p"]')].map((one) => one.textContent)).toEqual(['chiaro', 'scuro'])
})
