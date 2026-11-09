// @vitest-environment jsdom
import { afterEach, expect, test, vi } from 'vitest'
import { h, render } from 'preact'

import initialConfig from '@maggioli-design-system/design-tokens/.magma-design-tokensrc.json'
import {
  DRAFT_STORAGE_KEY,
  hashText,
  reconcileDraft,
  type StudioDraft,
} from '../src/draft.js'
import { App } from '../src/app.js'

// The studio mirrors its working config to localStorage. A restored draft
// used to win over the config on disk even after the file changed or was
// removed; it is now checked against the config it was made on.

type Config = StudioDraft['config']

const PATH = '/project/.magma-design-tokensrc.json'
const disk = initialConfig as unknown as Config
const diskJson = JSON.stringify(disk)
const changed = { ...disk, colors: disk.colors.slice(1) } as Config
const changedJson = JSON.stringify(changed)
const edits = { ...disk, colors: disk.colors.slice(2) } as Config

function draftOf (config: Config, source: StudioDraft['source'], edited?: boolean): StudioDraft {
  return { config, selectedName: config.colors[0].name, view: 'colors', source, edited }
}

test('hashText is stable and tells configs apart', () => {
  expect(hashText(diskJson)).toBe(hashText(JSON.stringify(JSON.parse(diskJson))))
  expect(hashText(diskJson)).not.toBe(hashText(changedJson))
})

test('reconcileDraft keeps a draft made on the same source', () => {
  const source = { path: PATH, hash: hashText(diskJson) }
  expect(reconcileDraft(null, source, diskJson)).toEqual({ use: 'source' })
  expect(reconcileDraft(draftOf(edits, source, true), source, diskJson)).toEqual({ use: 'draft' })
})

test('reconcileDraft asks when the source changed under a draft with edits', () => {
  const was = { path: PATH, hash: hashText(diskJson) }
  const now = { path: PATH, hash: hashText(changedJson) }
  expect(reconcileDraft(draftOf(edits, was, true), now, changedJson)).toEqual({
    use: 'ask',
    reason: `${PATH} changed after this draft was saved`,
  })
  // no edits of its own: the draft was only a copy of the old file
  expect(reconcileDraft(draftOf(disk, was, false), now, changedJson)).toEqual({ use: 'source' })
  // the draft already holds what is on disk now
  expect(reconcileDraft(draftOf(changed, was, true), now, changedJson)).toEqual({ use: 'source' })
})

test('reconcileDraft says why: removed, created, another file, an older draft', () => {
  const was = { path: PATH, hash: hashText(diskJson) }
  const ask = (draft: StudioDraft, source: { path: string | null, hash: string | null }) =>
    reconcileDraft(draft, source, changedJson)

  expect(ask(draftOf(edits, was, true), { path: PATH, hash: null })).toEqual({
    use: 'ask', reason: `${PATH} was removed after this draft was saved`,
  })
  expect(ask(draftOf(edits, { path: PATH, hash: null }, true), was)).toEqual({
    use: 'ask', reason: `${PATH} was created after this draft was saved`,
  })
  expect(ask(draftOf(edits, was, true), { path: '/other/rc.json', hash: was.hash })).toEqual({
    use: 'ask', reason: `this draft was made on ${PATH}, the studio now shows /other/rc.json`,
  })
  expect(ask(draftOf(edits, { path: null, hash: was.hash }, true), was)).toEqual({
    use: 'ask', reason: `this draft was made on the bundled config, the studio now shows ${PATH}`,
  })
  expect(ask(draftOf(edits, undefined), was)).toEqual({
    use: 'ask', reason: `this draft comes from an older studio and may not match ${PATH}`,
  })
})

const root = document.createElement('div')
document.body.append(root)

afterEach(() => {
  render(null, root)
  localStorage.clear()
  vi.unstubAllGlobals()
})

function serve (config: Config | null): void {
  vi.stubGlobal('fetch', async (url: string) => {
    if (url !== '/api/config') return new Response('{}', { status: 404 })
    return new Response(JSON.stringify({ path: PATH, config, readOnly: null }))
  })
}

function storedDraft (): StudioDraft {
  return JSON.parse(localStorage.getItem(DRAFT_STORAGE_KEY) ?? 'null') as StudioDraft
}

// a button of the page, or an mds-button of its head; jsdom does not upgrade an mds-button,
// so its state is the attribute Preact writes, and its text the `label` when it has one
function button (label: string): HTMLElement | undefined {
  return [...root.querySelectorAll<HTMLElement>('button, mds-button')].find(
    (b) => (b.getAttribute('label') ?? b.textContent)?.trim() === label,
  )
}

const isDisabled = (el: HTMLElement | undefined): boolean =>
  Boolean(el?.hasAttribute('disabled') || (el as HTMLButtonElement | undefined)?.disabled)

test('the app asks before a draft with edits wins over a changed file, and can take the file', async () => {
  localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(
    draftOf(edits, { path: PATH, hash: hashText(diskJson) }, true),
  ))
  serve(changed)
  render(h(App, {}), root)

  const banner = await vi.waitFor(() => {
    const el = root.querySelector('.draft-conflict')
    if (!el) throw new Error('no conflict banner yet')
    return el
  })
  expect(banner.textContent).toContain(`${PATH} changed after this draft was saved`)
  // saving now would write the draft over the file that changed
  expect(isDisabled(button('Save *'))).toBe(true)
  // until answered, the stored draft keeps its old stamp: a reload asks again
  expect(storedDraft().source).toEqual({ path: PATH, hash: hashText(diskJson) })

  button('Use the file on disk')!.click()
  await vi.waitFor(() => {
    if (root.querySelector('.draft-conflict')) throw new Error('banner still shown')
  })
  await vi.waitFor(() => {
    const draft = storedDraft()
    expect(draft.config).toEqual(changed)
    expect(draft.source).toEqual({ path: PATH, hash: hashText(changedJson) })
    expect(draft.edited).toBe(false)
  })
  expect(isDisabled(button('Saved'))).toBe(true)
})

test('keeping the draft restamps it on the file now on disk, with its edits unsaved', async () => {
  localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(
    draftOf(edits, { path: PATH, hash: hashText(diskJson) }, true),
  ))
  serve(changed)
  render(h(App, {}), root)

  await vi.waitFor(() => {
    if (!button('Keep the draft')) throw new Error('no conflict banner yet')
  })
  button('Keep the draft')!.click()
  await vi.waitFor(() => {
    const draft = storedDraft()
    expect(draft.config).toEqual(edits)
    expect(draft.source).toEqual({ path: PATH, hash: hashText(changedJson) })
    expect(draft.edited).toBe(true)
  })
  expect(root.querySelector('.draft-conflict')).toBeNull()
  expect(isDisabled(button('Save *'))).toBe(false)
})

test('a draft made on the file still on disk is restored without asking', async () => {
  localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(
    draftOf(edits, { path: PATH, hash: hashText(diskJson) }, true),
  ))
  serve(disk)
  render(h(App, {}), root)

  await vi.waitFor(() => {
    if (!button('Save *')) throw new Error('server mode not adopted yet')
  })
  expect(root.querySelector('.draft-conflict')).toBeNull()
  expect(storedDraft().config).toEqual(edits)
})

test('on the static site the studio asks no API and edits in memory', async () => {
  // the tag site.ts writes into the pages of the site on GitHub Pages
  const meta = Object.assign(document.createElement('meta'), { name: 'magma-studio-api', content: 'none' })
  document.head.append(meta)
  const asked: string[] = []
  vi.stubGlobal('fetch', async (url: string) => {
    asked.push(url)
    return new Response(JSON.stringify({ path: PATH, config: changed, readOnly: null }))
  })
  try {
    let actions: Array<{ id: string }> = []
    render(h(App, { onConfigActions: (handed: Array<{ id: string }>) => (actions = handed) }), root)
    // the start-up check ran on the bundled config, the source of a studio with no API
    await vi.waitFor(() => {
      expect(storedDraft().source).toEqual({ path: null, hash: hashText(diskJson) })
    })
    expect(asked).toEqual([])
    // the configuration leaves by the Config menu of the bar, with nothing to save or build
    expect(actions.map(({ id }) => id)).toContain('copy')
    expect(actions.map(({ id }) => id)).not.toContain('build')
    expect(button('Save')).toBeUndefined()
  } finally {
    meta.remove()
  }
})
