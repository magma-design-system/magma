import { expect, test } from 'vitest'

import { setThemeAccent, setThemeName } from './theme-choices.js'
import { deleteTheme, moveTheme } from './themes.js'
import { undoLast } from './undo.js'
import { familyOf, quietStudio } from './testing.mjs'

// The actions of the stage Themes that change the preset with the theme choices (#1404): a theme
// moved to another tint, a theme deleted; both with no confirmation, undone from a toast, the
// choices with the preset.

test('a theme of the product moves to another tint: the surfaces follow, its name and choices go with it', () => {
  const studio = quietStudio()
  setThemeName(studio, 'porcelain', 'cold-desk')
  setThemeAccent(studio, 'porcelain', 'accent', 'variant-secondary')
  const before = studio.config.value
  moveTheme(studio, 'porcelain', 'tone.kaolin')
  // the family it left stops generating surfaces, the new one starts
  expect(familyOf(studio, 'tone.porcelain')?.surface).toBeFalsy()
  expect(familyOf(studio, 'tone.kaolin')?.surface).toBe(true)
  expect(studio.scene.value?.themes.map((theme) => `${theme.name}:${theme.family}`)).toContain('cold-desk:kaolin')
  expect(studio.themeChoices.value).toEqual({
    names: { kaolin: 'cold-desk' },
    accents: { kaolin: { accent: 'variant-secondary' } },
    modes: {},
  })
  // the toast says it, and Undo brings back the preset and the choices
  expect(studio.lastUndo.value?.said).toEqual({
    text: 'The theme {theme} takes its tint from {family}.',
    vars: { theme: 'cold-desk', family: 'tone.kaolin' },
  })
  undoLast(studio)
  expect(studio.config.value).toEqual(before)
  expect(studio.themeChoices.value.names).toEqual({ porcelain: 'cold-desk' })
  expect(studio.lastUndo.value).toBeNull()
})

test('a theme with no name of its own keeps the name it had on the new tint', () => {
  const studio = quietStudio()
  moveTheme(studio, 'porcelain', 'label.blue')
  expect(studio.scene.value?.themes.map((theme) => `${theme.name}:${theme.family}`)).toContain('porcelain:blue')
  // the same tint again is no move
  const after = studio.config.value
  moveTheme(studio, 'blue', 'label.blue')
  expect(studio.config.value).toBe(after)
})

test('a theme deleted: its family stops generating surfaces and stays in the palette; undone from the toast', () => {
  const studio = quietStudio()
  const before = studio.config.value
  deleteTheme(studio, 'bisque')
  expect(familyOf(studio, 'tone.bisque')).toBeDefined()
  expect(familyOf(studio, 'tone.bisque')?.surface).toBeFalsy()
  expect(studio.scene.value?.themes.map((theme) => theme.name)).not.toContain('editorial')
  expect(studio.lastUndo.value?.said).toEqual({ text: 'The theme {theme} deleted.', vars: { theme: 'editorial' } })
  undoLast(studio)
  expect(studio.config.value).toEqual(before)
  expect(studio.scene.value?.themes.map((theme) => theme.name)).toContain('editorial')
})

test('the base theme is :root: it is never deleted', () => {
  const studio = quietStudio()
  const before = studio.config.value
  deleteTheme(studio, 'neutral')
  expect(studio.config.value).toBe(before)
  expect(studio.lastUndo.value).toBeNull()
})
