import { expect, test } from 'vitest'

import { createColorTokens, MagmaConfig } from '../src/lib/color.mjs'
import realConfig from '../.magma-design-tokensrc.json'

const CONFIG = realConfig as MagmaConfig

// Deeply collect the key order of an object tree, so two results can be
// compared for identical structure independently of their values.
function keyShape(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(keyShape)
  if (value && typeof value === 'object') {
    return Object.keys(value).map((key) => [key, keyShape((value as Record<string, unknown>)[key])])
  }
  return null
}

test('the same config exported twice is byte-for-byte identical', () => {
  const a = createColorTokens(CONFIG)
  const b = createColorTokens(CONFIG)
  // full serialization compares both values and key order in one shot
  expect(JSON.stringify(b.tokens)).toBe(JSON.stringify(a.tokens))
  expect(JSON.stringify(b.exportGroups)).toBe(JSON.stringify(a.exportGroups))
})

test('color and step order follows the config, run after run', () => {
  const first = createColorTokens(CONFIG)
  const second = createColorTokens(CONFIG)
  const orderOf = (tokens: typeof first.tokens) => {
    const root = tokens.color as Record<string, Record<string, { light: object }>>
    return Object.keys(root).flatMap((group) =>
      Object.keys(root[group]).flatMap((name) => [
        `${group}.${name}`,
        ...Object.keys(root[group][name].light).map((step) => `${group}.${name}.${step}`),
      ]),
    )
  }
  const configOrder = CONFIG.colors
    .filter((color) => !color.disabled)
    .map((color) => color.name)
  // surface/border are DERIVED groups (lightness engine, not config colors);
  // they are appended after the APCA colors, so exclude them when checking that
  // the config-driven entries follow the config order.
  const isDerived = (entry: string) => ['surface', 'border', 'text'].includes(entry.split('.')[0])
  const groupName = (entry: string) => entry.split('.').length === 2
  // the config-driven group.name entries appear in the exact order of the config colors
  expect(orderOf(first.tokens).filter((e) => groupName(e) && !isDerived(e))).toEqual(configOrder)
  // the derived surface/border families appear after them, one entry per opted-in
  // family, surfaces first then borders, in config order
  const surfaceFamilies = CONFIG.colors
    .filter((color) => !color.disabled && Boolean(color.surface))
    .map((color) => color.name.split('.')[1])
  // text roles are DERIVED too (by-target, A7); one entry per opted-in family,
  // appended after surfaces and borders in config order
  expect(orderOf(first.tokens).filter((e) => groupName(e) && isDerived(e))).toEqual([
    ...surfaceFamilies.map((family) => `surface.${family}`),
    ...surfaceFamilies.map((family) => `border.${family}`),
    ...surfaceFamilies.map((family) => `text.${family}`),
  ])
  // and the whole flattened order is stable between runs
  expect(orderOf(second.tokens)).toEqual(orderOf(first.tokens))
})

test('a hue-shifted map has the exact same structure as the master, only values differ', () => {
  const master = createColorTokens(CONFIG)
  const shifted = createColorTokens({
    ...CONFIG,
    hueShift: { dark: -30, light: 15, curve: 'smooth' },
  } as MagmaConfig)
  // identical key structure (groups, names, steps, light/dark) in identical order
  expect(keyShape(shifted.tokens)).toEqual(keyShape(master.tokens))
  expect(keyShape(shifted.exportGroups)).toEqual(keyShape(master.exportGroups))
  // shifting actually changed some values (otherwise the test proves nothing)
  expect(JSON.stringify(shifted.tokens)).not.toBe(JSON.stringify(master.tokens))
})

test('master and shifted flatten to the same ordered list, so indexes are interchangeable', () => {
  // flat, ordered list of every emitted swatch path (the sequence a consumer
  // would index into to swap a master swatch for its shifted counterpart)
  const flatten = (tokens: ReturnType<typeof createColorTokens>['tokens']) => {
    const root = tokens.color as Record<
      string,
      Record<string, { light: Record<string, { value: string }>; dark: Record<string, { value: string }> }>
    >
    const paths: string[] = []
    const values: string[] = []
    Object.keys(root).forEach((group) =>
      Object.keys(root[group]).forEach((name) =>
        (['light', 'dark'] as const).forEach((mode) =>
          Object.keys(root[group][name][mode]).forEach((step) => {
            paths.push(`${group}.${name}.${mode}.${step}`)
            values.push(root[group][name][mode][step].value)
          }),
        ),
      ),
    )
    return { paths, values }
  }

  const master = flatten(createColorTokens(CONFIG).tokens)
  const shifted = flatten(
    createColorTokens({ ...CONFIG, hueShift: { dark: -30, light: 15 } } as MagmaConfig).tokens,
  )

  // same length and same path at every index: index i is the same swatch
  expect(shifted.paths).toEqual(master.paths)
  // at least one index actually differs in value (the shift is real)
  expect(shifted.values.some((value, i) => value !== master.values[i])).toBe(true)
})

test('export group key order is stable and follows the config', () => {
  const a = createColorTokens(CONFIG)
  const b = createColorTokens(CONFIG)
  expect(Object.keys(b.exportGroups)).toEqual(Object.keys(a.exportGroups))
  Object.keys(a.exportGroups).forEach((group) => {
    expect(keyShape(b.exportGroups[group])).toEqual(keyShape(a.exportGroups[group]))
  })
})
