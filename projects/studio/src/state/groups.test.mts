import { expect, test } from 'vitest'

import { setExports, updateGroup } from './groups.js'
import { familyOf, quietStudio } from './testing.mjs'

// The actions of Groups (#1400): the settings of a group, the export groups of several families.

test('a group keeps only the settings set, and goes when it has none', () => {
  const studio = quietStudio()
  updateGroup(studio, 'label', { ratios: 'tint', formula: undefined, export: ['brand'] })
  expect(studio.config.value.groups?.label).toEqual({ ratios: 'tint', export: ['brand'] })
  updateGroup(studio, 'label', {})
  expect(studio.config.value.groups).not.toHaveProperty('label')
})

test('the families named take an export list, or go back to the one of their group', () => {
  const studio = quietStudio()
  const kaolin = familyOf(studio, 'tone.kaolin')
  setExports(studio, ['label.red', 'tone.neutral'], ['brand'])
  expect(familyOf(studio, 'label.red')?.export).toEqual(['brand'])
  expect(familyOf(studio, 'tone.neutral')?.export).toEqual(['brand'])
  // a family not named keeps its own
  expect(familyOf(studio, 'tone.kaolin')).toEqual(kaolin)
  setExports(studio, ['label.red'], undefined)
  expect(familyOf(studio, 'label.red')).not.toHaveProperty('export')
})

test('a setting of a group keeps the others it has, the surfaces of the status colours', () => {
  const studio = quietStudio()
  const status = studio.config.value.groups?.status
  expect(status).toEqual({ surface: true, emphasis: true })
  updateGroup(studio, 'status', { ...status, formula: 'wcag2' })
  expect(studio.config.value.groups?.status).toEqual({ surface: true, emphasis: true, formula: 'wcag2' })
  updateGroup(studio, 'status', { ...studio.config.value.groups?.status, formula: undefined })
  expect(studio.config.value.groups?.status).toEqual({ surface: true, emphasis: true })
})
