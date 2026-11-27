import { expect, test } from 'vitest'

import initialConfig from '@maggioli-design-system/design-tokens/.magma-design-tokensrc.json'
import type { MagmaConfig } from '@maggioli-design-system/design-tokens/src/lib/color.mjs'
import { COLOR_MODES_PROPERTY, namedThemeCss, themeOf } from '@maggioli-design-system/design-tokens/semantic.model'
import { semantic } from '@maggioli-design-system/design-tokens/semantic.config'
import { NO_THEME_CHOICES, moveChoices, type ThemeChoices } from './theme-choices.js'
import {
  accentChoices,
  accentSample,
  apcaLc,
  kindOfTheme,
  themeRows,
  themeSetsOf,
  themesCssOf,
  tintChoices,
} from './theme-list.js'

// The themes of a preset as the stage Themes lists them (#1404; the Themes page until then): what
// each theme is, the families a theme of the product may take its tint from, the samples of its
// accents, and the CSS of the themes the menu of the exit downloads, printed by the code that
// writes themes.css.

const config = (): MagmaConfig => JSON.parse(JSON.stringify(initialConfig)) as MagmaConfig
const rowsOf = (preset: MagmaConfig, choices: ThemeChoices = NO_THEME_CHOICES) =>
  themeRows(preset, themeSetsOf(preset).color!, choices)
/** The block a theme prints, by its name. */
const blockOf = (css: string, name: string) =>
  css.match(new RegExp(`:root\\[data-theme-name='${name}'\\] \\{[^}]*\\}`))?.[0] ?? ''

test('the themes of the preset: the base first, the ready ones Magma ships, then the product', () => {
  const rows = rowsOf(config())
  expect(rows.map(({ name, family, kind }) => `${name}:${family}:${kind}`)).toEqual([
    'business:neutral:base',
    'porcelain:porcelain:product',
    'editorial:bisque:ready',
  ])
  // a theme is named apart from its family, and knows the family's full name for Colours
  expect(rows[2].fullName).toBe('tone.bisque')
  expect(rows.every((row) => row.nameProblem === null)).toBe(true)
  expect(kindOfTheme(semantic.tint)).toBe('base')
})

test('a theme is drawn from a family of any group, one created in the studio too, never from status', () => {
  const preset = config()
  const blue = preset.colors.find((color) => color.name === 'label.blue')!
  blue.surface = true
  preset.colors.push({ ...blue, name: 'product.ocean' })
  // a status colour opted in on its own is still no theme: it would mix with its messages
  preset.colors.find((color) => color.name === 'status.info')!.surface = true
  const families = rowsOf(preset).map((row) => row.fullName)
  expect(families).toContain('label.blue')
  expect(families).toContain('product.ocean')
  expect(preset.groups?.status?.surface).toBe(true)
  expect(families.some((family) => family.startsWith('status.'))).toBe(false)
})

test('a theme whose name cannot be used is listed with why: the stage is where it is renamed', () => {
  const rows = rowsOf(config(), { ...NO_THEME_CHOICES, names: { porcelain: 'Cold Desk' } })
  expect(rows.find((row) => row.family === 'porcelain')?.nameProblem).toBe(
    'lowercase words joined by hyphens, as editorial or my-product',
  )
  // a name Magma ships, or one another theme has, is refused too
  const taken = rowsOf(config(), { ...NO_THEME_CHOICES, names: { porcelain: 'editorial' } })
  expect(taken.find((row) => row.family === 'porcelain')?.nameProblem).toMatch(/editorial is a theme Magma ships/)
})

test('a theme of the product takes its tint from a family of its own colour, not status nor a variant, nor another theme', () => {
  const preset = config()
  const rows = rowsOf(preset)
  const tints = tintChoices(preset, rows, 'porcelain')
  // its own family is a choice, the families of the other themes are not
  expect(tints).toContain('tone.porcelain')
  expect(tints).not.toContain('tone.neutral')
  expect(tints).not.toContain('tone.bisque')
  // no status colour, no variant (references), no reference of any group
  expect(tints.some((name) => name.startsWith('status.') || name.startsWith('variant.'))).toBe(false)
  for (const name of tints) expect(preset.colors.find((one) => one.name === name)?.alias).toBeUndefined()
  // labels and brands back a monochromatic theme
  expect(tints).toContain('label.blue')
  expect(tints).toContain('brand.maggioli')
  // in the chromatic order of Colours: the neutrals first, as the list of the families shows them
  expect(tints.indexOf('tone.kaolin')).toBeLessThan(tints.indexOf('label.red'))
})

test('the choices of a theme move with it to a new tint, its name kept', () => {
  const choices: ThemeChoices = {
    names: { porcelain: 'cold-desk' },
    accents: { porcelain: { accent: 'variant-secondary' } },
    modes: { porcelain: ['dark'] },
  }
  expect(moveChoices(choices, 'porcelain', 'kaolin', 'cold-desk')).toEqual({
    names: { kaolin: 'cold-desk' },
    accents: { kaolin: { accent: 'variant-secondary' } },
    modes: { kaolin: ['dark'] },
  })
  // a theme with no name of its own keeps the one it had, its family's
  expect(moveChoices(NO_THEME_CHOICES, 'porcelain', 'kaolin', 'porcelain').names).toEqual({ kaolin: 'porcelain' })
})

test('an accent on a theme: the fill of its variant with the ink of a fill and their Lc, its wash', () => {
  const { sets } = themeSetsOf(config())
  expect(accentChoices(sets!)).toEqual(expect.arrayContaining(['variant-primary', 'variant-ai']))
  for (const mode of ['light', 'dark'] as const) {
    const sample = accentSample(sets!, 'neutral', 'variant-primary', mode)
    expect(sample.fill).toMatch(/^#[0-9a-f]{6}$/i)
    expect(sample.wash).toMatch(/^#[0-9a-f]{6}$/i)
    expect(sample.lc).toBe(Math.round(apcaLc(sample.ink, sample.fill)))
    // a fill is legible: its ink holds the floor of text on a fill
    expect(sample.lc).toBeGreaterThan(45)
  }
  // the ink of a fill: the seed in light, the canvas of the theme in dark (spec 6.5)
  expect(accentSample(sets!, 'neutral', 'variant-primary', 'light').ink).toBe(sets!.seeds.light)
})

test('a preset the generator refuses has no sets, and says why', () => {
  const broken = config()
  broken.colors[0] = { ...broken.colors[0], color: 'not a colour' as never }
  const { sets, color, error } = themeSetsOf(broken)
  expect(sets).toBeNull()
  expect(color).toBeNull()
  expect(error).toBeTruthy()
})

// The CSS of the themes (the menu of the exit, #1404; Copy CSS of the Themes page until then)
test('the CSS of the themes prints each theme as themes.css does: the ready ones by their name and accents', () => {
  const css = themesCssOf(config(), NO_THEME_CHOICES)
  const names = [...css.matchAll(/^:root\[data-theme-name='([^']+)'\] \{/gm)].map((m) => m[1])
  expect(names).toContain('editorial')
  expect(names).not.toContain('bisque')
  const expected = names.map((name) =>
    name in semantic.themes
      ? namedThemeCss(themeOf(name, semantic.themes[name]))
      : namedThemeCss(themeOf(name, { surface: name })),
  )
  expect(css).toBe(expected.join('\n\n'))
  expect(css).toContain(":root[data-theme-name='editorial'].pref-contrast-more {")
  // every theme but the base repoints the tint ramp
  for (const block of css.match(/:root\[data-theme-name='[^']+'\] \{[^}]*\}/g) ?? [])
    expect(block).toContain('--magma-tint-scale-')
})

test('a theme of another group repoints the ramp of its group, never a tone- ramp that does not exist', () => {
  const preset = config()
  preset.colors.find((color) => color.name === 'label.violet')!.surface = true
  const block = blockOf(themesCssOf(preset, NO_THEME_CHOICES), 'violet')
  expect(block).toContain('var(--label-violet-01)')
  expect(block).not.toContain('tone-violet')
})

test('a theme of one mode declares it first in its block; the base under its own name, never in :root', () => {
  const editorial = themesCssOf(config(), { ...NO_THEME_CHOICES, modes: { bisque: ['dark'] } })
  const locked = namedThemeCss(themeOf('editorial', { ...(semantic.themes.editorial as object), modes: ['dark'] }))
  expect(locked).toMatch(new RegExp(`^:root\\[data-theme-name='editorial'\\] \\{\n  ${COLOR_MODES_PROPERTY}: dark;\n`))
  expect(editorial).toContain(locked)
  expect(editorial.match(new RegExp(COLOR_MODES_PROPERTY, 'g'))).toHaveLength(1)
  expect(themesCssOf(config(), NO_THEME_CHOICES)).not.toContain(COLOR_MODES_PROPERTY)

  const base = themesCssOf(config(), { ...NO_THEME_CHOICES, modes: { neutral: ['light'] } })
  expect(base).toContain(`:root[data-theme-name='business'] {\n  ${COLOR_MODES_PROPERTY}: light;\n}`)
  expect(base).not.toMatch(new RegExp(`^:root \\{[^}]*${COLOR_MODES_PROPERTY}`, 'm'))
})

test('an accent the base repoints is a change of :root; the name a person gives follows into the CSS', () => {
  const base = themesCssOf(config(), {
    ...NO_THEME_CHOICES,
    accents: { neutral: { accent: 'variant-secondary' } },
  })
  expect(base).toMatch(/^:root \{\n[^}]*variant-secondary/)
  const named = themesCssOf(config(), { ...NO_THEME_CHOICES, names: { porcelain: 'cold-desk' } })
  expect(blockOf(named, 'cold-desk')).toContain('--magma-tint-scale-')
  expect(blockOf(named, 'porcelain')).toBe('')
})
