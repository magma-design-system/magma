import { expect, test } from 'vitest'

import { cancelExport, confirmExport, exportConfig, exportSelection, guard } from './exports.js'
import { updateConfig } from './studio.js'
import { quietStudio } from './testing.mjs'

// What hands the configuration out (#1400): each export through the contrast gate (#698), the
// files it hands over, what keeps one from being built.

/** Text pinned to the least contrasting step of each ramp: the text roles fail the gate. */
const failGate = (studio: ReturnType<typeof quietStudio>) =>
  updateConfig(studio, (draft) => {
    draft.theme!.text = { default: { step: 10 }, muted: { step: 10 }, subtle: { step: 10 }, disabled: { step: 10 } }
  })

test('while the gate passes an export runs; while it fails it waits for the person to answer', () => {
  const studio = quietStudio()
  const ran: string[] = []
  const action = { label: 'Download config', proceed: 'Download anyway', run: () => void ran.push('ran') }
  guard(studio, action)
  expect(ran).toEqual(['ran'])
  expect(studio.pendingExport.value).toBeNull()

  failGate(studio)
  expect(studio.verdict.value.state).toBe('fail')
  guard(studio, action)
  expect(ran).toEqual(['ran'])
  expect(studio.pendingExport.value).toBe(action)
  // Cancel never exports
  cancelExport(studio)
  expect(studio.pendingExport.value).toBeNull()
  expect(ran).toEqual(['ran'])
  // the verb of the dialog exports anyway
  guard(studio, action)
  confirmExport(studio)
  expect(studio.pendingExport.value).toBeNull()
  expect(ran).toEqual(['ran', 'ran'])
})

test('each export hands over the file it says', () => {
  const studio = quietStudio()
  for (const kind of ['zip', 'config', 'figma', 'css', 'gimp'] as const) exportConfig(studio, kind)
  exportSelection(studio, ['tone.neutral'])
  expect(studio.files.map(({ name, type }) => [name, type])).toEqual([
    ['magma-design-tokens.zip', 'application/zip'],
    ['magma-design-tokensrc.json', 'application/json'],
    ['magma-figma-dtcg.zip', 'application/zip'],
    ['magma-css.zip', 'application/zip'],
    ['magma-gimp.zip', 'application/zip'],
    ['magma-selection.zip', 'application/zip'],
  ])
  expect(JSON.parse(studio.files[1].data as string)).toEqual(studio.config.value)
})

test('the tokens of a configuration the generator refuses are not handed over: the notice says why', () => {
  const studio = quietStudio()
  updateConfig(studio, (draft) => {
    draft.colors.push({ name: 'label.lost', alias: 'label.nowhere' } as never)
  })
  exportConfig(studio, 'css')
  expect(studio.files).toEqual([])
  expect(studio.notice.value).toMatchObject({ text: 'Could not build the CSS: {error}' })
  // the configuration itself always leaves
  exportConfig(studio, 'config')
  expect(studio.files.map(({ name }) => name)).toEqual(['magma-design-tokensrc.json'])
  exportSelection(studio, ['label.lost'])
  expect(studio.notice.value).toMatchObject({ text: 'Could not export the selection: {error}' })
})
