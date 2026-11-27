import { effect } from '@preact/signals'
import { expect, test } from 'vitest'

import { gateReport } from '../engine/gate.js'
import { DRAFT_STORAGE_KEY, hashText, type StudioDraft } from './draft.js'
import { say, updateConfig } from './studio.js'
import { setThemeName } from './theme-choices.js'
import { checkSource } from './work.js'
import { bundledConfig, memoryStorage, quietStudio } from './testing.mjs'

// The state of the studio (#1400): the work as signals, what derives from it as computed values,
// the draft written by an effect once the source is checked.

const stored = (storage: ReturnType<typeof memoryStorage>): StudioDraft =>
  JSON.parse(storage.items.get(DRAFT_STORAGE_KEY) ?? 'null')

test('a state starts on the configuration Magma builds with, its neutral family selected', () => {
  const studio = quietStudio()
  expect(studio.config.value).toEqual(bundledConfig())
  expect(studio.selectedName.value).toBe('tone.neutral')
  expect(studio.workPlace.value).toBeUndefined()
  expect(studio.dirty.value).toBe(false)
  // the gate and the scene are those of the configuration
  expect(studio.verdict.value).toEqual(gateReport(bundledConfig()).verdict)
  expect(studio.scene.value?.themes.map((theme) => theme.name)).toEqual(['business', 'porcelain', 'editorial'])
})

test('a state restores the draft kept in its storage: the configuration, the family, the page', () => {
  const storage = memoryStorage()
  const config = bundledConfig()
  config.colors = config.colors.slice(2)
  const draft: StudioDraft = { config, selectedName: config.colors[1].name, view: 'groups' }
  storage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft))
  const studio = quietStudio(storage)
  expect(studio.config.value).toEqual(config)
  expect(studio.selectedName.value).toBe(config.colors[1].name)
  // a draft saved before #1403 names a page of Colors by its id: its address, which the router
  // takes on to the view that replaced it
  expect(studio.workPlace.value).toBe('#/colors/groups')
  for (const [view, place] of [
    ['colors', '#/colours'],
    ['#/colours', '#/colours'],
    ['#/nowhere', undefined],
    [7, undefined],
  ] as const) {
    const kept = memoryStorage()
    kept.setItem(DRAFT_STORAGE_KEY, JSON.stringify({ ...draft, view }))
    expect(quietStudio(kept).workPlace.value, String(view)).toBe(place)
  }
})

test('the draft is written at every change once the source is checked, stamped with it', async () => {
  const storage = memoryStorage()
  const studio = quietStudio(storage)
  updateConfig(studio, (draft) => {
    draft.smooth = true
  })
  // not before the start-up check: a reload would keep a draft no check has seen
  expect(storage.items.has(DRAFT_STORAGE_KEY)).toBe(false)

  await checkSource(studio)
  const json = JSON.stringify(bundledConfig())
  expect(stored(storage)).toMatchObject({
    config: { smooth: true },
    selectedName: 'tone.neutral',
    view: '#/colours',
    source: { path: null, hash: hashText(json) },
    edited: true,
  })
  studio.workPlace.value = '#/colors/contrast-scales'
  studio.selectedName.value = 'label.red'
  expect(stored(storage)).toMatchObject({ view: '#/colors/contrast-scales', selectedName: 'label.red' })
  // back to the source: no edit of its own
  updateConfig(studio, (draft) => {
    draft.smooth = false
  })
  expect(stored(storage).edited).toBe(false)

  // once disposed, nothing more is written
  studio.dispose()
  studio.selectedName.value = 'tone.neutral'
  expect(stored(storage).selectedName).toBe('label.red')
})

test('an edit that changes nothing leaves the configuration, and what derives from it, alone', () => {
  const studio = quietStudio()
  const solved: unknown[] = []
  const stop = effect(() => {
    solved.push(studio.report.value)
  })
  const before = studio.config.value
  // the echo of a value the page set: the same colour written again
  updateConfig(studio, (draft) => {
    Object.assign(draft.colors[0], { color: draft.colors[0].color })
  })
  expect(studio.config.value).toBe(before)
  expect(solved).toHaveLength(1)
  updateConfig(studio, (draft) => {
    draft.colors[0].color = '#123456'
  })
  expect(studio.config.value).not.toBe(before)
  expect(solved).toHaveLength(2)
  stop()
})

test('the theme choices are part of the work: the gate and the scene read them, the storage keeps them', () => {
  const storage = memoryStorage()
  const studio = quietStudio(storage)
  // nothing written before the person chooses
  expect(storage.items.has('magma-studio:theme-choices')).toBe(false)
  setThemeName(studio, 'porcelain', 'cold-desk')
  expect(studio.scene.value?.themes.map((theme) => theme.name)).toContain('cold-desk')
  expect(studio.report.value.themes.map((theme) => theme.name)).toContain('cold-desk')
  // the next studio reads them back
  expect(quietStudio(storage).themeChoices.value.names).toEqual({ porcelain: 'cold-desk' })
})

test('a text of the state is said in the language of the page, a text inside it too', () => {
  const it = (text: string, vars?: Record<string, string | number>) =>
    `[${text}]${vars ? JSON.stringify(vars) : ''}`
  expect(say(it, { text: 'saved' })).toBe('[saved]')
  expect(say(it, { text: 'a server said this', plain: true })).toBe('a server said this')
  expect(
    say(it, { text: 'Could not load {file}: {error}', vars: { file: 'a.json', error: { text: 'it does not match the schema' } } }),
  ).toBe('[Could not load {file}: {error}]{"file":"a.json","error":"[it does not match the schema]"}')
})
