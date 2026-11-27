import { expect, test } from 'vitest'
import initialConfigJson from '@maggioli-design-system/design-tokens/.magma-design-tokensrc.json'
import type { MagmaConfig } from '@maggioli-design-system/design-tokens/src/lib/color.mjs'

import { gateReport } from './gate.js'
import {
  touchedCells,
  touchedCellsOfScale,
  touchedCellsOfWeights,
  touchedPairs,
  touchedSummary,
} from './touched.js'
import { builtinScalesOf } from '../state/scales.js'

// The pairs of the contrast check a family touches (#1403): measured by moving the family and
// running the check again.

const preset = initialConfigJson as unknown as MagmaConfig
const report = gateReport(preset)

test('the family of the base theme touches the pairs of that theme, in both modes', () => {
  const pairs = touchedPairs(report, touchedCells(preset, 'tone.neutral'))
  expect(pairs.length).toBeGreaterThan(50)
  expect(new Set(pairs.map((pair) => pair.theme))).toEqual(new Set(['business']))
  expect(pairs.find((pair) => pair.fg === 'text-default' && pair.bg === 'surface-default')?.states).toEqual({
    light: 'pass',
    dark: 'pass',
  })
  expect(touchedSummary(pairs)).toMatchObject({ pairs: pairs.length, fail: 0 })
})

test('a status colour touches its pairs in every theme; a label colour touches none', () => {
  const error = touchedPairs(report, touchedCells(preset, 'status.error'))
  expect(new Set(error.map((pair) => pair.theme)).size).toBe(report.themes.length)
  expect(error.every((pair) => pair.fg.startsWith('danger') || pair.bg.startsWith('danger'))).toBe(true)
  expect(touchedCells(preset, 'label.red').size).toBe(0)
})

test('a reference touches what the family it follows touches', () => {
  expect(touchedCells(preset, 'variant.primary')).toEqual(touchedCells(preset, 'brand.maggioli'))
})

test('the summary counts the pairs, and those that fail, are accepted or below, in any mode', () => {
  expect(
    touchedSummary([
      { theme: 'business', fg: 'text-muted', bg: 'surface-default', states: { light: 'pass', dark: 'fail' } },
      { theme: 'business', fg: 'text-subtle', bg: 'surface-sunken', states: { light: 'accepted' } },
      { theme: 'editorial', fg: 'text-subtle', bg: 'surface-sunken', states: { dark: 'below' } },
      { theme: 'editorial', fg: 'text-default', bg: 'surface-default', states: { light: 'pass', dark: 'pass' } },
    ]),
  ).toEqual({ pairs: 4, fail: 1, accepted: 1, below: 1 })
})

test('the weights of a mode touch the pairs of that mode only, in every theme', () => {
  for (const mode of ['light', 'dark'] as const) {
    const cells = touchedCellsOfWeights(preset, mode)
    expect([...cells].every((key) => key.endsWith(`|${mode}`))).toBe(true)
    const pairs = touchedPairs(report, cells)
    expect(new Set(pairs.map((pair) => pair.theme)).size).toBe(report.themes.length)
    expect(pairs.every((pair) => Object.keys(pair.states).join() === mode)).toBe(true)
    // the text of the base theme on its canvas moves with the weights
    expect(pairs.some((pair) => pair.fg === 'text-default' && pair.bg === 'surface-default')).toBe(true)
  }
})

test('a scale touches the pairs of the families that use it; one no family uses, none', () => {
  // tone, the scale of the neutrals: the surfaces and texts of the base theme move with it
  const tone = touchedPairs(report, touchedCellsOfScale(preset, 'wcag3', 'tone', builtinScalesOf('wcag3').tone))
  expect(tone.length).toBeGreaterThan(50)
  expect(tone.some((pair) => pair.theme === 'business')).toBe(true)
  expect(touchedCellsOfScale(preset, 'wcag2', 'v1', builtinScalesOf('wcag2').v1).size).toBe(0)
})
