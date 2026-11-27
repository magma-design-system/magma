import { expect, test } from 'vitest'

import initialConfig from '@maggioli-design-system/design-tokens/.magma-design-tokensrc.json'
import type { MagmaConfig } from '@maggioli-design-system/design-tokens/src/lib/color.mjs'
import { brokenSince, gateReport } from './gate.js'
import { NO_THEME_CHOICES } from './theme-choices.js'
import {
  printOf,
  reviewItems,
  reviewKey,
  reviewSummary,
  withLook,
  withoutLook,
} from './review.js'

// The full review as data (#1404): one item per theme and mode the theme is used in, each with
// the pairs that block, the reported ones and the debt, and whether the person looked at it, a
// look that a change touching the item takes back; and the themes a change broke, said by the
// toast of the shell.

const config = (): MagmaConfig => JSON.parse(JSON.stringify(initialConfig)) as MagmaConfig
/** Text pinned to the least contrasting step of each ramp: the text roles fail, in both modes. */
const failing = () => {
  const low = config()
  low.theme!.text = { default: { step: 10 }, muted: { step: 10 }, subtle: { step: 10 }, disabled: { step: 10 } }
  return low
}

test('an item per theme and mode, in the order of the themes, light before dark', () => {
  const items = reviewItems(gateReport(config()), {})
  expect(items.map(({ theme, mode }) => `${theme}/${mode}`)).toEqual([
    'business/light',
    'business/dark',
    'porcelain/light',
    'porcelain/dark',
    'editorial/light',
    'editorial/dark',
  ])
  expect(items[0]).toMatchObject({ key: 'neutral|light', family: 'neutral', base: true, look: 'open' })
  // Magma's preset passes: nothing blocks, the reported pairs and the debt still in view
  expect(items.every((item) => item.blocking.length === 0)).toBe(true)
  expect(items.some((item) => item.reported.length > 0)).toBe(true)
  for (const item of items) expect(item.measured).toBeGreaterThan(0)
})

test('a mode a theme is not used in is no item of the review', () => {
  const report = gateReport(config(), { ...NO_THEME_CHOICES, modes: { bisque: ['dark'] } })
  const items = reviewItems(report, {})
  expect(items.filter((item) => item.theme === 'editorial').map((item) => item.mode)).toEqual(['dark'])
})

test('the pairs that block, the reported ones and the debt are the states of the check in that mode', () => {
  const items = reviewItems(gateReport(failing()), {})
  const business = items.find((item) => item.key === 'neutral|light')!
  expect(business.blocking.length).toBeGreaterThan(0)
  for (const pair of business.blocking) expect(pair.cells.light.state).toBe('fail')
  for (const pair of business.reported) expect(pair.cells.light.state).toBe('below')
  for (const pair of business.debt) expect(pair.cells.light.state).toBe('accepted')
  expect(reviewSummary(items)).toMatchObject({ items: 6, looked: 0, changed: 0, blocking: 6 })
})

test('a look holds until a change touches the item, then says it changed after the look', () => {
  const report = gateReport(config())
  const looks = withLook({}, report, 'bisque', 'dark')
  expect(looks).toEqual({ 'bisque|dark': printOf(report.themes.find((one) => one.family === 'bisque')!, 'dark') })
  const looked = reviewItems(report, looks)
  expect(looked.find((item) => item.key === 'bisque|dark')?.look).toBe('looked')
  expect(reviewSummary(looked)).toMatchObject({ looked: 1, changed: 0 })

  // a change of the weights moves the colours of every theme: the look is taken back, and says why
  const moved = config()
  moved.theme!.surfaces.dark.raised = '30%'
  const after = reviewItems(gateReport(moved), looks)
  expect(after.find((item) => item.key === 'bisque|dark')?.look).toBe('changed')
  expect(reviewSummary(after)).toMatchObject({ looked: 0, changed: 1 })

  // a change that touches another theme only leaves it alone: the accent of porcelain
  const other = reviewItems(
    gateReport(config(), { ...NO_THEME_CHOICES, accents: { porcelain: { accent: 'variant-secondary' } } }),
    looks,
  )
  expect(other.find((item) => item.key === 'bisque|dark')?.look).toBe('looked')
})

test('a look is taken back by the person, and a key names a theme by its family and mode', () => {
  const looks = withLook(withLook({}, gateReport(config()), 'bisque', 'dark'), gateReport(config()), 'neutral', 'light')
  expect(Object.keys(withoutLook(looks, 'bisque', 'dark'))).toEqual(['neutral|light'])
  expect(reviewKey('bisque', 'dark')).toBe('bisque|dark')
  // a family the report has no theme of leaves the looks as they are
  expect(withLook(looks, gateReport(config()), 'nowhere', 'dark')).toBe(looks)
})

test('a theme is broken by a change when it fails now where the preset at the last exit passed', () => {
  const before = gateReport(config())
  const broken = brokenSince(before, gateReport(failing()))
  expect(broken.map(({ theme, mode }) => `${theme}/${mode}`)).toEqual([
    'business/light',
    'business/dark',
    'porcelain/light',
    'porcelain/dark',
    'editorial/light',
    'editorial/dark',
  ])
  for (const one of broken) expect(one.failing).toBeGreaterThan(0)
  // a theme that failed already is broken by no change, nor is the same report
  expect(brokenSince(gateReport(failing()), gateReport(failing()))).toEqual([])
  expect(brokenSince(before, before)).toEqual([])
  // matched by family: a rename does not hide that it broke
  const renamed = brokenSince(before, gateReport(failing(), { ...NO_THEME_CHOICES, names: { porcelain: 'cold-desk' } }))
  expect(renamed.some((one) => one.theme === 'cold-desk' && one.family === 'porcelain')).toBe(true)
  // a mode the theme was not used in at the last exit broke nothing
  const oneMode = gateReport(config(), { ...NO_THEME_CHOICES, modes: { bisque: ['dark'] } })
  expect(brokenSince(oneMode, gateReport(failing())).some((one) => one.family === 'bisque' && one.mode === 'light')).toBe(false)
})
