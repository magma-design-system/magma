import { expect, test } from 'vitest'
import { strFromU8, unzipSync } from 'fflate'

import initialConfig from '@maggioli-design-system/design-tokens/.magma-design-tokensrc.json'
import type { MagmaConfig } from '@maggioli-design-system/design-tokens/src/lib/color.mjs'
import { exportOf, selectionOf } from './exports.js'

// The files the Config menu hands over (#1400, out of app.tsx): the configuration, its tokens in
// the formats of the build of design-tokens, the zip of all of them.

const config = initialConfig as unknown as MagmaConfig
const DATE = 'Thu, 26 Nov 2026 12:00:00 GMT'
const unzip = (data: string | Uint8Array) => unzipSync(data as Uint8Array)

test('the zip mirrors the dist of design-tokens, the configuration first', () => {
  const zip = exportOf(config, 'zip', DATE)
  expect(zip.name).toBe('magma-design-tokens.zip')
  const files = unzip(zip.data)
  const paths = Object.keys(files)
  expect(paths[0]).toBe('magma-design-tokensrc.json')
  expect(JSON.parse(strFromU8(files['magma-design-tokensrc.json']))).toEqual(config)
  expect(paths).toContain('tokens/color/generated/base.json')
  // the configuration of Magma exports a group of its own: its tokens and its renders apart
  expect(paths.filter((path) => /^tokens\/color\/generated\/(?!base)/.test(path)).length).toBeGreaterThan(0)
  expect(paths).toEqual(expect.arrayContaining(['css/colors-hex.css', 'css/colors-rgb.css', 'gimp/colors.gpl']))
  expect(strFromU8(files['css/colors-rgb.css'])).toContain(DATE)
})

test('the configuration is the file the build reads; Figma takes one DTCG file per mode', () => {
  const file = exportOf(config, 'config')
  expect(file).toEqual({
    name: 'magma-design-tokensrc.json',
    data: JSON.stringify(config, null, 2) + '\n',
    type: 'application/json',
  })
  const figma = unzip(exportOf(config, 'figma').data)
  expect(Object.keys(figma)).toEqual([
    'figma-magma-colors-light.tokens.json',
    'figma-magma-colors-dark.tokens.json',
  ])
})

test('the CSS and the GIMP palette: one file per export group, zipped when more than one', () => {
  const css = exportOf(config, 'css', DATE)
  expect(Object.keys(unzip(css.data)).slice(0, 2)).toEqual(['colors-hex.css', 'colors-rgb.css'])
  const gimp = exportOf(config, 'gimp')
  expect(gimp).toMatchObject({ name: 'magma-gimp.zip', type: 'application/zip' })
  expect(Object.keys(unzip(gimp.data))[0]).toBe('colors.gpl')
})

test('a selection exports the tokens of its families alone, with no file per export group', () => {
  const files = unzip(selectionOf(config, ['tone.neutral', 'label.red'], DATE).data)
  expect(Object.keys(files)).toContain('tokens/color/generated/base.json')
  expect(Object.keys(files).filter((path) => path.startsWith('tokens/'))).toEqual(['tokens/color/generated/base.json'])
  const base = strFromU8(files['tokens/color/generated/base.json'])
  expect(base).toContain('neutral')
  expect(base).not.toContain('kaolin')
})
