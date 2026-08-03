import { expect, test, vi } from 'vitest'

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

test('resolveRatios warns once on out-of-range targets (above the ceiling)', () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  const config = {
    formula: 'wcag3',
    // 115 is above the APCA ceiling (106); distinct scale name avoids the
    // process-level warn dedupe colliding with other tests
    ratios: { wcag3: { ceiling: [0, 50, 115] } },
    colors: [{ color: '#3002e9', name: 'x.above' }],
  } as unknown as MagmaConfig
  config.colors[0].ratios = 'ceiling'

  resolveRatios(config.colors[0], config)
  resolveRatios(config.colors[0], config) // second call must not re-warn
  expect(warn).toHaveBeenCalledTimes(1)
  expect(warn.mock.calls[0][0]).toMatch(/out-of-range|ceiling/)
  warn.mockRestore()
})

test('resolveRatios does not warn on an in-range scale', () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  const config = {
    formula: 'wcag3',
    ratios: { wcag3: { fine: [0, 46, 97] } },
    colors: [{ color: '#3002e9', name: 'x.fine', ratios: 'fine' }],
  } as unknown as MagmaConfig

  resolveRatios(config.colors[0], config)
  expect(warn).not.toHaveBeenCalled()
  warn.mockRestore()
})
