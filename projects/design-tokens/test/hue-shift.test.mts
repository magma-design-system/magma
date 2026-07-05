import { expect, test } from 'vitest'
import chroma from 'chroma-js'

import {
  groupStepsByAngle,
  hasHueShift,
  resolveCurveWeights,
  resolveStepAngles,
  rotateHue,
} from '../src/lib/hue-shift.mjs'
import { createColorTokens, MagmaConfig } from '../src/lib/color.mjs'
import { contrast } from '../src/lib/leonardo/index.js'

test('smooth preset fades the shift in from both ends', () => {
  expect(resolveCurveWeights('smooth', 10)).toEqual([100, 67, 33, 0, 0, 0, 0, 33, 67, 100])
})

test('hard preset applies the full shift outside the dead zone', () => {
  expect(resolveCurveWeights('hard', 10)).toEqual([100, 100, 100, 0, 0, 0, 0, 100, 100, 100])
})

test('parametric curve honors deadZone and easing', () => {
  expect(resolveCurveWeights({ deadZone: 0.6, easing: 'step' }, 10)).toEqual([100, 100, 0, 0, 0, 0, 0, 0, 100, 100])
  expect(resolveCurveWeights({ deadZone: 0 }, 3)).toEqual([100, 0, 100])
})

test('explicit weight arrays pass through when length matches', () => {
  const weights = [100, 66, 33, 0, 0, 0, 0, 33, 66, 100]
  expect(resolveCurveWeights(weights, 10)).toEqual(weights)
})

test('explicit weight arrays are resampled to the scale length', () => {
  expect(resolveCurveWeights([100, 0, 0, 100], 7)).toEqual([100, 50, 0, 0, 0, 50, 100])
})

test('curve validation rejects bad input', () => {
  expect(() => resolveCurveWeights('bogus' as never, 10)).toThrow(/preset/)
  expect(() => resolveCurveWeights([120], 10)).toThrow(/\[0, 100\]/)
  expect(() => resolveCurveWeights({ deadZone: 1.2 }, 10)).toThrow(/deadZone/)
  expect(() => resolveCurveWeights('smooth', 1)).toThrow(/at least 2 steps/)
})

test('rotateHue rotates in OKLCH and keeps achromatic colors untouched', () => {
  expect(rotateHue('#0da2e7', 0)).toBe('#0da2e7')
  expect(rotateHue('#a3a3a3', 30)).toBe('#a3a3a3')
  // in-gamut color: the rotation survives the sRGB conversion intact
  const base = chroma('#5b7c99').oklch()
  const rotated = chroma(rotateHue('#5b7c99', -20)).oklch()
  expect(rotated[2] - base[2]).toBeCloseTo(-20, 0)
  // saturated colors near the gamut boundary are clamped back into sRGB:
  // the rotation is applied but the resulting hue delta may be smaller
  const saturatedBase = chroma('#0da2e7').oklch()
  const saturatedRotated = chroma(rotateHue('#0da2e7', -20)).oklch()
  expect(saturatedRotated[2] - saturatedBase[2]).toBeLessThan(-10)
})

test('hasHueShift detects effective configurations only', () => {
  expect(hasHueShift(undefined)).toBe(false)
  expect(hasHueShift({})).toBe(false)
  expect(hasHueShift({ dark: 0, light: 0 })).toBe(false)
  expect(hasHueShift({ dark: -10 })).toBe(true)
})

test('angles are anchored to physical lightness, not to step index', () => {
  const config = { dark: -20, light: 10, curve: 'hard' as const }
  // ratios are sorted by increasing contrast: in light mode the far end
  // (last indices) is dark, in dark mode it is light
  expect(resolveStepAngles(config, 10, 'light').at(-1)).toBe(-20)
  expect(resolveStepAngles(config, 10, 'light').at(0)).toBe(10)
  expect(resolveStepAngles(config, 10, 'dark').at(-1)).toBe(10)
  expect(resolveStepAngles(config, 10, 'dark').at(0)).toBe(-20)
})

test('angles above the safety limit are rejected', () => {
  expect(() => resolveStepAngles({ dark: -75 }, 10, 'light')).toThrow(/-60, 60/)
})

test('steps sharing an angle are grouped on a single scale', () => {
  const groups = groupStepsByAngle({ dark: -18, light: 10, curve: 'smooth' }, 10, 'light')
  const zeroGroup = groups.find((group) => group.angle === 0)
  expect(zeroGroup?.stepIndices).toEqual([3, 4, 5, 6])
  // every step is covered exactly once
  const covered = groups.flatMap((group) => group.stepIndices).sort((a, b) => a - b)
  expect(covered).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
  // smooth curve with asymmetric angles: 7 distinct scales instead of 10
  expect(groups).toHaveLength(7)
})

const BASE_CONFIG: MagmaConfig = {
  colors: [{ color: '#00379E', name: 'variant.primary' }],
  formula: 'wcag2',
}

const SHIFTED_CONFIG: MagmaConfig = {
  colors: [
    {
      color: '#00379E',
      name: 'variant.primary',
      hueShift: { dark: -20, light: 15, curve: 'smooth' },
    },
  ],
  formula: 'wcag2',
}

function scaleOf (tokens: ReturnType<typeof createColorTokens>['tokens'], mode: 'light' | 'dark'): string[] {
  const palette = tokens.color.variant.primary[mode]
  return Object.keys(palette)
    .filter((key) => key !== 'color')
    .sort((a, b) => Number(a) - Number(b))
    .map((key) => palette[key].value)
}

test('hueShift with zero angles produces the exact same tokens', () => {
  const base = createColorTokens(BASE_CONFIG)
  const zero = createColorTokens({
    colors: [{ color: '#00379E', name: 'variant.primary', hueShift: { dark: 0, light: 0 } }],
    formula: 'wcag2',
  })
  expect(zero.tokens).toEqual(base.tokens)
})

test('hueShift leaves dead-zone steps untouched and shifts the ends', () => {
  const base = createColorTokens(BASE_CONFIG)
  const shifted = createColorTokens(SHIFTED_CONFIG)

  for (const mode of ['light', 'dark'] as const) {
    const baseScale = scaleOf(base.tokens, mode)
    const shiftedScale = scaleOf(shifted.tokens, mode)
    expect(shiftedScale).toHaveLength(baseScale.length)
    // smooth curve on 10 steps: token indices 4..7 (steps in the dead zone)
    // are identical to the baseline
    for (const index of [3, 4, 5, 6]) {
      expect(shiftedScale[index]).toBe(baseScale[index])
    }
    // the ends are hue-rotated
    expect(shiftedScale[0]).not.toBe(baseScale[0])
    expect(shiftedScale[9]).not.toBe(baseScale[9])
  }
})

test('hueShift anchors the dark angle to the dark end in both modes', () => {
  const base = createColorTokens(BASE_CONFIG)
  const shifted = createColorTokens(SHIFTED_CONFIG)

  const hueDelta = (from: string, to: string) => {
    const difference = chroma(to).oklch()[2] - chroma(from).oklch()[2]
    return ((difference + 540) % 360) - 180
  }

  // light mode: token 1 is the darkest step -> dark angle (negative)
  const lightBase = scaleOf(base.tokens, 'light')
  const lightShifted = scaleOf(shifted.tokens, 'light')
  expect(hueDelta(lightBase[0], lightShifted[0])).toBeLessThan(0)
  // light mode: token 10 is the lightest step -> light angle (positive)
  expect(hueDelta(lightBase[9], lightShifted[9])).toBeGreaterThan(0)

  // dark mode: token 1 is the lightest step -> light angle (positive)
  const darkBase = scaleOf(base.tokens, 'dark')
  const darkShifted = scaleOf(shifted.tokens, 'dark')
  expect(hueDelta(darkBase[0], darkShifted[0])).toBeGreaterThan(0)
  // dark mode: token 10 is the darkest step -> dark angle (negative)
  expect(hueDelta(darkBase[9], darkShifted[9])).toBeLessThan(0)
})

test('a root-level hueShift does not leak into subsequent generations', () => {
  const pristine = createColorTokens(BASE_CONFIG)
  // root-level hueShift used to be deep-merged into the module-level
  // DEFAULTS, contaminating every later call in the same process
  createColorTokens({
    colors: [{ color: '#00379E', name: 'variant.primary' }],
    formula: 'wcag2',
    hueShift: { dark: -20, light: 15 },
  })
  const afterShiftedRun = createColorTokens(BASE_CONFIG)
  expect(afterShiftedRun.tokens).toEqual(pristine.tokens)
})

test('hueShift preserves the contrast of every step', () => {
  const base = createColorTokens(BASE_CONFIG)
  const shifted = createColorTokens(SHIFTED_CONFIG)

  const backgrounds = {
    light: { rgb: [255, 255, 255] as [number, number, number], baseV: 1 },
    dark: { rgb: [0, 0, 0] as [number, number, number], baseV: 0 },
  }

  for (const mode of ['light', 'dark'] as const) {
    const { rgb, baseV } = backgrounds[mode]
    const baseScale = scaleOf(base.tokens, mode)
    const shiftedScale = scaleOf(shifted.tokens, mode)
    baseScale.forEach((baseValue, index) => {
      const expected = contrast(chroma(baseValue).rgb(), rgb, baseV, 'wcag2')
      const actual = contrast(chroma(shiftedScale[index]).rgb(), rgb, baseV, 'wcag2')
      expect(Math.abs(actual - expected)).toBeLessThan(0.2)
    })
  }
})
