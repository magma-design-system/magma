import { expect, test } from 'vitest'

import { READY_THEMES } from '../engine/opening.js'
import { NO_THEME_CHOICES } from '../engine/theme-choices.js'
import { forgetOpening, openBrandColour, openImported, openMagma, openReadyTheme, undoOpening } from './opening.js'
import { bundled, updateConfig } from './studio.js'
import { checkSource } from './work.js'
import { bundledConfig, memoryStorage, quietStudio } from './testing.mjs'

// The actions of the opening (#1402): a preset opened takes the place of the work and the changes
// count from it; a ready theme or a brand colour add a theme of the product, a change of it; work
// with changes is kept for the toast that undoes the opening (act-then-undo).

const editorial = READY_THEMES.find(({ name }) => name === 'editorial')!
/** A state whose work has one change: smooth on. */
const changed = async () => {
  const studio = quietStudio()
  await checkSource(studio)
  updateConfig(studio, (draft) => {
    draft.smooth = true
  })
  studio.themeChoices.value = { ...NO_THEME_CHOICES, names: { bisque: 'warm-paper' } }
  return studio
}

test("Magma's preset opens with no change, no choice of the themes, on its first family", async () => {
  const studio = await changed()
  studio.selectedName.value = 'label.red'
  openMagma(studio)
  expect(studio.config.value).toEqual(bundled())
  expect(studio.themeChoices.value).toEqual(NO_THEME_CHOICES)
  expect(studio.changes.value).toEqual([])
  expect(studio.selectedName.value).toBe('tone.neutral')
})

test('a ready theme opens Magma\'s preset with a theme of the product, its family selected, counted as changes', async () => {
  const studio = await changed()
  openReadyTheme(studio, editorial)
  expect(studio.selectedName.value).toBe('tone.myeditorial')
  expect(studio.themeChoices.value.names).toEqual({ myeditorial: 'my-editorial' })
  // the family added in Colours, and its theme in Themes
  expect(studio.changes.value.map(({ stage, kind }) => `${stage} ${kind}`)).toEqual([
    'colours added',
    'themes changed',
    'themes changed',
    'themes changed',
  ])
})

test('a brand colour opens Magma\'s preset with its family, its variant and a theme of the product', async () => {
  const studio = quietStudio()
  await checkSource(studio)
  openBrandColour(studio, '#0a7c86')
  const brand = studio.selectedName.value
  expect(brand).toMatch(/^brand\./)
  expect(studio.config.value.colors.find(({ name }) => name === brand)?.color).toBe('#0a7c86')
  expect(studio.themeChoices.value.names).toEqual({ mybrand: 'my-brand' })
  // nothing was lost: no toast
  expect(studio.lastOpening.value).toBeNull()
})

test('opening over work with changes keeps it for the toast; Undo brings it back as it stood', async () => {
  const studio = await changed()
  studio.selectedName.value = 'label.red'
  studio.workPlace.value = '#/colors/semantic-surface'
  const before = {
    config: studio.config.value,
    choices: studio.themeChoices.value,
    changes: studio.changes.value,
  }
  openReadyTheme(studio, editorial)
  expect(studio.lastOpening.value?.said).toEqual({
    text: 'You opened a theme of yours from {theme}.',
    vars: { theme: 'editorial' },
  })
  undoOpening(studio)
  expect(studio.config.value).toEqual(before.config)
  expect(studio.themeChoices.value).toEqual(before.choices)
  expect(studio.changes.value).toEqual(before.changes)
  expect([studio.selectedName.value, studio.workPlace.value]).toEqual(['label.red', '#/colors/semantic-surface'])
  expect(studio.lastOpening.value).toBeNull()
  // closing the toast forgets the work it kept
  openMagma(studio)
  expect(studio.lastOpening.value).not.toBeNull()
  forgetOpening(studio)
  expect(studio.lastOpening.value).toBeNull()
  undoOpening(studio)
  expect(studio.config.value).toEqual(bundled())
})

test('the preset of a project opens from its file; one the schema refuses changes nothing', async () => {
  const studio = await changed()
  const product = { ...bundledConfig(), smooth: true, colors: bundledConfig().colors.slice(1) }
  const file = (text: string) => ({ name: 'product.json', text: async () => text })
  expect(await openImported(studio, file(JSON.stringify(product)))).toBe(true)
  expect(studio.config.value).toEqual(product)
  expect(studio.themeChoices.value).toEqual(NO_THEME_CHOICES)
  expect(studio.changes.value).toEqual([])
  expect(studio.lastOpening.value?.said).toEqual({ text: 'You opened {file}.', vars: { file: 'product.json' } })
  // refused: the work and its choices stay, the notice says why
  studio.themeChoices.value = { ...NO_THEME_CHOICES, names: { bisque: 'warm-paper' } }
  expect(await openImported(studio, file('{ "colors": [] }'))).toBe(false)
  expect(studio.config.value).toEqual(product)
  expect(studio.themeChoices.value.names).toEqual({ bisque: 'warm-paper' })
  expect(studio.notice.value?.text).toBe('Could not load {file}: {error}')
})

test('the opening is kept in the draft: a reload keeps the preset and counts its changes from it', async () => {
  const storage = memoryStorage()
  const studio = quietStudio(storage)
  await checkSource(studio)
  openReadyTheme(studio, editorial)
  const again = quietStudio(storage)
  await checkSource(again)
  expect(again.config.value).toEqual(studio.config.value)
  expect(again.changes.value.length).toBe(studio.changes.value.length)
})
