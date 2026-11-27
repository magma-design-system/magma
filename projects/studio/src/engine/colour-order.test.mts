import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'
import initialConfigJson from '@maggioli-design-system/design-tokens/.magma-design-tokensrc.json'

import { chromaticOrder, groupsInOrder, HUE_READABLE, presetInOrder } from './colour-order.js'

// The order of the families (studio.object-model.md, section 4, Family, chosen on its render on
// 2026-11-27, option B): grouped, the variants first, chromatic inside each group.

const here = path.dirname(fileURLToPath(import.meta.url))
const preset = initialConfigJson as unknown as { colors: { name: string; color?: string; alias?: string }[] }
const namesOf = (families: { name: string }[], group: string) =>
  families.filter((one) => one.name.startsWith(`${group}.`)).map((one) => one.name.split('.')[1])

test('the threshold of a readable hue is the one of design-tokens', () => {
  const source = readFileSync(
    path.resolve(here, '../../../design-tokens/src/lib/ramp-grade.mts'),
    'utf8',
  )
  expect(source).toMatch(new RegExp(`const HUE_READABLE = ${HUE_READABLE};`))
})

test('the groups keep their order, the variants first', () => {
  expect(groupsInOrder(preset.colors)).toEqual(['variant', 'tone', 'status', 'label', 'brand'])
  const runs = chromaticOrder(preset.colors)
    .map((one) => one.name.split('.')[0])
    .filter((group, index, all) => group !== all[index - 1])
  // each group in one run, in the order of the groups
  expect(runs).toEqual(['variant', 'tone', 'status', 'label', 'brand'])
  // a new group goes last
  expect(groupsInOrder([...preset.colors, { name: 'game.lava', color: '#f00' }]).at(-1)).toBe('game')
})

test('the families of Magma in chromatic order, the hues from red', () => {
  const sorted = chromaticOrder(preset.colors)
  expect(namesOf(sorted, 'label')).toEqual([
    'amaranth', 'red', 'orange', 'yellow', 'lime', 'green', 'aqua', 'sky', 'blue', 'violet',
    'purple', 'orchid',
  ])
  expect(namesOf(sorted, 'status')).toEqual(['error', 'warning', 'success', 'info'])
  expect(namesOf(sorted, 'brand')).toEqual(['rnd', 'maggioli', 'maggioli-editore'])
})

test('the neutrals run from cool to warm, so a grey with a cast stays among them', () => {
  const sorted = chromaticOrder(preset.colors)
  // porcelain has a chroma of 0.035: by hue alone it would leave the greys
  expect(namesOf(sorted, 'tone')).toEqual(['porcelain', 'kaolin', 'neutral', 'bisque', 'fireclay'])
})

test('a reference takes the place of the family it follows', () => {
  const sorted = chromaticOrder(preset.colors)
  // primary follows brand.maggioli (262 degrees), ai label.violet (293)
  expect(namesOf(sorted, 'variant')).toEqual(['primary', 'secondary', 'ai'])
  const swapped = chromaticOrder([
    { name: 'variant.ai', alias: 'label.violet' },
    { name: 'variant.alert', alias: 'label.red' },
    { name: 'label.violet', color: '#8b5cf6' },
    { name: 'label.red', color: '#d01b1b' },
  ])
  expect(swapped.map((one) => one.name)).toEqual([
    'variant.alert',
    'variant.ai',
    'label.red',
    'label.violet',
  ])
})

test('in a group of hues the greys come first, the lightest first', () => {
  const sorted = chromaticOrder([
    { name: 'chart.blue', color: '#0E36F6' },
    { name: 'chart.ink', color: '#333333' },
    { name: 'chart.red', color: '#d01b1b' },
    { name: 'chart.paper', color: '#eeeeee' },
  ])
  expect(sorted.map((one) => one.name)).toEqual(['chart.paper', 'chart.ink', 'chart.red', 'chart.blue'])
})

test('a family with no colour to read comes last, in the order it had', () => {
  const sorted = chromaticOrder([
    { name: 'label.lost', alias: 'label.gone' },
    { name: 'label.bad', color: 'not a colour' },
    { name: 'label.red', color: '#d01b1b' },
  ])
  expect(sorted.map((one) => one.name)).toEqual(['label.red', 'label.lost', 'label.bad'])
})

test('the preset goes out with its families in order, the rest as it was', () => {
  const config = { colorspace: 'HSL', colors: preset.colors }
  const out = presetInOrder(config)
  expect(out.colorspace).toBe('HSL')
  expect(out.colors.map((one) => one.name)).toEqual(chromaticOrder(preset.colors).map((one) => one.name))
  // the configuration it was given stays as it was
  expect(config.colors).toBe(preset.colors)
})
