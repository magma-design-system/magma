// @vitest-environment jsdom
import { afterEach, expect, test, vi } from 'vitest'
import { h, render } from 'preact'
import committedConfig from '@maggioli-design-system/design-tokens/.magma-design-tokensrc.json'
import { DEFAULT_TARGETS } from '@maggioli-design-system/design-tokens/src/lib/contrast-gate.js'
import { TEXT_ROLES } from '@maggioli-design-system/design-tokens/src/lib/text-role.mjs'

import { BEHAVIOR_PAGES, COLORS_PAGES, hrefOf } from '../src/routes.js'
import {
  CHECKS,
  DEMO_STEPS,
  MAGMA_TARGETS,
  PALE_RAMP,
  PALE_SCALE,
  POOR_TARGETS,
  demoConfig,
  demoStep,
  rampAt,
  targetsAt,
} from '../src/start-demo.js'
import { FEATURES, LEVELS, PLAY_MS, StartPage } from '../src/start.js'

// The Start page (start.tsx), an introduction: a hero whose play, once, is the engine of the studio
// on the configuration of Magma drawn pale, its text targets lowered and the ramp of its accent
// faded, then brought back, told by three trays around the banner it paints; the steps
// of the work; the levels, from one colour to the whole product, each with its pages. jsdom does
// not upgrade the Magma components: the tests read the markup the page writes.

const root = document.createElement('div')
document.body.append(root)
afterEach(() => {
  render(null, root)
  vi.unstubAllGlobals()
})

// the moment of the play; the trays out; what the gate says over the bar; the bar; Replay
const phase = () => root.querySelector<HTMLElement>('.start-stage')?.dataset.phase
const open = () =>
  [...root.querySelectorAll('.start-tray[data-open]')].map((tray) =>
    tray.classList.contains('start-tray-over') ? 'problem' : tray.querySelector('.start-meter') ? 'fix' : 'fixed',
  )
const verdict = () => root.querySelector('.start-meter-label')?.textContent ?? undefined
const bar = () => root.querySelector('.start-meter mds-progress')!
const readings = () =>
  [...root.querySelectorAll('.start-reading mds-badge')].map((one) => one.getAttribute('variant'))
const replay = () => root.querySelector<HTMLElement>('.start-stage mds-button')!
const motion = (less: boolean) => vi.stubGlobal('matchMedia', () => ({ matches: less }))
// the banner loaded, as the browser says it: jsdom loads no iframe, and the play waits for it
const showHero = () => {
  render(h(StartPage, {}), root)
  root.querySelector('iframe.start-stage-frame')!.dispatchEvent(new Event('load'))
}

test('the demo starts under every floor of the gate and ends on the configuration of Magma', () => {
  for (const role of TEXT_ROLES) expect(POOR_TARGETS[role]).toBeLessThan(DEFAULT_TARGETS.text[role])
  expect(MAGMA_TARGETS).toEqual(committedConfig.theme.text)
  expect(targetsAt(0)).toEqual(POOR_TARGETS)
  expect(targetsAt(DEMO_STEPS)).toEqual(MAGMA_TARGETS)
  // each step raises the targets and the contrast of the accent, never lowers one
  for (let step = 1; step <= DEMO_STEPS; step++) {
    for (const role of TEXT_ROLES)
      expect(targetsAt(step)[role]).toBeGreaterThanOrEqual(targetsAt(step - 1)[role])
    expect(rampAt(step)).toBeGreaterThan(rampAt(step - 1))
  }
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
  expect(root.querySelector('mds-text[tag="h1"]')?.textContent?.trim()).toBe(
    'The theme of your product, readable by everyone',
  )
  expect(root.querySelector('.start-hero-head mds-text[tag="p"]')?.textContent).toContain(
    'Magma Studio is where a product shapes its theme',
  )
  expect([...root.querySelectorAll('.start-features mds-list-item')].map((one) => one.textContent?.trim())).toEqual(
    FEATURES,
  )
  expect(root.querySelector('iframe.start-stage-frame')?.getAttribute('src')).toBe('hero.html')
  // the problem first, over the banner, which the gate judges under its floors
  await vi.waitFor(() => expect(open()).toEqual(['problem']))
  expect(root.querySelector('.start-tray-over')?.textContent).toContain('under their contrast targets')
  await vi.waitFor(() => expect(verdict()).toMatch(/^\d+ contrasts below target$/))
  expect([...root.querySelectorAll('.start-reading mds-text[tag="dt"]')].map((one) => one.textContent?.trim())).toEqual(
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
  const hero = root.querySelector('.start-hero')!
  expect(hero.querySelector('[role="status"], [aria-live]')).toBeNull()
  for (const figures of hero.querySelectorAll('.start-readings, .start-meter'))
    expect(figures.getAttribute('aria-hidden')).toBe('true')
  for (const tray of hero.querySelectorAll('.start-tray:not([data-open])'))
    expect(tray.hasAttribute('inert')).toBe(true)
  expect(hero.querySelector('.start-tray[data-open]')?.hasAttribute('inert')).toBe(false)
  // what the play shows, told in words
  expect(hero.querySelector('figcaption')?.textContent).toContain('drawn pale')
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
  expect(replay().textContent?.trim()).toBe('Replay')
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
  expect(document.activeElement).toBe(root.querySelector('.start-stage'))
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
  // the one control of the hero
  const hero = root.querySelector('.start-hero')!
  expect([...hero.querySelectorAll('mds-button, input, button')]).toEqual([replay()])
  await new Promise((done) => setTimeout(done, 600))
  expect(open()).toEqual(['fixed'])
})

test('the levels go from one colour to the whole product, and lead to every page of the bar', () => {
  expect(LEVELS.map(({ name }) => name)).toEqual(['Colour', 'Role', 'Theme', 'Product', 'Composition'])
  render(h(StartPage, {}), root)
  const linked = [
    ...[...root.querySelectorAll('.start-level-pages mds-button')].map((one) => one.getAttribute('href')),
    // the checks, in the line under the levels
    ...[...root.querySelectorAll('.start-checks mds-link')].map((one) => one.getAttribute('href')),
  ]
  const every = [
    ...COLORS_PAGES.map(({ id }) => hrefOf({ section: 'colors', view: id })),
    hrefOf({ section: 'theme' }),
    ...BEHAVIOR_PAGES.map(({ id }) => hrefOf({ section: 'behavior', page: id })),
  ]
  expect(new Set(linked)).toEqual(new Set(every))
  expect(linked.length).toBe(every.length)
})

// written with Magma wherever Magma has the component: a list of text is an mds-list, a link in
// running text an mds-link; the steps and the levels stay lists of the platform, since an
// mds-list-item holds text only and theirs hold titles and links
test('the Start page uses the lists and the links of Magma where they hold what it writes', () => {
  motion(true)
  render(h(StartPage, {}), root)
  expect(root.querySelectorAll('ul, a')).toHaveLength(0)
  expect(root.querySelector('.start-features')?.localName).toBe('mds-list')
  expect(root.querySelectorAll('.start-checks mds-link')).toHaveLength(2)
})

test('the steps of the work, in their order, each with the page it starts on', () => {
  render(h(StartPage, {}), root)
  const steps = [...root.querySelectorAll('.start-step')]
  expect(steps.map((one) => one.querySelector('mds-text[tag="h3"]')?.textContent?.trim())).toEqual([
    'Start from a configuration',
    'Change it where the change belongs',
    'Keep the contrast gate green',
    'Judge it on a product, then take it',
  ])
  expect(steps.map((one) => one.querySelector('mds-button')?.getAttribute('href') ?? null)).toEqual([
    '#/colors/palette',
    null,
    '#/colors/contrast-check',
    '#/theme',
  ])
})
