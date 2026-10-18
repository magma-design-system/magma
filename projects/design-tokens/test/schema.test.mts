import { expect, test, vi } from 'vitest'
import { Ajv } from 'ajv'

import { CONFIG_SCHEMA, validateConfig } from '../src/lib/schema.mjs'
import realConfig from '../.magma-design-tokensrc.json'

// the schema is compiled when the module loads, and every CLI command loads
// it: a strict-mode warning there is printed on every start
test('loading the schema module prints no Ajv warning', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  try {
    vi.resetModules()
    await import('../src/lib/schema.mjs')
    expect(warn).not.toHaveBeenCalled()
  } finally {
    warn.mockRestore()
  }
})

// the same schema is published in dist/config for consumers' validators
test('the published schema compiles warning-free with Ajv defaults', () => {
  const warnings: unknown[] = []
  const logger = { log () {}, warn: (...args: unknown[]) => warnings.push(args), error () {} }
  new Ajv({ logger }).compile(CONFIG_SCHEMA)
  expect(warnings).toEqual([])
})

test('a surface level takes a string or a number, nothing else', () => {
  const levels = (sunken: unknown) => ({ sunken, muted: '1', default: 1, raised: 1, overlay: 1 })
  const theme = (sunken: unknown) => ({
    surfaces: { light: levels(sunken), dark: levels(0.1) },
    borders: { light: { muted: 1, default: 1, strong: 1 }, dark: { muted: 1, default: 1, strong: 1 } },
  })
  const config = (sunken: unknown) => ({ colors: [{ color: '#ffffff', name: 'a.b' }], theme: theme(sunken) })

  expect(validateConfig(config('96%')).valid).toBe(true)
  expect(validateConfig(config(0.96)).valid).toBe(true)
  const result = validateConfig(config(true))
  expect(result.valid).toBe(false)
  expect(result.errors.join(' ')).toContain('/theme/surfaces/light/sunken')
})

test('the committed configuration is valid', () => {
  const { valid, errors } = validateConfig(realConfig)
  expect(errors).toEqual([])
  expect(valid).toBe(true)
})

test('a minimal config with one color is valid', () => {
  expect(validateConfig({ colors: [{ color: '#94a3b8', name: 'tone.porcelain' }] }).valid).toBe(true)
})

test('a $schema reference is allowed', () => {
  const config = { $schema: './schema.json', colors: [{ color: '#ffffff', name: 'a.b' }] }
  expect(validateConfig(config).valid).toBe(true)
})

test('a config without colors is rejected', () => {
  expect(validateConfig({}).valid).toBe(false)
  expect(validateConfig({ colors: [] }).valid).toBe(false)
})

test('an invalid hex color is rejected', () => {
  const result = validateConfig({ colors: [{ color: 'blue', name: 'a.b' }] })
  expect(result.valid).toBe(false)
  expect(result.errors.join(' ')).toContain('/colors/0/color')
})

test('a name without a group is rejected', () => {
  const result = validateConfig({ colors: [{ color: '#ffffff', name: 'nogroup' }] })
  expect(result.valid).toBe(false)
  expect(result.errors.join(' ')).toContain('/colors/0/name')
})

test('unknown root and color properties are rejected', () => {
  expect(validateConfig({ colors: [{ color: '#fff', name: 'a.b' }], bogus: 1 }).valid).toBe(false)
  expect(
    validateConfig({ colors: [{ color: '#fff', name: 'a.b', bogus: 1 }] }).valid,
  ).toBe(false)
})

test('an invalid formula enum value is rejected', () => {
  expect(
    validateConfig({ formula: 'wcag9', colors: [{ color: '#fff', name: 'a.b' }] }).valid,
  ).toBe(false)
})
