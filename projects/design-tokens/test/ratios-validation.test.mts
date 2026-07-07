import { expect, test } from 'vitest'

import { createColorTokens, resolveRatios, MagmaConfig } from '../src/lib/color.mjs'

const CONFIG: MagmaConfig = {
  formula: 'wcag3',
  ratios: { wcag3: { default: [15, 30, 60] } } as never,
  colors: [{ color: '#3002e9', name: 'background.void', ratios: 'background' }],
} as MagmaConfig

test('a color referencing an undefined ratios scale throws a clear, actionable error', () => {
  expect(() => resolveRatios(CONFIG.colors[0], CONFIG)).toThrow(
    /references the ratios scale "background".*not defined.*Available scales/,
  )
  // and it surfaces through the full pipeline (not as an opaque .map crash)
  expect(() => createColorTokens(CONFIG)).toThrow(/ratios scale "background"/)
})
