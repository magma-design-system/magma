import { afterEach, expect, test, vi } from 'vitest'
import { h, render } from 'preact'
import { isInaccessible, within } from '@testing-library/preact'
import committedConfig from '@maggioli-design-system/design-tokens/.magma-design-tokensrc.json'
import { DEFAULT_TARGETS } from '@maggioli-design-system/design-tokens/src/lib/contrast-gate.js'
import { TEXT_ROLES } from '@maggioli-design-system/design-tokens/src/lib/text-role.mjs'

import { LangProvider } from '../../shared/i18n/i18n.js'
import { hrefOf, STAGES } from '../../shared/routes/routes.js'
import {
  CHECKS,
  DEMO_STEPS,
  MAGMA_TARGETS,
  PALE_RAMP,
  PALE_SCALE,
  POOR_STEPS,
  demoConfig,
  demoStep,
  magmaSteps,
  rampAt,
  textAt,
} from './demo.js'
import { gateReport } from '../../engine/gate.js'
import { FEATURES, FLOW, IntroductionPage, PLAY_MS } from './introduction.js'
import { textOf } from '../../../test/text.mjs'

// The introduction (introduction.tsx; the Start page until #1402): a hero whose play, once, is the
// engine of the studio on the configuration of Magma drawn pale, its text pinned to pale steps and
// the ramp of its accent faded, then brought back, told by three trays around the banner it paints,
// and the way out to the opening; then the stages in order, each with what it does and its link.
// jsdom does not upgrade the Magma components: the tests read the markup the page writes, the
// native elements by their role and name, the Magma ones by their tag and attributes.

const root = document.createElement('div')
document.body.append(root)
afterEach(() => {
  render(null, root)
  vi.unstubAllGlobals()
})

// the hero, the region its title names; the stage of the play, its figure; the banner on it
const TITLE = 'The theme of your product, readable by everyone'
const hero = () => within(root).getByRole('region', { name: TITLE })
const stage = () => within(root).getByRole<HTMLElement>('figure')
const banner = () =>
  root.querySelector('iframe[title="A banner of a product, painted with the configuration of the animation"]')!
// the trays, the boxes of the stage that come out from behind the banner; the one over it
const trays = () => [...stage().querySelectorAll(':scope > div')]
const over = (tray: Element) => !!(tray.compareDocumentPosition(banner()) & Node.DOCUMENT_POSITION_FOLLOWING)
// the moment of the play; the trays out: over the banner the problem, under it the fix with its
// bar, or the banner fixed; what the gate says over the bar; the bar; the indicators; Replay, the
// one control of the stage
const phase = () => stage().dataset.phase
const open = () =>
  trays()
    .filter((tray) => tray.hasAttribute('data-open'))
    .map((tray) => (over(tray) ? 'problem' : tray.querySelector('mds-progress') ? 'fix' : 'fixed'))
const bar = () => root.querySelector('mds-progress')!
const verdict = () => bar().previousElementSibling?.textContent ?? undefined
const readings = () => [...stage().querySelectorAll('dl mds-badge')].map((one) => one.getAttribute('variant'))
const replay = () => stage().querySelector<HTMLElement>('mds-button')!
const motion = (less: boolean) => vi.stubGlobal('matchMedia', () => ({ matches: less }))
// the banner loaded, as the browser says it: jsdom loads no iframe, and the play waits for it
const showHero = () => {
  render(h(IntroductionPage, {}), root)
  banner().dispatchEvent(new Event('load'))
}

test('the demo starts under every floor of the gate and ends on the configuration of Magma', () => {
  // the text pinned to pale steps, each under its floor on the ground of the banner (light)
  expect(textAt(0)).toEqual(Object.fromEntries(TEXT_ROLES.map((role) => [role, { step: POOR_STEPS[role] }])))
  const paleBase = gateReport(demoConfig(0)).themes.find((theme) => theme.base)!
  for (const role of TEXT_ROLES) {
    const cell = paleBase.pairs.find((pair) => pair.fg === `text-${role}` && pair.bg === 'surface-overlay')!.cells.light
    expect(cell.achieved, role).toBeLessThan(DEFAULT_TARGETS.text[role])
  }
  expect(MAGMA_TARGETS).toEqual(committedConfig.theme.text)
  expect(textAt(DEMO_STEPS)).toEqual(MAGMA_TARGETS)
  // each step moves the pins toward the steps the engine picks for Magma, never back nor past
  // them, and raises the contrast of the accent
  const stepOf = (step: number, role: (typeof TEXT_ROLES)[number]) => (textAt(step)[role] as { step: number }).step
  for (let step = 1; step < DEMO_STEPS; step++) {
    for (const role of TEXT_ROLES) {
      expect(stepOf(step, role)).toBeLessThanOrEqual(stepOf(step - 1, role))
      expect(stepOf(step, role)).toBeGreaterThanOrEqual(magmaSteps()[role])
    }
  }
  for (let step = 1; step <= DEMO_STEPS; step++) expect(rampAt(step)).toBeGreaterThan(rampAt(step - 1))
  // the accent family, drawn from a scale of its own while it is pale
  const pale = demoConfig(0)
  const accent = pale.colors.find((color) => color.name === 'brand.maggioli')
  expect(accent?.ratios).toBe(PALE_SCALE)
  expect(rampAt(0)).toBe(PALE_RAMP)
  // and at the end the configuration Magma builds with, untouched
  expect(demoConfig(DEMO_STEPS)).toEqual(committedConfig)
})

test('the engine judges the banner pale under its floors, and the one of Magma on them', () => {
  const poor = demoStep(0)!
  expect(poor.verdict.state).toBe('fail')
  expect(poor.readings.map(({ check }) => check.id)).toEqual(CHECKS.map(({ id }) => id))
  for (const { cell } of poor.readings) {
    expect(cell.state).not.toBe('pass')
    expect(cell.achieved).toBeLessThan(cell.target)
  }
  const fixed = demoStep(DEMO_STEPS)!
  expect(fixed.verdict.state).toBe('pass')
  for (const { cell } of fixed.readings) expect(cell.state).toBe('pass')
  // the banner of the hero is painted with the palette each step prints
  expect(fixed.css).not.toBe(poor.css)
  expect(fixed.theme).toBe(poor.theme)
})

test('the bar fills with the pairs brought back over their floor, red, then yellow once an indicator meets its floor', () => {
  const steps = Array.from({ length: DEMO_STEPS + 1 }, (_, step) => demoStep(step)!)
  expect(steps[0].solved).toBe(0)
  expect(steps[DEMO_STEPS].solved).toBe(1)
  for (let step = 1; step <= DEMO_STEPS; step++)
    expect(steps[step].solved).toBeGreaterThanOrEqual(steps[step - 1].solved)
  for (const one of steps) {
    const some = one.readings.some(({ cell }) => cell.state === 'pass')
    const expected = one.verdict.state === 'pass' ? 'success' : some ? 'warning' : 'error'
    expect(one.tone).toBe(expected)
  }
  // the three indicators turn one after the other, not all at once
  const turns = CHECKS.map(({ id }) =>
    steps.findIndex((one) => one.readings.find(({ check }) => check.id === id)!.cell.state === 'pass'),
  )
  expect(new Set(turns).size).toBeGreaterThan(1)
  // the loop goes through the three, in their order
  const tones = steps.map(({ tone }) => tone)
  expect([...new Set(tones)]).toEqual(['error', 'warning', 'success'])
})

test('the hero says what the studio is for and what it offers, beside a banner it paints, pale at first', async () => {
  motion(false)
  showHero()
  expect(root.querySelector('mds-text[tag="h1"]')?.textContent?.trim()).toBe(TITLE)
  // the head of the hero: what the studio is, then what it offers
  expect(hero().querySelector('header mds-text[tag="p"]')?.textContent).toContain(
    'Magma Studio is where a product shapes its theme',
  )
  expect([...hero().querySelectorAll('header mds-list-item')].map((one) => one.textContent?.trim())).toEqual(FEATURES)
  expect(banner().getAttribute('src')).toBe('hero.html')
  // the problem first, over the banner, which the gate judges under its floors
  await vi.waitFor(() => expect(open()).toEqual(['problem']))
  expect(trays().find(over)?.textContent).toContain('under their contrast targets')
  await vi.waitFor(() => expect(verdict()).toMatch(/^\d+ contrasts below target$/))
  expect([...stage().querySelectorAll('dl mds-text[tag="dt"]')].map((one) => one.textContent?.trim())).toEqual(
    ['Texts', 'Icons', 'Actions'],
  )
  expect(readings()).toEqual(['error', 'error', 'error'])
  expect(bar().getAttribute('variant')).toBe('error')
  expect(bar().getAttribute('progress')).toBe('0')
})

// an introduction, not a tool: the play runs once and short, so it needs no pause (WCAG 2.2.2 asks
// one of what moves by itself for more than five seconds); the figures that change at every step
// are hidden from assistive technologies, never announced; a tray back behind the banner is inert
test('the play runs once in under five seconds, announces nothing, and keeps its hidden trays out of reach', async () => {
  // the timings of start.tsx, with room for timers that run late
  expect(PLAY_MS).toBeLessThanOrEqual(4600)
  motion(false)
  showHero()
  await vi.waitFor(() => expect(phase()).toBe('problem'))
  expect(hero().querySelector('[role="status"], [aria-live]')).toBeNull()
  // the figures, the indicators and what the gate says with its bar, out of reach of assistive
  // technologies
  const figures = [stage().querySelector('dl')!, bar().previousElementSibling!, bar()]
  expect(figures.map((one) => isInaccessible(one))).toEqual([true, true, true])
  for (const tray of trays().filter((one) => !one.hasAttribute('data-open')))
    expect(tray.hasAttribute('inert')).toBe(true)
  expect(trays().find((one) => one.hasAttribute('data-open'))?.hasAttribute('inert')).toBe(false)
  // what the play shows, told in words, within their reach
  const caption = stage().querySelector('figcaption')!
  expect(caption.textContent).toContain('drawn pale')
  expect(isInaccessible(caption)).toBe(false)
})

test('the play shows the problem, fixes it step by step, and ends on the banner fixed, with Replay', async () => {
  motion(false)
  showHero()
  await vi.waitFor(() => expect(open()).toEqual(['problem']))
  // the fix comes out under the banner, the problem goes back; yellow on the way
  await vi.waitFor(() => expect(open()).toEqual(['fix']), { timeout: 5_000 })
  await vi.waitFor(() => expect(bar().getAttribute('variant')).toBe('warning'), { timeout: 5_000 })
  expect(verdict()).toMatch(/below target$/)
  await vi.waitFor(() => expect(open()).toEqual(['fixed']), { timeout: 5_000 })
  expect(verdict()).toBe('All contrasts are OK')
  expect(readings()).toEqual(['success', 'success', 'success'])
  expect(bar().getAttribute('progress')).toBe('1')
  expect(textOf(replay())).toBe('Replay')
  // and it stays there: the play runs once
  await new Promise((done) => setTimeout(done, PLAY_MS))
  expect(open()).toEqual(['fixed'])
}, 30_000)

test('Replay plays it again from the problem, and the focus comes back to it at the end', async () => {
  motion(true)
  showHero()
  await vi.waitFor(() => expect(open()).toEqual(['fixed']))
  await vi.waitFor(() => expect(verdict()).toBe('All contrasts are OK'))
  // the native button mds-button renders in the browser, which jsdom does not upgrade
  replay().attachShadow({ mode: 'open' }).append(document.createElement('button'))
  replay().click()
  // the focus waits on the stage while the tray of Replay is back
  expect(document.activeElement).toBe(stage())
  await vi.waitFor(() => expect(open()).toEqual(['problem']))
  await vi.waitFor(() => expect(verdict()).toMatch(/below target$/))
  await vi.waitFor(() => expect(open()).toEqual(['fixed']), { timeout: 10_000 })
  expect(verdict()).toBe('All contrasts are OK')
  // an effect moves it, after the paint: late on a loaded runner
  await vi.waitFor(() => expect(document.activeElement).toBe(replay()), { timeout: 5_000 })
}, 30_000)

test('with less motion asked, the play does not run by itself: the banner stands fixed, with Replay', async () => {
  motion(true)
  showHero()
  await vi.waitFor(() => expect(verdict()).toBe('All contrasts are OK'))
  expect(open()).toEqual(['fixed'])
  expect(phase()).toBe('fixed')
  // the one control of the play; the other of the hero is its way out, a link
  expect([...stage().querySelectorAll('mds-button, input, button')]).toEqual([replay()])
  expect([...hero().querySelectorAll('mds-button:not([href]), input, button')]).toEqual([replay()])
  await new Promise((done) => setTimeout(done, 600))
  expect(open()).toEqual(['fixed'])
})

// written with Magma wherever Magma has the component: a list of text is an mds-list; the stages
// stay a list of the platform, since an mds-list-item holds text only and a stage holds a title, a
// sentence and a link
test('the introduction uses the lists of Magma where they hold what it writes', () => {
  motion(true)
  render(h(IntroductionPage, {}), root)
  expect(root.querySelectorAll('ul, a')).toHaveLength(0)
  // what the studio offers, lines of text: the items of an mds-list
  const features = FEATURES.map((feature) => within(root).getByText(feature))
  expect(features.map((one) => [one.localName, one.parentElement?.localName])).toEqual(
    FEATURES.map(() => ['mds-list-item', 'mds-list']),
  )
})

test('the hero leads out to the opening, the one way out of the introduction', () => {
  motion(true)
  render(h(IntroductionPage, {}), root)
  const start = [...hero().querySelectorAll('mds-button[href]')]
  expect(start.map((one) => [textOf(one), one.getAttribute('href')])).toEqual([['Get started', '#/opening']])
})

// the stages in order, from the opening to the full review (studio.object-model.md, section 5),
// each with what it does and the link that opens it, in the primary weak tone (vittorio, 2026-11-27)
test('the stages in order, each with what it does and the link that opens it', () => {
  render(h(IntroductionPage, {}), root)
  const work = within(root).getByRole('region', { name: 'How the work goes' })
  const rows = within(work).getAllByRole('listitem')
  const row = (one: Element) => ({
    caption: one.querySelector('mds-text[typography="caption"]')?.textContent,
    name: one.querySelector('mds-text[tag="h3"]')?.textContent,
    link: [textOf(one.querySelector('mds-button')), one.querySelector('mds-button')?.getAttribute('href')],
  })
  expect(rows.map(row)).toEqual([
    { caption: 'Before the stages', name: 'Opening', link: ['Open Opening', '#/opening'] },
    { caption: 'Stage 1', name: 'Colors', link: ['Open Colors', '#/colours'] },
    { caption: 'Stage 2', name: 'Weights', link: ['Open Weights', '#/weights'] },
    { caption: 'Stage 3', name: 'Themes', link: ['Open Themes', '#/themes'] },
    { caption: 'Stage 4', name: 'Exceptions', link: ['Open Exceptions', '#/exceptions'] },
    { caption: 'After the stages', name: 'Full review', link: ['Open Full review', '#/full-review'] },
  ])
  // the stages are those of the table of the pages, in its order
  expect(FLOW.slice(1).map(({ route }) => hrefOf(route))).toEqual(STAGES.map(({ route }) => hrefOf(route)))
  // each says what it does; its link an action, in the primary weak tone
  for (const one of rows) {
    expect(one.querySelector('mds-text[typography="detail"]')?.textContent).toBeTruthy()
    const link = one.querySelector('mds-button')!
    expect([link.getAttribute('variant'), link.getAttribute('tone')]).toEqual(['primary', 'weak'])
  }
})

test('the introduction speaks Italian from its own catalogue, the names of the stages from the studio', () => {
  motion(true)
  render(h(LangProvider, { value: 'it' }, h(IntroductionPage, {})), root)
  const heroIt = within(root).getByRole('region', { name: 'Il tema del tuo prodotto, leggibile da tutti' })
  expect(textOf(heroIt.querySelector('mds-button[href]'))).toBe('Comincia')
  const work = within(root).getByRole('region', { name: 'Come si lavora' })
  const names = within(work).getAllByRole('listitem').map((one) => textOf(one.querySelector('mds-button')))
  expect(names).toEqual([
    'Apri Partenza', 'Apri Colori', 'Apri Pesi', 'Apri Temi', 'Apri Eccezioni', 'Apri Giro completo',
  ])
})
