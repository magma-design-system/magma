import { expect, test } from 'vitest'

import { validateConfig } from '../src/lib/schema.mjs'
import realConfig from '../.magma-design-tokensrc.json'

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
