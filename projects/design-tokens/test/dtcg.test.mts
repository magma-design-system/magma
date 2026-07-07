import { expect, test } from 'vitest'

import { colorsToDtcg, type ColorTokenTree } from '../src/lib/dtcg.mjs'
import { createColorTokens, type MagmaConfig } from '../src/lib/color.mjs'
import realConfig from '../.magma-design-tokensrc.json'

const SAMPLE: ColorTokenTree = {
  tone: {
    neutral: {
      light: {
        '1': { value: '#000000' },
        '2': { value: '#2A2A2A' },
        color: { value: '#FFFFFF' },
      },
      dark: {
        '1': { value: '#FFFFFF' },
        '2': { value: '#F4F4F4' },
        color: { value: '#000000' },
      },
    },
  },
}

test('maps a mode to DTCG color tokens with type, value and seed rename', () => {
  const light = colorsToDtcg(SAMPLE, 'light')
  expect(light.tone.neutral['1']).toEqual({ $type: 'color', $value: '#000000' })
  // hex values are normalized to lowercase
  expect(light.tone.neutral['2'].$value).toBe('#2a2a2a')
  // the `color` step becomes `seed` and carries a description
  expect(light.tone.neutral.seed).toEqual({
    $type: 'color',
    $value: '#ffffff',
    $description: 'seed / base color',
  })
  // numeric steps stay in ascending order, seed last
  expect(Object.keys(light.tone.neutral)).toEqual(['1', '2', 'seed'])
})

test('each theme mode emits its own values', () => {
  const dark = colorsToDtcg(SAMPLE, 'dark')
  expect(dark.tone.neutral['1'].$value).toBe('#ffffff')
  expect(dark.tone.neutral.seed.$value).toBe('#000000')
})

test('is deterministic', () => {
  expect(JSON.stringify(colorsToDtcg(SAMPLE, 'light'))).toBe(
    JSON.stringify(colorsToDtcg(SAMPLE, 'light')),
  )
})

test('every token of the real palette is a valid DTCG color, per mode', () => {
  const { tokens } = createColorTokens(realConfig as MagmaConfig)
  const color = tokens.color as unknown as ColorTokenTree
  for (const mode of ['light', 'dark'] as const) {
    const dtcg = colorsToDtcg(color, mode)
    const leaves = Object.values(dtcg)
      .flatMap((group) => Object.values(group))
      .flatMap((name) => Object.values(name))
    expect(leaves.length).toBeGreaterThan(0)
    for (const token of leaves) {
      expect(token.$type).toBe('color')
      expect(token.$value).toMatch(/^#[0-9a-f]{3,8}$/)
    }
  }
})
