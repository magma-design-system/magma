import { readdirSync, readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { expect, test, vi } from 'vitest'
import { Ajv } from 'ajv'

import {
  lockedMode,
  readTheme,
  themeDefOf,
  THEME_SCHEMA,
  validateTheme,
  type ThemeManifest,
} from '../src/lib/theme-manifest.mjs'
import { semantic } from '../semantic.config.js'
import { COLOR_MODES_PROPERTY, namedThemeCss, semanticModel, themeOf } from '../semantic.model.js'

const themesDir = fileURLToPath(new URL('../themes/', import.meta.url))
const themeFiles = readdirSync(themesDir).filter((file) => file.endsWith('.json'))
const themeFile = (file: string): unknown => JSON.parse(readFileSync(themesDir + file, 'utf8'))

const theme = (extra: Record<string, unknown> = {}) => ({
  format: 1,
  name: 'paper',
  color: { tint: 'bisque' },
  ...extra,
})

// the schema is compiled when the module loads, and semantic.config.ts loads it in every build
test('loading the theme module prints no Ajv warning', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  try {
    vi.resetModules()
    await import('../src/lib/theme-manifest.mjs')
    expect(warn).not.toHaveBeenCalled()
  } finally {
    warn.mockRestore()
  }
})

// the same schema is published in dist/config for the validators of the products
test('the published theme schema compiles warning-free with Ajv defaults', () => {
  const warnings: unknown[] = []
  const logger = { log () {}, warn: (...args: unknown[]) => warnings.push(args), error () {} }
  new Ajv({ logger }).compile(THEME_SCHEMA)
  expect(warnings).toEqual([])
})

// a file of themes/ that semantic.config.ts does not import would ship nothing, silently
test('every theme file is valid, named by its file and read by semantic.config.ts', () => {
  expect(themeFiles).toEqual(['business.json', 'editorial.json'])
  for (const file of themeFiles) {
    const manifest = readTheme(themeFile(file), Object.keys(semantic.accents))
    expect(`${manifest.name}.json`).toBe(file)
    expect(semantic.themes[manifest.name], file).toBeDefined()
  }
  // the base first: the DTCG export takes the first theme that repoints nothing as its default
  expect(Object.keys(semantic.themes).slice(0, 2)).toEqual(['business', 'editorial'])
})

test('business is the base: :root takes its tint and it repoints nothing', () => {
  const business = themeFile('business.json') as ThemeManifest
  expect(semantic.tint).toBe(business.color.tint)
  expect(semantic.themes.business).toBe(business.color.tint)
  // default is the old name of business, so it follows it
  expect(semantic.themes.default).toMatchObject({ surface: business.color.tint })
})

test('editorial enters the config as the entry it was before the format', () => {
  expect(semantic.themes.editorial).toEqual({
    surface: 'bisque',
    accents: { accent: 'variant-secondary' },
  })
})

test('themeDefOf names the tint as the surface family and carries the accents', () => {
  expect(themeDefOf(theme() as ThemeManifest)).toEqual({ surface: 'bisque' })
  const accents = { accent: 'variant-secondary' }
  expect(themeDefOf(theme({ color: { tint: 'bisque', accents } }) as ThemeManifest)).toEqual({
    surface: 'bisque',
    accents,
  })
})

test('a theme is refused on any field the format does not have', () => {
  expect(validateTheme(theme()).valid).toBe(true)
  expect(validateTheme(theme({ $schema: './magma-theme.schema.json' })).valid).toBe(true)

  const refused = (value: unknown, path: string) => {
    const result = validateTheme(value)
    expect(result.valid).toBe(false)
    expect(result.errors.join(' ')).toContain(path)
  }
  // a reader refuses a format it does not know instead of guessing
  refused(theme({ format: 2 }), '/format')
  // the names mds-pref-theme accepts
  refused(theme({ name: 'Editorial' }), '/name')
  refused(theme({ surface: 'bisque' }), '(root)')
  refused(theme({ color: {} }), '/color')
  refused(theme({ color: { tint: 'bisque', radius: 4 } }), '/color')
  refused(theme({ color: { tint: '--surface-bisque' } }), '/color/tint')
  refused(theme({ color: { tint: 'bisque', accents: { accent: 'Variant Secondary' } } }), '/color/accents')
  // the modes are the values of color-scheme, each once, at least one
  refused(theme({ color: { tint: 'bisque', modes: ['night'] } }), '/color/modes/0')
  refused(theme({ color: { tint: 'bisque', modes: [] } }), '/color/modes')
  refused(theme({ color: { tint: 'bisque', modes: ['dark', 'dark'] } }), '/color/modes')
  refused(theme({ color: { tint: 'bisque', modes: 'dark' } }), '/color/modes')
})

// format 1 takes the field: left out it means both modes, what every file meant before it
test('a theme lists the colour modes it can be used in, both when it says nothing', () => {
  const moded = (modes: string[]) => theme({ color: { tint: 'bisque', modes } })
  expect(validateTheme(moded(['dark'])).valid).toBe(true)
  expect(validateTheme(moded(['light', 'dark'])).valid).toBe(true)

  expect(lockedMode()).toBeUndefined()
  expect(lockedMode(['light', 'dark'])).toBeUndefined()
  expect(lockedMode(['dark'])).toBe('dark')
  expect(lockedMode(['light'])).toBe('light')

  // a single mode reaches the config, both modes leave the entry as it was
  expect(themeDefOf(moded(['dark']) as ThemeManifest)).toEqual({ surface: 'bisque', modes: ['dark'] })
  expect(themeDefOf(moded(['dark', 'light']) as ThemeManifest)).toEqual({ surface: 'bisque' })
})

test('the block of a single-mode theme declares its mode first, a theme for both says nothing', () => {
  const night = namedThemeCss(themeOf('night', { surface: 'bisque', modes: ['dark'] }))
  expect(night).toMatch(new RegExp(`^:root\\[data-theme-name='night'\\] \\{\n  ${COLOR_MODES_PROPERTY}: dark;\n  --magma-tint-`))
  expect(night.match(new RegExp(COLOR_MODES_PROPERTY, 'g'))).toHaveLength(1)

  // a theme that only locks the mode still has a block, the mode alone
  expect(namedThemeCss(themeOf('paper', { surface: semantic.tint, modes: ['light'] }))).toBe(
    `:root[data-theme-name='paper'] {\n  ${COLOR_MODES_PROPERTY}: light;\n}`,
  )
  expect(namedThemeCss(themeOf('both', { surface: semantic.tint, modes: ['light', 'dark'] }))).toBe('')

  // the themes Magma ships take both modes: themes.css does not change
  for (const shipped of semanticModel().themes) {
    expect(shipped.mode, shipped.name).toBeUndefined()
    expect(namedThemeCss(shipped)).not.toContain(COLOR_MODES_PROPERTY)
  }
})

test('readTheme throws every error with the name of the theme', () => {
  expect(() => readTheme(theme({ format: 2, name: 'paper' }))).toThrow(/"paper".*\n.*\/format/)
  expect(() => readTheme(null)).toThrow('(no name)')
})

test('a theme repoints the accent roles of the layer, it never adds one', () => {
  const roles = ['accent', 'ai']
  const accented = (accents: Record<string, string>) =>
    theme({ color: { tint: 'bisque', accents } })
  expect(readTheme(accented({ ai: 'variant-secondary' }), roles).name).toBe('paper')
  expect(() => readTheme(accented({ brand: 'variant-secondary' }), roles)).toThrow(
    '/color/accents/brand is not an accent role of the layer (accent, ai)',
  )
})
