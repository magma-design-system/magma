import { afterEach, expect, test, vi } from 'vitest'

import { DRAFT_STORAGE_KEY, hashText, type StudioDraft } from './draft.js'
import { createStudio, updateConfig, type CloneableConfig } from './studio.js'
import {
  buildTokens,
  checkSource,
  importConfig,
  resetWork,
  resolveConflict,
  saveConfig,
} from './work.js'
import { exitOf } from './exports.js'
import { bundledConfig, memoryStorage, quietStudio } from './testing.mjs'

// Where the work comes from and where it goes (#1400): the start-up check of the draft against
// its source, an import, the Reset, the answer to a conflict, the save and the build on disk.

const PATH = '/project/.magma-design-tokensrc.json'
const disk = bundledConfig()
const changed = { ...disk, colors: disk.colors.slice(1) } as CloneableConfig

afterEach(() => vi.unstubAllGlobals())

/** A command that serves `config` and answers `put` to a save. */
function serve (config: CloneableConfig | null, put: () => Response = () => Response.json({ path: PATH })) {
  const asked: Array<{ method: string; url: string; body?: string }> = []
  vi.stubGlobal('fetch', async (url: string, init?: RequestInit) => {
    asked.push({ method: init?.method ?? 'GET', url, body: init?.body as string | undefined })
    if (url === '/api/config' && !init) return Response.json({ path: PATH, config, readOnly: null })
    if (url === '/api/config') return put()
    return new Response('{}', { status: 404 })
  })
  return asked
}

/** A state served by a command, on a draft kept in its storage. */
function servedOn (draft?: StudioDraft) {
  const storage = memoryStorage()
  if (draft) storage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft))
  return createStudio({ storage, api: true, download: () => undefined })
}

test('served by a command, the studio adopts the file on disk and saves to it', async () => {
  serve(changed)
  const studio = servedOn()
  await checkSource(studio)
  expect(studio.config.value).toEqual(changed)
  expect(studio.served.value).toEqual({ path: PATH, readOnly: null })
  expect(studio.origin.value).toMatchObject({ path: PATH, hash: hashText(JSON.stringify(changed)) })
  expect(studio.dirty.value).toBe(false)
  updateConfig(studio, (draft) => {
    draft.smooth = true
  })
  expect(studio.dirty.value).toBe(true)
})

test('a draft with edits over a changed file asks; the answer takes the file or keeps the draft', async () => {
  const edits = { ...disk, colors: disk.colors.slice(2) } as CloneableConfig
  const draft: StudioDraft = {
    config: edits,
    selectedName: edits.colors[0].name,
    view: 'colors',
    source: { path: PATH, hash: hashText(JSON.stringify(disk)) },
    edited: true,
  }
  serve(changed)
  const taking = servedOn(draft)
  await checkSource(taking)
  expect(taking.conflict.value).toMatchObject({
    reason: { text: '{source} changed after this draft was saved', source: PATH },
    label: 'Use the file on disk',
  })
  expect(taking.config.value).toEqual(edits)
  resolveConflict(taking, true)
  expect(taking.conflict.value).toBeNull()
  expect(taking.config.value).toEqual(changed)

  const keeping = servedOn(draft)
  await checkSource(keeping)
  resolveConflict(keeping, false)
  expect(keeping.conflict.value).toBeNull()
  expect(keeping.config.value).toEqual(edits)
})

test('a configuration imported is loaded on its first family; one refused says why', async () => {
  const studio = quietStudio()
  const product = { ...disk, ratios: { wcag3: { default: [5, 15, 25, 35, 45, 55, 65, 75, 85, 95] } } }
  const file = (text: string) => ({ name: 'product.json', text: async () => text })
  studio.selectedName.value = 'label.red'
  expect(await importConfig(studio, file(JSON.stringify(product)))).toBe(true)
  expect(studio.config.value).toEqual(product)
  // what the Reset of a scale takes it back to
  expect(studio.loadedRatios.value).toEqual(product.ratios)
  expect(studio.selectedName.value).toBe('tone.neutral')

  expect(await importConfig(studio, file('{ "colors": [] }'))).toBe(false)
  expect(studio.notice.value).toMatchObject({ text: 'Could not load {file}: {error}', vars: { file: 'product.json' } })
  expect(studio.config.value).toEqual(product)
  expect(await importConfig(studio, file('not json'))).toBe(false)
  expect(studio.notice.value?.vars?.error).toMatchObject({ plain: true })
})

test('the Reset takes back the configuration Magma builds with and forgets the draft', async () => {
  const storage = memoryStorage()
  const studio = quietStudio(storage)
  await checkSource(studio)
  updateConfig(studio, (draft) => {
    draft.colors = draft.colors.slice(3)
  })
  studio.notice.value = { text: 'something' }
  resetWork(studio)
  expect(studio.config.value).toEqual(disk)
  expect(studio.notice.value).toBeNull()
  expect(studio.canReset.value).toBe(false)
  // the draft written again is the one of the configuration of Magma, no edit of its own
  expect(JSON.parse(storage.items.get(DRAFT_STORAGE_KEY)!).edited).toBe(false)
})

test('a save writes the configuration to the file and makes it the source; a refusal says why', async () => {
  vi.useFakeTimers()
  try {
    const asked = serve(disk)
    const studio = servedOn()
    await checkSource(studio)
    updateConfig(studio, (draft) => {
      draft.smooth = true
    })
    await saveConfig(studio)
    const put = asked.find(({ method }) => method === 'PUT')!
    expect(JSON.parse(put.body!)).toMatchObject({ smooth: true })
    expect(studio.dirty.value).toBe(false)
    expect(studio.origin.value?.hash).toBe(hashText(studio.json.value))
    expect(studio.status.value).toEqual({ text: 'saved' })
    vi.advanceTimersByTime(1500)
    expect(studio.status.value).toBeNull()

    serve(disk, () => Response.json({ error: 'the file is locked' }, { status: 409 }))
    updateConfig(studio, (draft) => {
      draft.smooth = false
    })
    await saveConfig(studio)
    expect(studio.status.value).toEqual({ text: 'the file is locked', plain: true })
    expect(studio.dirty.value).toBe(true)
    expect(studio.saving.value).toBe(false)
  } finally {
    vi.useRealTimers()
  }
})

test('nothing is saved on its own, or while a conflict waits for an answer', async () => {
  const asked = serve(null)
  const alone = quietStudio()
  await checkSource(alone)
  await saveConfig(alone)
  expect(asked).toEqual([])

  const studio = servedOn()
  await checkSource(studio)
  studio.conflict.value = { reason: { text: 'x', source: PATH }, config: disk, label: 'Use the file on disk' }
  await saveConfig(studio)
  expect(asked.filter(({ method }) => method === 'PUT')).toEqual([])
})

test('the build on disk says how it went', async () => {
  vi.stubGlobal('fetch', async () => Response.json({}))
  const studio = quietStudio()
  await buildTokens(studio)
  expect(studio.status.value).toEqual({ text: 'tokens generated on disk' })
  vi.stubGlobal('fetch', async () => Response.json({}, { status: 500 }))
  await buildTokens(studio)
  expect(studio.status.value).toEqual({ text: 'build failed ({status})', vars: { status: 500 } })
})

// The changes of the bar (#1402): counted from the preset at the last exit, which opening a preset
// starts and the exit brings to the preset now (the person chose the last exit, 2026-11-27)
test('the changes are counted from the preset opened, and kept in the draft over a reload', async () => {
  const storage = memoryStorage()
  const studio = quietStudio(storage)
  await checkSource(studio)
  expect(studio.changes.value).toEqual([])
  updateConfig(studio, (draft) => {
    draft.smooth = true
  })
  studio.themeChoices.value = { ...studio.themeChoices.value, names: { 'tone.bisque': 'warm' } }
  expect(studio.changes.value.map(({ stage }) => stage)).toEqual(['colours', 'themes'])
  // a reload: the draft keeps the preset the changes are counted from
  const again = quietStudio(storage)
  await checkSource(again)
  expect(again.changes.value.map(({ stage }) => stage)).toEqual(['colours', 'themes'])
})

test('opening a preset starts the count from it: an import, the Reset, the source taken over a draft', async () => {
  const studio = quietStudio()
  await checkSource(studio)
  updateConfig(studio, (draft) => {
    draft.smooth = true
  })
  expect(studio.changes.value).toHaveLength(1)
  const product = { ...disk, colors: disk.colors.slice(2) }
  await importConfig(studio, { name: 'product.json', text: async () => JSON.stringify(product) })
  expect(studio.changes.value).toEqual([])
  updateConfig(studio, (draft) => {
    draft.smooth = true
  })
  resetWork(studio)
  expect(studio.changes.value).toEqual([])

  // a draft with edits over a changed file: taking the file counts from the file
  serve(changed)
  const draft: StudioDraft = {
    config: { ...disk, smooth: true } as CloneableConfig,
    selectedName: 'tone.neutral',
    view: 'colors',
    source: { path: PATH, hash: hashText(JSON.stringify(disk)) },
    edited: true,
  }
  const taking = servedOn(draft)
  await checkSource(taking)
  expect(taking.conflict.value).not.toBeNull()
  resolveConflict(taking, true)
  expect(taking.changes.value).toEqual([])
})

test('a draft written before it kept the last exit counts its changes from its source', async () => {
  const storage = memoryStorage()
  const draft: StudioDraft = {
    config: { ...disk, smooth: true } as CloneableConfig,
    selectedName: 'tone.neutral',
    view: 'colors',
    source: { path: null, hash: hashText(JSON.stringify(disk)) },
    edited: true,
  }
  storage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft))
  const studio = quietStudio(storage)
  await checkSource(studio)
  expect(studio.config.value.smooth).toBe(true)
  expect(studio.changes.value.map(({ field }) => field?.text)).toEqual(['Smooth'])
})

test('the exit brings the changes to none: a download, or a save the command took', async () => {
  const studio = quietStudio()
  await checkSource(studio)
  updateConfig(studio, (draft) => {
    draft.smooth = true
  })
  await exitOf(studio).run()
  expect(studio.changes.value).toEqual([])

  serve(disk)
  const served = servedOn()
  await checkSource(served)
  updateConfig(served, (draft) => {
    draft.smooth = true
  })
  expect(exitOf(served).label).toBe('Save the preset')
  await exitOf(served).run()
  expect(served.changes.value).toEqual([])
  // a save the command refused leaves the count as it was
  serve(disk, () => Response.json({ error: 'disk full' }, { status: 500 }))
  updateConfig(served, (draft) => {
    draft.smooth = false
  })
  await saveConfig(served)
  expect(served.changes.value).toHaveLength(1)
})
