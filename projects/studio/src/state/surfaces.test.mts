import { expect, test } from 'vitest'

import { DEFAULT_THEME, toggleGroupSurface, toggleSurface, updateBalances } from './surfaces.js'
import { updateConfig } from './studio.js'
import { bundledConfig, familyOf, quietStudio } from './testing.mjs'

// The actions of Semantic surface (#1400): which families generate surfaces, and the balances.

test('a family opts into the surfaces and out; out of a group that opts in, it says false', () => {
  const studio = quietStudio()
  toggleSurface(studio, 'label.red', true)
  expect(familyOf(studio, 'label.red')?.surface).toBe(true)
  // the group label is silent: out is no key at all
  toggleSurface(studio, 'label.red', false)
  expect(familyOf(studio, 'label.red')).not.toHaveProperty('surface')
  // the group status opts in: out has to say so, or the family inherits it back
  toggleSurface(studio, 'status.info', false)
  expect(familyOf(studio, 'status.info')?.surface).toBe(false)
})

test('a group opts in and back out, leaving the configuration as it was', () => {
  const studio = quietStudio()
  const before = studio.json.value
  toggleGroupSurface(studio, 'label', true)
  expect(studio.config.value.groups?.label).toEqual({ surface: true })
  toggleGroupSurface(studio, 'label', false)
  expect(studio.json.value).toBe(before)

  // once a group is out, the false of its families has nothing to escape and goes
  toggleSurface(studio, 'status.info', false)
  toggleGroupSurface(studio, 'status', false)
  expect(familyOf(studio, 'status.info')).not.toHaveProperty('surface')
  expect(studio.config.value.groups?.status).toEqual({ emphasis: true })
})

test('the balances change the theme block, from those of Magma when the configuration has none', () => {
  const studio = quietStudio()
  updateConfig(studio, (draft) => {
    delete draft.theme
  })
  updateBalances(studio, (theme) => {
    theme.text = { ...theme.text, muted: { step: 7 } }
  })
  expect(studio.config.value.theme).toEqual({ ...DEFAULT_THEME, text: { ...DEFAULT_THEME.text, muted: { step: 7 } } })
  expect(DEFAULT_THEME).toEqual(bundledConfig().theme)
})
