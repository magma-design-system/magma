import bundledJson from '@maggioli-design-system/design-tokens/.magma-design-tokensrc.json'

import type { FileOut } from '../engine/exports.js'
import type { KeptIn } from './draft.js'
import { createStudio, type CloneableConfig, type StudioState } from './studio.js'

// What the tests of the state share (#1400): they run in Node, with no document and no storage of
// a browser, so the state is given a storage in memory and a download that keeps the files.

/** A storage in memory, its items in view. */
export function memoryStorage (): NonNullable<KeptIn> & { items: Map<string, string> } {
  const items = new Map<string, string>()
  return {
    items,
    getItem: (key) => items.get(key) ?? null,
    setItem: (key, value) => void items.set(key, value),
    removeItem: (key) => void items.delete(key),
  }
}

/** A state with no command beside it, kept in memory, the files it hands over collected. */
export function quietStudio (storage = memoryStorage()): StudioState & { files: FileOut[] } {
  const files: FileOut[] = []
  const studio = createStudio({ storage, api: false, download: (file) => void files.push(file) })
  return Object.assign(studio, { files })
}

/** The configuration Magma builds with, a copy of its own. */
export const bundledConfig = (): CloneableConfig => JSON.parse(JSON.stringify(bundledJson))

/** The colour of a family of the configuration of a state. */
export const familyOf = (studio: StudioState, name: string) =>
  studio.config.value.colors.find((one) => one.name === name)
