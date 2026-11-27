import { expect, test } from 'vitest'

import { cancelExport, confirmExport, exitOf, exportConfig, exportSelection, guard } from './exports.js'
import { updateConfig } from './studio.js'
import { presetInOrder } from '../engine/colour-order.js'
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
  expect(JSON.parse(studio.files[1].data as string)).toEqual(presetInOrder(studio.config.value))
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

// The exit of the preset (#1402): the way forward of the last stage, and the action of the bar
test('the exit downloads the preset on its own, saves it where a command takes saves', () => {
  const studio = quietStudio()
  const download = exitOf(studio)
  expect([download.label, download.proceed]).toEqual(['Download the preset', 'Download anyway'])
  void download.run()
  expect(studio.files.map(({ name }) => name)).toEqual(['magma-design-tokensrc.json'])
  expect(JSON.parse(studio.files[0].data as string)).toEqual(presetInOrder(studio.config.value))

  // a command that refuses saves: the preset is downloaded
  studio.served.value = { path: 'package.json', readOnly: 'a configuration in package.json' }
  expect(exitOf(studio).label).toBe('Download the preset')
  // a command that takes saves: the preset is saved into its file
  studio.served.value = { path: '.magma-design-tokensrc.json', readOnly: null }
  const save = exitOf(studio)
  expect([save.label, save.proceed]).toEqual(['Save the preset', 'Save anyway'])
})

test('the exit goes through the gate: while it fails, the dialog asks first', () => {
  const studio = quietStudio()
  failGate(studio)
  guard(studio, exitOf(studio))
  expect(studio.files).toEqual([])
  expect(studio.pendingExport.value?.label).toBe('Download the preset')
  confirmExport(studio)
  expect(studio.files.map(({ name }) => name)).toEqual(['magma-design-tokensrc.json'])
})
