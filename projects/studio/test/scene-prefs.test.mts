// @vitest-environment jsdom
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test, vi } from 'vitest'

import animationWords from '../../stencil/src/components/mds-pref-animation/meta/locale.en.json'
import consumptionWords from '../../stencil/src/components/mds-pref-consumption/meta/locale.en.json'
import {
  ANIMATIONS,
  CONSUMPTIONS,
  DEFAULT_PREFS,
  applyPrefs,
  type Choice,
} from '../src/scene-prefs.js'

// The dropdown of the preferences holds controls of the studio, not the mds-pref-* themselves:
// what it offers is held here to the components it stands for, read from their sources.

// the folder of this file: the URL global of jsdom is no file URL readFileSync takes
const here = dirname(fileURLToPath(import.meta.url))
const source = (path: string) => readFileSync(join(here, '../../stencil/src', path), 'utf8')
const animation = source('components/mds-pref-animation/mds-pref-animation.tsx')
const consumption = source('components/mds-pref-consumption/mds-pref-consumption.tsx')
const scene = readFileSync(join(here, '../scene.html'), 'utf8')

/** The modes a component draws, in their order: the argument of each `handleModeClick`. */
const drawnModes = (component: string) => [...component.matchAll(/handleModeClick\('([^']+)'\)/g)].map((match) => match[1])

/** The icons a component draws, in their order: the `@icon` path of each `icon={...}`. */
const drawnIcons = (component: string) => {
  const paths = new Map([...component.matchAll(/import (\w+) from '@icon\/(.+)\.svg'/g)].map((match) => [match[1], match[2]]))
  return [...component.matchAll(/icon=\{(\w+)\}/g)].map((match) => paths.get(match[1]))
}

const quoted = (text: string) => [...text.matchAll(/'([^']+)'/g)].map((match) => match[1]).sort()

test('the modes are those of each component, in the order it draws them, with its icons', () => {
  const cases: Array<[ReadonlyArray<Choice<string>>, string]> = [
    [ANIMATIONS, animation],
    [CONSUMPTIONS, consumption],
  ]
  for (const [choices, component] of cases) {
    expect(choices.map((one) => one.mode)).toEqual(drawnModes(component))
    expect(choices.map((one) => one.icon)).toEqual(drawnIcons(component))
  }
  // and every value the type of the mode admits
  const animationType = /AnimationModeType = ([^;]+);/.exec(source('components/mds-pref-animation/meta/types.ts'))![1]
  expect(ANIMATIONS.map((one) => one.mode).sort()).toEqual(quoted(animationType))
  const consumptionType = /consumptionModeType = \[([^\]]+)\]/.exec(source('type/preference.ts'))![1]
  expect(CONSUMPTIONS.map((one) => one.mode).sort()).toEqual(quoted(consumptionType))
})

test('each mode says the word the component says for it', () => {
  const cases: Array<[ReadonlyArray<Choice<string>>, Record<string, string>, string]> = [
    [ANIMATIONS, animationWords, animation],
    [CONSUMPTIONS, consumptionWords, consumption],
  ]
  for (const [choices, words, component] of cases) {
    for (const one of choices) {
      expect(words[one.word]).toBeTypeOf('string')
      // the component names the same key for the same mode: `<mode>: { ..., label: '<key>' }`
      expect(component).toMatch(new RegExp(`'?${one.mode}'?: \\{[^}]*label: '${one.word}'`))
    }
  }
})

test('the scene starts from what each component applies with nothing chosen', () => {
  expect(DEFAULT_PREFS.animation).toBe(/defaultMode: AnimationModeType = '([^']+)'/.exec(animation)![1])
  expect(DEFAULT_PREFS.consumption).toBe(/defaultMode: ConsumptionModeType = '([^']+)'/.exec(consumption)![1])
})

test('the scene holds no language: the dropdown sets none, and a stored one could not be undone', () => {
  expect(scene).not.toContain('<mds-pref-language')
})

test('the preferences are set on the mds-pref-* of the scene, only when they change', () => {
  const page = new DOMParser().parseFromString(scene, 'text/html')
  const prefs = { animation: 'reduce', consumption: 'low' } as const
  applyPrefs(page, prefs)
  expect(page.querySelector('mds-pref-animation')?.getAttribute('mode')).toBe('reduce')
  expect(page.querySelector('mds-pref-consumption')?.getAttribute('mode')).toBe('low')

  // the same choice again writes nothing, so no component applies it a second time
  const writes = vi.spyOn(Element.prototype, 'setAttribute')
  applyPrefs(page, prefs)
  expect(writes).not.toHaveBeenCalled()
  writes.mockRestore()
})
