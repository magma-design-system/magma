import { expect, test } from 'vitest'

import { NO_THEME_CHOICES } from '../engine/theme-choices.js'
import {
  readThemeChoices,
  resetThemeChoices,
  setThemeAccent,
  setThemeModes,
  setThemeName,
  THEME_CHOICES_KEY,
} from './theme-choices.js'
import { memoryStorage, quietStudio } from './testing.mjs'

// The theme choices of the work (#1400): set one family at a time, kept beside the draft.

test('the choices of a family: a name, an accent, the modes, each beside the others', () => {
  const storage = memoryStorage()
  const studio = quietStudio(storage)
  setThemeName(studio, 'bisque', 'editorial-warm')
  setThemeAccent(studio, 'bisque', 'accent', 'variant.secondary')
  setThemeAccent(studio, 'bisque', 'ai', 'variant.tertiary')
  setThemeModes(studio, 'bisque', ['dark'])
  setThemeModes(studio, 'neutral', ['light'])
  const choices = {
    names: { bisque: 'editorial-warm' },
    accents: { bisque: { accent: 'variant.secondary', ai: 'variant.tertiary' } },
    modes: { bisque: ['dark'], neutral: ['light'] },
  }
  expect(studio.themeChoices.value).toEqual(choices)
  expect(JSON.parse(storage.items.get(THEME_CHOICES_KEY)!)).toEqual(choices)
  expect(readThemeChoices(storage)).toEqual(choices)

  resetThemeChoices(studio)
  expect(studio.themeChoices.value).toEqual(NO_THEME_CHOICES)
  expect(readThemeChoices(storage)).toEqual(NO_THEME_CHOICES)
})

test('what the storage keeps that is no choice reads as none', () => {
  const storage = memoryStorage()
  storage.setItem(THEME_CHOICES_KEY, 'not json')
  expect(readThemeChoices(storage)).toEqual(NO_THEME_CHOICES)
  storage.setItem(THEME_CHOICES_KEY, '{"names":{"bisque":"warm"}}')
  expect(readThemeChoices(storage)).toEqual({ ...NO_THEME_CHOICES, names: { bisque: 'warm' } })
  expect(readThemeChoices(null)).toEqual(NO_THEME_CHOICES)
})
