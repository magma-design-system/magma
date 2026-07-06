import { expect, test } from 'vitest'

import {
  createColorTokens,
  resolveFormula,
  resolveRatiosName,
  MagmaConfig,
} from '../src/lib/color.mjs'

test('group-level ratios and formula apply to all colors of the group', () => {
  const perColor = createColorTokens({
    colors: [
      { color: '#00379E', name: 'variant.primary', ratios: 'tone', formula: 'wcag2' },
      { color: '#0f4ad5', name: 'variant.secondary', ratios: 'tone', formula: 'wcag2' },
    ],
  } as MagmaConfig)
  const viaGroup = createColorTokens({
    groups: { variant: { ratios: 'tone', formula: 'wcag2' } },
    colors: [
      { color: '#00379E', name: 'variant.primary' },
      { color: '#0f4ad5', name: 'variant.secondary' },
    ],
  } as MagmaConfig)
  expect(viaGroup.tokens).toEqual(perColor.tokens)
})

test('per-color settings win over the group settings', () => {
  const config: MagmaConfig = {
    groups: { variant: { ratios: 'tone', formula: 'wcag2' } },
    colors: [
      { color: '#00379E', name: 'variant.primary', ratios: 'default', formula: 'wcag3' },
    ],
  } as MagmaConfig
  expect(resolveRatiosName(config.colors[0], config)).toBe('default')
  expect(resolveFormula(config.colors[0], config)).toBe('wcag3')
})

test('colors of other groups are not affected', () => {
  const config: MagmaConfig = {
    groups: { tone: { ratios: 'tone' } },
    formula: 'wcag3',
    colors: [{ color: '#00379E', name: 'variant.primary' }],
  } as MagmaConfig
  expect(resolveRatiosName(config.colors[0], config)).toBe('default')
  expect(resolveFormula(config.colors[0], config)).toBe('wcag3')
})
