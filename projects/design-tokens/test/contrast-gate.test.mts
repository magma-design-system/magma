import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { expect, test } from 'vitest'

import { getColorsConfig } from '../src/lib/utils.mjs'
import { createColorTokens, type MagmaConfig } from '../src/lib/color.mjs'
import { semantic } from '../semantic.config.js'
import {
  aliasesFromConfig,
  applyBaseline,
  evaluatePairs,
  formatRow,
  resolvePrimitive,
  type Baseline,
  type ColorTree,
} from '../src/lib/contrast-gate.js'

const baseline = (): Baseline =>
  JSON.parse(readFileSync(fileURLToPath(new URL('../contrast-baseline.json', import.meta.url)), 'utf8')).pairs

const loadTree = async (): Promise<ColorTree> => {
  const rc = await getColorsConfig()
  return (createColorTokens(rc!.config as MagmaConfig).tokens as { color: ColorTree }).color
}

// --- unit: the primitive resolver handles every step shape ---

const TREE: ColorTree = {
  surface: { neutral: { light: { default: { value: '#f2f2f2' } }, dark: { default: { value: '#161616' } } } },
  tone: { neutral: { light: { '4': { value: '#636363' }, seed: { value: '#ffffff' } }, dark: { '4': { value: '#9b9b9b' }, seed: { value: '#000000' } } } },
  variant: { primary: { light: { '5': { value: '#3279ff' }, color: { value: '#00379e' } }, dark: { '5': { value: '#3279ff' }, color: { value: '#00379e' } } } },
} as unknown as ColorTree

test('resolvePrimitive maps named roles, numeric steps, seed and bare', () => {
  expect(resolvePrimitive(TREE, '--surface-neutral-default', 'light')).toBe('#f2f2f2')
  expect(resolvePrimitive(TREE, '--surface-neutral-default', 'dark')).toBe('#161616')
  expect(resolvePrimitive(TREE, '--tone-neutral-04', 'light')).toBe('#636363') // "04" -> tree key "4"
  expect(resolvePrimitive(TREE, '--tone-neutral-seed', 'light')).toBe('#ffffff') // seeded family -> "seed"
  expect(resolvePrimitive(TREE, '--tone-neutral-seed', 'dark')).toBe('#000000')
  expect(resolvePrimitive(TREE, '--variant-primary-05', 'light')).toBe('#3279ff')
  expect(resolvePrimitive(TREE, '--variant-primary', 'dark')).toBe('#00379e') // non-seeded bare -> "color"
})

test('resolvePrimitive throws on an unresolvable var (no silent pass)', () => {
  expect(() => resolvePrimitive(TREE, '--tone-neutral-99', 'light')).toThrow(/cannot resolve/)
})

test('aliasesFromConfig maps every --magma-* role to its primitive (A9 contract)', () => {
  const map = aliasesFromConfig(semantic)
  // surfaces/text/border resolve through the active tint family (neutral)
  expect(map['--magma-surface-default']).toBe('--surface-neutral-default')
  expect(map['--magma-text-muted']).toBe('--text-neutral-muted') // A7 by-target primitive
  expect(map['--magma-text-on-emphasis']).toBe('--tone-neutral-seed')
  expect(map['--magma-border-focus']).toBe('--variant-primary')
  // hue quintet steps
  expect(map['--magma-danger-fg']).toBe('--status-error-05')
  expect(map['--magma-accent-emphasis']).toBe('--variant-primary-04')
})

// --- integration: the shipped palette + config mapping + committed baseline ---

test('every semantic pair resolves and is evaluated in both modes', async () => {
  const results = evaluatePairs(await loadTree(), aliasesFromConfig(semantic))
  expect(results.length).toBeGreaterThan(0)
  expect(results.some((r) => r.category === 'text-on-surface' && r.mode === 'light')).toBe(true)
  expect(results.some((r) => r.category === 'text-on-surface' && r.mode === 'dark')).toBe(true)
  expect(results.some((r) => r.category === 'on-emphasis')).toBe(true)
})

test('THE GATE: no enforced pair fails outside the baseline', async () => {
  const results = evaluatePairs(await loadTree(), aliasesFromConfig(semantic))
  const { violations } = applyBaseline(results, baseline())
  expect(
    violations,
    `Enforced contrast failures not covered by contrast-baseline.json:\n${violations.map((r) => formatRow(r)).join('\n')}\n` +
      `If intended, regenerate with: npm run contrast -- --update-baseline`,
  ).toEqual([])
})

test('the committed baseline has no stale entries', async () => {
  const results = evaluatePairs(await loadTree(), aliasesFromConfig(semantic))
  const { staleBaseline } = applyBaseline(results, baseline())
  expect(
    staleBaseline,
    `These baseline entries now pass and should be removed (npm run contrast -- --update-baseline):\n${staleBaseline.join('\n')}`,
  ).toEqual([])
})
