import { expect, test } from 'vitest'

import { addScale, builtinScalesOf, changeScale, deleteScale, renameScale, restoreBuiltinSteps, scalesOf } from './scales.js'
import { undoLast } from './undo.js'
import { updateConfig } from './studio.js'
import { familyOf, quietStudio } from './testing.mjs'

// The actions of Contrast scales (#1400): the scales of a formula, as the generator merges them.

const scales = (studio: ReturnType<typeof quietStudio>) => scalesOf(studio.config.value.ratios, 'wcag3')

test('a scale changed is written over the built-in ones, which the configuration then names', () => {
  const studio = quietStudio()
  expect(studio.config.value.ratios).toBeUndefined()
  changeScale(studio, 'wcag3', 'tint', [10, 20, 30])
  expect(scales(studio).tint).toEqual([10, 20, 30])
  expect(Object.keys(studio.config.value.ratios!.wcag3!)).toEqual(Object.keys(builtinScalesOf('wcag3')))
})

test('a scale renamed takes the families and the groups that use it along', () => {
  const studio = quietStudio()
  const custom = addScale(studio, 'wcag3', 'tint')
  updateConfig(studio, (draft) => {
    draft.colors.find((one) => one.name === 'label.red')!.ratios = custom
  })
  expect(renameScale(studio, 'wcag3', custom, 'soft')).toBe(true)
  expect(scales(studio).soft).toEqual(builtinScalesOf('wcag3').tint)
  expect(scales(studio)).not.toHaveProperty(custom)
  expect(familyOf(studio, 'label.red')?.ratios).toBe('soft')

  // the group tone uses the scale tone; a built-in one renamed is merged back by the generator
  // under its own name (as before #1400)
  renameScale(studio, 'wcag3', 'tone', 'neutrals')
  expect(studio.config.value.groups?.tone?.ratios).toBe('neutrals')
  expect(scales(studio)).toHaveProperty('tone')

  // no name, the same name, a name another scale has: nothing changes
  const before = studio.config.value
  for (const next of ['', 'soft', 'default']) expect(renameScale(studio, 'wcag3', 'soft', next)).toBe(false)
  expect(studio.config.value).toBe(before)
})

test('a scale added is custom-<n>, a copy of the one it comes from', () => {
  const studio = quietStudio()
  expect(addScale(studio, 'wcag3', 'tint')).toBe('custom-1')
  expect(addScale(studio, 'wcag3', 'missing')).toBe('custom-2')
  expect(scales(studio)['custom-1']).toEqual(builtinScalesOf('wcag3').tint)
  // a scale that is not there: a copy of default
  expect(scales(studio)['custom-2']).toEqual(builtinScalesOf('wcag3').default)
})

test('a scale deleted: a built-in one stays deleted with null, its families fall back to the default', () => {
  const studio = quietStudio()
  updateConfig(studio, (draft) => {
    draft.colors.find((one) => one.name === 'label.red')!.ratios = 'tint'
  })
  deleteScale(studio, 'wcag3', 'tint')
  expect(studio.config.value.ratios?.wcag3?.tint).toBeNull()
  expect(scales(studio)).not.toHaveProperty('tint')
  expect(familyOf(studio, 'label.red')).not.toHaveProperty('ratios')
  expect(studio.config.value.groups?.tone?.ratios).toBe('tone')

  const custom = addScale(studio, 'wcag3', 'default')
  deleteScale(studio, 'wcag3', custom)
  expect(studio.config.value.ratios?.wcag3).not.toHaveProperty(custom)

  // a family on another formula keeps a scale of the same name
  updateConfig(studio, (draft) => {
    Object.assign(draft.colors.find((one) => one.name === 'label.red')!, { formula: 'wcag2', ratios: 'tone' })
  })
  deleteScale(studio, 'wcag3', 'tone')
  expect(familyOf(studio, 'label.red')?.ratios).toBe('tone')
  expect(studio.config.value.groups?.tone).not.toHaveProperty('ratios')
})

// #1403: what takes work away asks nothing and is undone from a toast (state/undo.ts)
test('a scale deleted comes back from Undo, the families that used it with it', () => {
  const studio = quietStudio()
  updateConfig(studio, (draft) => {
    draft.colors.find((one) => one.name === 'label.red')!.ratios = 'tint'
  })
  deleteScale(studio, 'wcag3', 'tint')
  expect(scalesOf(studio.config.value.ratios, 'wcag3').tint).toBeUndefined()
  expect(familyOf(studio, 'label.red')?.ratios).toBeUndefined()
  expect(studio.lastUndo.value?.said).toEqual({ text: 'The scale {name} deleted.', vars: { name: 'tint' } })
  undoLast(studio)
  expect(scalesOf(studio.config.value.ratios, 'wcag3').tint).toEqual(builtinScalesOf('wcag3').tint)
  expect(familyOf(studio, 'label.red')?.ratios).toBe('tint')
})

test('a built-in scale goes back to its built-in steps, their number with them, and Undo returns', () => {
  const studio = quietStudio()
  const twelve = [4, 9, 15, 22, 30, 39, 49, 60, 72, 84, 96, 106]
  changeScale(studio, 'wcag3', 'default', twelve)
  restoreBuiltinSteps(studio, 'wcag3', 'default')
  expect(scalesOf(studio.config.value.ratios, 'wcag3').default).toEqual(builtinScalesOf('wcag3').default)
  expect(studio.lastUndo.value?.said.vars).toEqual({ name: 'default', count: 10 })
  undoLast(studio)
  expect(scalesOf(studio.config.value.ratios, 'wcag3').default).toEqual(twelve)
  // a scale that is not built-in has no built-in steps to go back to
  const custom = addScale(studio, 'wcag3', 'default')
  const before = studio.json.value
  restoreBuiltinSteps(studio, 'wcag3', custom)
  expect(studio.json.value).toBe(before)
})
