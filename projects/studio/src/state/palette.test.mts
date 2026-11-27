import { expect, test } from 'vitest'

import { nearestColorName } from '../engine/color-names.js'
import {
  addFamily,
  autoNameFamily,
  deleteFamily,
  duplicateFamily,
  forgetRemoval,
  patchFamily,
  selectFamily,
  setGlobal,
  undoRemoval,
  type NewFamily,
} from './palette.js'
import { familyOf, quietStudio } from './testing.mjs'

// The actions of the Palette (#1400): the families of the configuration and its global settings.

const red = (patch: Partial<NewFamily> = {}): NewFamily => ({
  kind: 'color',
  group: 'label',
  name: 'red',
  color: '#d01b1b',
  alias: '',
  manual: true,
  ...patch,
})

test('a family is added at the end, unique in its group, and selected', () => {
  const studio = quietStudio()
  const count = studio.config.value.colors.length
  // label.red is a family of Magma: the new one counts up
  expect(addFamily(studio, red())).toBe('label.red-2')
  expect(addFamily(studio, red())).toBe('label.red-3')
  expect(studio.config.value.colors).toHaveLength(count + 2)
  expect(studio.config.value.colors.at(-1)).toEqual({ name: 'label.red-3', color: '#d01b1b' })
  expect(studio.selectedName.value).toBe('label.red-3')
})

test('a reference carries the family it follows and no colour of its own', () => {
  const studio = quietStudio()
  const name = addFamily(studio, red({ kind: 'alias', group: 'variant', name: 'brand', alias: 'label.red' }))
  expect(familyOf(studio, name)).toEqual({ name: 'variant.brand', alias: 'label.red' })
})

test('a family named after its colour keeps following it; one named by the person does not', () => {
  const studio = quietStudio()
  // the colour field of the editor: the colour first, then the name after it
  const recolour = (name: string, hex: `#${string}`) => {
    patchFamily(studio, name, { color: hex })
    autoNameFamily(studio, name, hex)
  }
  const auto = addFamily(studio, red({ name: nearestColorName('#d01b1b'), manual: false }))
  recolour(auto, '#1e40af')
  const renamed = `label.${nearestColorName('#1e40af')}`
  expect(familyOf(studio, auto)).toBeUndefined()
  expect(familyOf(studio, renamed)?.color).toBe('#1e40af')
  expect(studio.selectedName.value).toBe(renamed)
  expect(studio.notice.value).toBeNull()

  const typed = addFamily(studio, red({ name: 'brand' }))
  recolour(typed, '#1e40af')
  expect(familyOf(studio, typed)).toBeDefined()
  // a colour another family has is a warning, never a refusal
  expect(studio.notice.value).toEqual({
    text: 'Warning: {hex} is already used by "{name}"',
    vars: { hex: '#1e40af', name: renamed },
  })
  // a name typed in the editor stops the following too
  patchFamily(studio, renamed, { name: 'label.my-blue' })
  recolour('label.my-blue', '#047857')
  expect(familyOf(studio, 'label.my-blue')).toBeDefined()
})

test('a family is copied right after it and the copy selected; a family deleted selects the first', () => {
  const studio = quietStudio()
  const names = () => studio.config.value.colors.map((one) => one.name)
  const at = names().indexOf('tone.neutral')
  duplicateFamily(studio, 'tone.neutral')
  expect(names()[at + 1]).toBe('tone.neutral-copy')
  expect(familyOf(studio, 'tone.neutral-copy')?.color).toBe(familyOf(studio, 'tone.neutral')?.color)
  expect(studio.selectedName.value).toBe('tone.neutral-copy')

  deleteFamily(studio, 'tone.neutral-copy')
  expect(names()).not.toContain('tone.neutral-copy')
  expect(studio.selectedName.value).toBe(names()[0])
})

test('the fields of a family: one set to undefined goes, a colour and a reference exclude each other', () => {
  const studio = quietStudio()
  patchFamily(studio, 'label.red', { ratios: 'tint' })
  expect(familyOf(studio, 'label.red')?.ratios).toBe('tint')
  patchFamily(studio, 'label.red', { ratios: undefined })
  expect(familyOf(studio, 'label.red')).not.toHaveProperty('ratios')

  patchFamily(studio, 'label.red', { alias: 'tone.neutral' })
  expect(familyOf(studio, 'label.red')).toMatchObject({ alias: 'tone.neutral' })
  expect(familyOf(studio, 'label.red')).not.toHaveProperty('color')
  patchFamily(studio, 'label.red', { color: '#d01b1b' })
  expect(familyOf(studio, 'label.red')).not.toHaveProperty('alias')

  // a new name follows the family in the selection
  selectFamily(studio, 'label.red')
  patchFamily(studio, 'label.red', { name: 'label.crimson' })
  expect(studio.selectedName.value).toBe('label.crimson')
})

test('the global settings: a value set, a curve removed', () => {
  const studio = quietStudio()
  setGlobal(studio, 'colorspace', 'OKLCH')
  setGlobal(studio, 'smooth', true)
  expect(studio.config.value).toMatchObject({ colorspace: 'OKLCH', smooth: true })
  setGlobal(studio, 'saturation', { dark: 10, light: 20, curve: 'smooth' })
  expect(studio.config.value.saturation).toEqual({ dark: 10, light: 20, curve: 'smooth' })
  setGlobal(studio, 'saturation', undefined)
  expect(studio.config.value).not.toHaveProperty('saturation')
})

test('a family deleted asks nothing and comes back where it stood, the selection with it', () => {
  const studio = quietStudio()
  selectFamily(studio, 'label.red')
  const names = studio.config.value.colors.map((one) => one.name)
  const red = familyOf(studio, 'label.red')
  deleteFamily(studio, 'label.red')
  expect(studio.config.value.colors.map((one) => one.name)).not.toContain('label.red')
  expect(studio.lastRemoval.value).toMatchObject({ index: names.indexOf('label.red'), selectedName: 'label.red' })
  undoRemoval(studio)
  expect(studio.config.value.colors.map((one) => one.name)).toEqual(names)
  expect(familyOf(studio, 'label.red')).toEqual(red)
  expect(studio.selectedName.value).toBe('label.red')
  expect(studio.lastRemoval.value).toBeNull()
  // closed, the removal stays
  deleteFamily(studio, 'label.red')
  forgetRemoval(studio)
  undoRemoval(studio)
  expect(studio.config.value.colors.map((one) => one.name)).not.toContain('label.red')
})
