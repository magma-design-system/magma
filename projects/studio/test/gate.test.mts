import { expect, test } from 'vitest'

import initialConfig from '@maggioli-design-system/design-tokens/.magma-design-tokensrc.json'
import type { MagmaConfig } from '@maggioli-design-system/design-tokens/src/lib/color.mjs'
import { createColorTokens } from '@maggioli-design-system/design-tokens/src/lib/color.mjs'
import { gatePairs, type ColorTree, type PairResult } from '@maggioli-design-system/design-tokens/src/lib/contrast-gate.js'
import { semantic } from '@maggioli-design-system/design-tokens/semantic.config'
import { gateFailures, gateReport, gateVerdict, type GateTheme } from '../src/gate.js'
import { NO_THEME_CHOICES, type ThemeChoices } from '../src/theme-choices.js'

// The studio runs the contrast gate of design-tokens on the configuration it edits (#698): the
// pairs `nx run design-tokens:contrast` measures, with its targets, on the themes of the Themes
// page, each pair in both modes. The badge of the Colors menu says what the CLI says of the same
// configuration: the gate passes on the configuration Magma builds with.

const config = () => JSON.parse(JSON.stringify(initialConfig)) as MagmaConfig
const choices = (some: Partial<ThemeChoices>): ThemeChoices => ({ ...NO_THEME_CHOICES, ...some })
const treeOf = (one: MagmaConfig) =>
  (createColorTokens(JSON.parse(JSON.stringify(one))).tokens as { color: ColorTree }).color
const themeOf = (themes: GateTheme[], name: string) => themes.find((theme) => theme.name === name)!
const pairOf = (theme: GateTheme, fg: string, bg: string) =>
  theme.pairs.find((pair) => pair.fg === fg && pair.bg === bg)!

/** Text targets under the floors of the gate: the text roles fail in both modes. */
const lowText = () => {
  const low = config()
  low.theme!.text = { default: 20, muted: 15, subtle: 10, disabled: 5 }
  return low
}

test('the configuration Magma builds with passes the gate', () => {
  expect(gateVerdict(config()).state).toBe('pass')
})

test('text targets under their floors fail the gate', () => {
  const verdict = gateVerdict(lowText())
  expect(verdict.state).toBe('fail')
  expect(verdict.state === 'fail' && verdict.violations).toBeGreaterThan(0)
})

test('the gate judges the themes of the Themes page, every pair in both modes', () => {
  const { themes } = gateReport(config())
  expect(themes.map(({ name, family, base }) => ({ name, family, base }))).toEqual([
    { name: 'business', family: 'neutral', base: true },
    { name: 'porcelain', family: 'porcelain', base: false },
    { name: 'editorial', family: 'bisque', base: false },
  ])
  for (const theme of themes) {
    expect(new Set(theme.pairs.map((pair) => pair.category))).toEqual(
      new Set(['text-on-surface', 'on-emphasis', 'text-on-hue', 'text-on-wash', 'hue-fg', 'border']),
    )
    for (const pair of theme.pairs) {
      expect(pair.cells.light.mode).toBe('light')
      expect(pair.cells.dark.mode).toBe('dark')
      expect(pair.cells.light.state === 'pass').toBe(pair.cells.light.pass)
    }
  }
  // the targets of the CI: 75 / 75 / 45 / 30 for the text, 75 for the fill ink in light
  const business = themeOf(themes, 'business')
  expect(
    ['default', 'muted', 'subtle', 'disabled'].map(
      (role) => pairOf(business, `text-${role}`, 'surface-raised').cells.light.target,
    ),
  ).toEqual([75, 75, 45, 30])
  expect(pairOf(business, 'accent-on-emphasis', 'accent-emphasis').cells.light.target).toBe(75)
})

test('the pairs are the ones the CLI measures, with the same values', () => {
  const tree = treeOf(config())
  const cli = gatePairs(tree, semantic, semantic.themes)
  const { themes } = gateReport(config())
  // the CLI measures every pair in light, then every pair in dark
  const cellsOf = (theme: GateTheme) => [
    ...theme.pairs.map((pair) => pair.cells.light),
    ...theme.pairs.map((pair) => pair.cells.dark),
  ]
  const strip = ({ key, achieved, target, severity, fgHex, bgHex }: PairResult) => ({
    key, achieved, target, severity, fgHex, bgHex,
  })
  // the base layer, then the theme Magma ships from the same family, keyed `<theme>:<pair>`
  expect(cellsOf(themeOf(themes, 'business')).map(strip)).toEqual(cli.base.map(strip))
  const editorial = cli.themes.find((theme) => theme.name === 'editorial')!
  expect(cellsOf(themeOf(themes, 'editorial')).map(strip)).toEqual(editorial.results.map(strip))
})

test('a theme is judged only in the modes it is used in', () => {
  const both = gateReport(lowText())
  const failing = themeOf(both.themes, 'business').failing
  expect(failing.light).toBeGreaterThan(0)
  expect(failing.dark).toBeGreaterThan(0)

  // the base theme light only: its dark pairs are measured, never judged
  const light = gateReport(lowText(), choices({ modes: { neutral: ['light'] } }))
  const business = themeOf(light.themes, 'business')
  expect(business.failing).toEqual({ light: failing.light, dark: 0 })
  expect(business.pairs.every((pair) => pair.cells.dark.state === 'off')).toBe(true)
  expect(business.pairs.some((pair) => !pair.cells.dark.pass)).toBe(true)
  const count = (report: typeof both) => (report.verdict.state === 'fail' ? report.verdict.violations : 0)
  expect(count(light)).toBe(count(both) - failing.dark)
  expect(gateFailures(light).filter(({ theme }) => theme === 'business').every(({ cell }) => cell.mode === 'light')).toBe(true)
})

test('the accents the Themes page repoints are the accents the gate measures', () => {
  const tree = treeOf(config())
  const secondary = tree.variant.secondary.light['4'].value
  const primary = tree.variant.primary.light['4'].value
  const fill = (report: ReturnType<typeof gateReport>, name: string) =>
    pairOf(themeOf(report.themes, name), 'accent-on-emphasis', 'accent-emphasis').cells.light.bgHex

  // a theme repoints its own accent, the base keeps the one of the layer
  const own = gateReport(config(), choices({ accents: { porcelain: { accent: 'variant-secondary' } } }))
  expect(fill(own, 'porcelain')).toBe(secondary)
  expect(fill(own, 'business')).toBe(primary)

  // the base repoints it in :root, and a theme that leaves it alone follows it, as the CSS does
  const root = gateReport(config(), choices({ accents: { neutral: { accent: 'variant-secondary' } } }))
  expect(fill(root, 'business')).toBe(secondary)
  expect(fill(root, 'porcelain')).toBe(secondary)
})

test('a theme of the studio is judged under the name the Themes page gives it', () => {
  const blue = config()
  blue.colors.find((color) => color.name === 'label.blue')!.surface = true
  const report = gateReport(blue, choices({ names: { blue: 'ocean' } }))
  const ocean = themeOf(report.themes, 'ocean')
  expect(ocean.family).toBe('blue')
  // keyed as the CLI keys a theme, its neutral hue on the ramp of its group, as the export
  // repoints it (label-blue, not a tone)
  const neutral = pairOf(ocean, 'neutral-on-emphasis', 'neutral-emphasis').cells.light
  expect(neutral.key).toBe('ocean:neutral-on-emphasis|neutral-emphasis|light')
  expect(neutral.bgHex).toBe(treeOf(blue).label.blue.light['2'].value)
})

test('a configuration whose base family has no surface is not measured, and says why', () => {
  const bare = config()
  delete bare.colors.find((color) => color.name === 'tone.neutral')!.surface
  const report = gateReport(bare)
  expect(report.verdict).toEqual({ state: 'error', message: expect.stringContaining('neutral') })
  expect(report.themes).toEqual([])
})
