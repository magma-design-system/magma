import { expect, test } from 'vitest'

import {
  createSurfaceTokens,
  lightnessColor,
  parseLightness,
  taper,
} from '../src/lib/surface.mjs'
import { createColorTokens, type MagmaConfig } from '../src/lib/color.mjs'

const THEME: MagmaConfig['theme'] = {
  colorspace: 'OKLCH',
  surfaces: {
    light: { sunken: '92%', muted: '94%', default: '96%', raised: '99%', overlay: '99%' },
    dark: { sunken: '15%', muted: '22%', default: '20%', raised: '24%', overlay: '28%' },
  },
  borders: {
    light: { muted: '87%', default: '82%', strong: '72%' },
    dark: { muted: '30%', default: '36%', strong: '44%' },
  },
}

const withSurfaces = (colors: MagmaConfig['colors']): MagmaConfig => ({
  colors,
  theme: THEME,
})

test('parseLightness accepts percent, bare 0..100 and 0..1', () => {
  expect(parseLightness('96%')).toBeCloseTo(0.96)
  expect(parseLightness('96')).toBeCloseTo(0.96)
  expect(parseLightness(96)).toBeCloseTo(0.96)
  expect(parseLightness(0.96)).toBeCloseTo(0.96)
})

test('taper is 1 at mid lightness and 0 at the extremes', () => {
  expect(taper(0.5)).toBeCloseTo(1)
  expect(taper(0)).toBeCloseTo(0)
  expect(taper(1)).toBeCloseTo(0)
})

test('a neutral (achromatic) key produces a pure grey at every lightness', () => {
  const hex = lightnessColor('#a3a3a3', 0.2)
  expect(hex).toMatch(/^#[0-9a-f]{6}$/)
  const r = hex.slice(1, 3)
  const g = hex.slice(3, 5)
  const b = hex.slice(5, 7)
  expect(r).toBe(g)
  expect(g).toBe(b)
})

test('the dark base surface is lifted off pure black', () => {
  const { surface } = createSurfaceTokens(
    withSurfaces([{ color: '#a3a3a3', name: 'tone.neutral', surface: true }]),
  )
  const darkDefault = surface.neutral.dark.default.value
  expect(darkDefault).not.toBe('#000000')
  // OKLCH L20% neutral resolves to ~#161616, comfortably off black
  expect(darkDefault).toBe('#161616')
})

test('surface + border families are generated for every opted-in color', () => {
  const { surface, border } = createSurfaceTokens(
    withSurfaces([
      { color: '#a3a3a3', name: 'tone.neutral', surface: true },
      { color: '#94a3b8', name: 'tone.porcelain', surface: true },
      { color: '#ED6663', name: 'status.error' },
    ]),
  )
  expect(Object.keys(surface)).toEqual(['neutral', 'porcelain'])
  expect(Object.keys(border)).toEqual(['neutral', 'porcelain'])
  expect(Object.keys(surface.neutral.light)).toEqual([
    'sunken',
    'muted',
    'default',
    'raised',
    'overlay',
  ])
  expect(Object.keys(border.neutral.light)).toEqual(['muted', 'default', 'strong'])
})

test('colors that do not opt in produce no surfaces', () => {
  const { surface, border } = createSurfaceTokens(
    withSurfaces([{ color: '#ED6663', name: 'status.error' }]),
  )
  expect(surface).toEqual({})
  expect(border).toEqual({})
})

test('opting in without a theme block warns and emits nothing', () => {
  const { surface, border } = createSurfaceTokens({
    colors: [{ color: '#a3a3a3', name: 'tone.neutral', surface: true }],
  } as MagmaConfig)
  expect(surface).toEqual({})
  expect(border).toEqual({})
})

test('a per-family override wins over the global ramp', () => {
  const { surface } = createSurfaceTokens(
    withSurfaces([
      {
        color: '#a3a3a3',
        name: 'tone.neutral',
        surface: {
          surfaces: {
            light: { sunken: '90%', muted: '92%', default: '94%', raised: '98%', overlay: '98%' },
            dark: { sunken: '10%', muted: '18%', default: '14%', raised: '20%', overlay: '24%' },
          },
          borders: THEME!.borders,
        },
      },
    ]),
  )
  // default dark L14% differs from the global L20% (#161616)
  expect(surface.neutral.dark.default.value).not.toBe('#161616')
})

test('generation is deterministic', () => {
  const config = withSurfaces([{ color: '#a3a3a3', name: 'tone.neutral', surface: true }])
  expect(JSON.stringify(createSurfaceTokens(config))).toBe(
    JSON.stringify(createSurfaceTokens(config)),
  )
})

test('createColorTokens injects surface/border groups and the theme export group', () => {
  const result = createColorTokens(
    withSurfaces([
      { color: '#a3a3a3', name: 'tone.neutral', surface: true },
      { color: '#ED6663', export: ['status'], name: 'status.error' },
    ]),
  )
  const color = result.tokens.color as Record<string, unknown>
  expect(color.surface).toBeDefined()
  expect(color.border).toBeDefined()
  expect(result.exportGroups.theme).toBeDefined()
  // the non-opted color is untouched by surface generation
  expect((color.status as Record<string, unknown>).error).toBeDefined()
})

test('createColorTokens adds nothing when no color opts in', () => {
  const result = createColorTokens({
    colors: [{ color: '#ED6663', name: 'status.error' }],
    theme: THEME,
  } as MagmaConfig)
  const color = result.tokens.color as Record<string, unknown>
  expect(color.surface).toBeUndefined()
  expect(color.border).toBeUndefined()
  expect(result.exportGroups.theme).toBeUndefined()
})
