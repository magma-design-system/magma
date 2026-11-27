import { expect, test } from 'vitest'

import { adoptConfig, updateConfig } from './studio.js'
import { LOOKS_KEY, markLooked, readLooks, unmarkLooked } from './review.js'
import { bundledConfig, memoryStorage, quietStudio } from './testing.mjs'

// The looks of the full review (#1404): which theme the person looked at in which mode, kept beside
// the draft, so a reload keeps them; a preset opened starts with none.

test('a look is kept as the print of the item, beside the draft, and taken back by the person', () => {
  const storage = memoryStorage()
  const studio = quietStudio(storage)
  markLooked(studio, 'bisque', 'dark')
  expect(Object.keys(studio.looks.value)).toEqual(['bisque|dark'])
  expect(readLooks(storage)).toEqual(studio.looks.value)
  // the studio of the next visit reads them back
  expect(quietStudio(storage).looks.value).toEqual(studio.looks.value)
  unmarkLooked(studio, 'bisque', 'dark')
  expect(studio.looks.value).toEqual({})
  expect(JSON.parse(storage.items.get(LOOKS_KEY)!)).toEqual({})
})

test('an edit keeps the looks, which say for themselves what it touched; a preset opened has none', () => {
  const studio = quietStudio()
  markLooked(studio, 'bisque', 'dark')
  updateConfig(studio, (draft) => {
    draft.smooth = true
  })
  expect(Object.keys(studio.looks.value)).toEqual(['bisque|dark'])
  adoptConfig(studio, bundledConfig())
  expect(studio.looks.value).toEqual({})
})

test('looks the storage cannot give are none', () => {
  const storage = memoryStorage()
  storage.setItem(LOOKS_KEY, '[1, 2]')
  expect(readLooks(storage)).toEqual({})
  storage.setItem(LOOKS_KEY, '{not json')
  expect(readLooks(storage)).toEqual({})
  expect(readLooks(null)).toEqual({})
})
