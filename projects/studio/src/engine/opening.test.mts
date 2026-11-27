import { expect, test } from 'vitest'
import bundledJson from '@maggioli-design-system/design-tokens/.magma-design-tokensrc.json'
import type { MagmaConfig } from '@maggioli-design-system/design-tokens/src/lib/color.mjs'

import { baseColourOf, familyByShortName, fromBrandColour, fromReadyTheme, READY_THEMES } from './opening.js'
import { configThemes } from './scene-css.js'
import { createColorTokens } from '@maggioli-design-system/design-tokens/src/lib/color.mjs'
import { gateReport } from './gate.js'
import { NO_THEME_CHOICES, type ThemeChoices } from './theme-choices.js'

// What the opening opens (#1402): Magma's preset with a theme of the product, from a ready theme or
// from a brand colour (vittorio, 2026-11-27).

const preset = (): MagmaConfig => JSON.parse(JSON.stringify(bundledJson))
const none = (): ThemeChoices => JSON.parse(JSON.stringify(NO_THEME_CHOICES))
/** The themes of a preset, as the select of the Theme section and the gate see them. */
const themesOf = (config: MagmaConfig, choices: ThemeChoices) =>
  configThemes(config, createColorTokens(JSON.parse(JSON.stringify(config))).tokens.color as never, choices)

test('the ready themes are those Magma ships, with their tint, accents and modes', () => {
  expect(READY_THEMES.map(({ name, tint, accents, modes }) => ({ name, tint, accents, modes }))).toEqual([
    { name: 'business', tint: 'neutral', accents: {}, modes: ['light', 'dark'] },
    { name: 'editorial', tint: 'bisque', accents: { accent: 'variant-secondary' }, modes: ['light', 'dark'] },
  ])
  for (const { tint } of READY_THEMES) expect(familyByShortName(preset(), tint)).toBeDefined()
})

test('a ready theme opens Magma\'s preset with a theme of the product, a copy of its tint', () => {
  const editorial = READY_THEMES.find(({ name }) => name === 'editorial')!
  const opened = fromReadyTheme(preset(), none(), editorial)!
  // the copy, a neutral of its own, no hyphen in its name, with surfaces
  expect(opened.family).toBe('tone.myeditorial')
  const copy = opened.config.colors.find(({ name }) => name === opened.family)!
  const bisque = preset().colors.find(({ name }) => name === 'tone.bisque')!
  expect({ ...copy, name: bisque.name }).toEqual({ ...bisque, surface: true })
  // the theme of the copy: its name, the accents and the modes of editorial
  expect(opened.choices).toEqual({
    names: { myeditorial: 'my-editorial' },
    accents: { myeditorial: { accent: 'variant-secondary' } },
    modes: { myeditorial: ['light', 'dark'] },
  })
  // a theme of the preset, beside the ready ones, and judged by the gate
  const themes = themesOf(opened.config, opened.choices)
  expect(themes.map(({ name }) => name)).toContain('my-editorial')
  const report = gateReport(opened.config, opened.choices)
  expect(report.themes.map(({ name }) => name)).toContain('my-editorial')
  // the preset it was given is left as it was
  expect(preset().colors.some(({ name }) => name === 'tone.myeditorial')).toBe(false)
})

test('a second theme from the same ready theme takes the next free names', () => {
  const business = READY_THEMES[0]
  const first = fromReadyTheme(preset(), none(), business)!
  const second = fromReadyTheme(first.config, first.choices, business)!
  expect([first.family, second.family]).toEqual(['tone.mybusiness', 'tone.mybusiness2'])
  expect(second.choices.names).toEqual({ mybusiness: 'my-business', mybusiness2: 'my-business-2' })
})

test('a brand colour becomes a family, a variant that points at it, and the accent of a theme of the product', () => {
  const opened = fromBrandColour(preset(), none(), '#0a7c86')!
  const added = opened.config.colors.slice(preset().colors.length)
  const brand = added[0]
  expect(brand.name).toMatch(/^brand\.[a-z0-9-]+$/)
  expect(brand.color).toBe('#0a7c86')
  const short = brand.name.split('.')[1]
  expect(added.map(({ name }) => name)).toEqual([brand.name, `variant.${short}`, 'tone.mybrand'])
  expect(added[1].alias).toBe(brand.name)
  // the work goes on the brand colour, in Colours
  expect(opened.family).toBe(brand.name)
  // the theme of the product: the tint of business, its accent on the brand
  expect(opened.choices).toEqual({
    names: { mybrand: 'my-brand' },
    accents: { mybrand: { accent: `variant-${short}` } },
    modes: { mybrand: ['light', 'dark'] },
  })
  const tint = opened.config.colors.find(({ name }) => name === 'tone.mybrand')!
  expect(tint.color).toBe(preset().colors.find(({ name }) => name === 'tone.neutral')!.color)
  expect(themesOf(opened.config, opened.choices).map(({ name }) => name)).toContain('my-brand')
})

test('the colour a family shows follows its references', () => {
  const config = preset()
  const primary = config.colors.find(({ name }) => name === 'variant.primary')!
  expect(primary.alias).toBeDefined()
  expect(baseColourOf(config, 'variant.primary')).toBe(config.colors.find(({ name }) => name === primary.alias)!.color)
  expect(baseColourOf(config, 'tone.nothing')).toBeUndefined()
})
