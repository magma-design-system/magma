import { expect, test } from 'vitest'

import {
  CONTRAST_RANGE,
  classifyRatioTarget,
  validateRatioScale,
} from '../src/lib/contrast-range.js'

test('wcag3 bounds match the documented APCA range', () => {
  expect(CONTRAST_RANGE.wcag3).toEqual({ min: 0, lowClamp: 8, nearMax: 100, max: 106 })
  expect(CONTRAST_RANGE.wcag2).toEqual({ min: 1, max: 21 })
})

test('classifyRatioTarget flags wcag3 targets by band, with severity', () => {
  // out-of-range -> warn
  expect(classifyRatioTarget(115, 'wcag3')).toMatchObject({ kind: 'above-max', severity: 'warn' })
  expect(classifyRatioTarget(107, 'wcag3')?.kind).toBe('above-max')
  expect(classifyRatioTarget(5, 'wcag3')).toMatchObject({ kind: 'dead-zone', severity: 'warn' })
  // near-ceiling -> info (reachable, not logged)
  expect(classifyRatioTarget(101, 'wcag3')).toMatchObject({ kind: 'near-max', severity: 'info' })
  expect(classifyRatioTarget(106, 'wcag3')?.kind).toBe('near-max') // ceiling itself is near
  // in range
  expect(classifyRatioTarget(0, 'wcag3')).toBeNull() // min, allowed
  expect(classifyRatioTarget(50, 'wcag3')).toBeNull()
  expect(classifyRatioTarget(90, 'wcag3')).toBeNull()
})

test('classifyRatioTarget flags wcag2 targets by band', () => {
  expect(classifyRatioTarget(22, 'wcag2')?.kind).toBe('above-max')
  expect(classifyRatioTarget(0.5, 'wcag2')?.kind).toBe('below-min')
  expect(classifyRatioTarget(1, 'wcag2')).toBeNull()
  expect(classifyRatioTarget(21, 'wcag2')).toBeNull()
})

test('validateRatioScale flags the current tone wcag3 scale (101 and 115)', () => {
  const tone = [0, 13, 25, 38, 50, 72, 84, 94, 101, 115]
  const issues = validateRatioScale(tone, 'wcag3')
  expect(issues.map((issue) => [issue.index, issue.kind])).toEqual([
    [8, 'near-max'],
    [9, 'above-max'],
  ])
})

test('validateRatioScale is empty for an in-range scale', () => {
  expect(validateRatioScale([0, 11, 23, 34, 46, 66, 78, 89, 95, 99], 'wcag3')).toEqual([])
})

test('the default/tint top step (102) is a non-warning near-max info', () => {
  const issues = validateRatioScale([0, 11, 23, 34, 46, 66, 78, 89, 97, 102], 'wcag3')
  expect(issues).toHaveLength(1)
  expect(issues[0]).toMatchObject({ index: 9, kind: 'near-max', severity: 'info' })
})
