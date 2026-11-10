// @vitest-environment jsdom
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test, vi } from 'vitest'

import animationWords from '../../stencil/src/components/mds-pref-animation/meta/locale.en.json'
import consumptionWords from '../../stencil/src/components/mds-pref-consumption/meta/locale.en.json'
import contrastWords from '../../stencil/src/components/mds-pref-contrast/meta/locale.en.json'
import modeWords from '../../stencil/src/components/mds-pref-mode/meta/locale.en.json'
import {
  ANIMATIONS,
  CONSUMPTIONS,
  CONTRASTS,
  DEFAULT_PREFS,
  MODES,
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
const mode = source('components/mds-pref-mode/mds-pref-mode.tsx')
const contrast = source('components/mds-pref-contrast/mds-pref-contrast.tsx')
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

test('the mode and the contrast are those of each component but its system, with its words and icons', () => {
  /** The icons a component imports: it draws some by its state, `selected ? a : b`. */
  const imported = (component: string) => [...component.matchAll(/import \w+ from '@icon\/(.+)\.svg'/g)].map((match) => match[1])
  const cases: Array<[ReadonlyArray<Choice<string>>, Record<string, string>, string]> = [
    [MODES.filter((one) => one.mode !== 'both'), modeWords, mode],
    [CONTRASTS, contrastWords, contrast],
  ]
  for (const [choices, words, component] of cases) {
    // no system: the studio sets the mode and the contrast of a frame
    expect(choices.map((one) => one.mode)).toEqual(drawnModes(component).filter((one) => one !== 'system'))
    for (const one of choices) {
      expect(words[one.word]).toBeTypeOf('string')
      expect(component).toMatch(new RegExp(`'?${one.mode}'?: \\{[^}]*label: '${one.word}'`))
      expect(imported(component)).toContain(one.icon)
    }
  }
  // the studio's own mode, both side by side in two frames, comes last
  expect(MODES.map((one) => one.mode)).toEqual(['light', 'dark', 'both'])
})

test('the scene starts from what each component applies with nothing chosen', () => {
  expect(DEFAULT_PREFS.animation).toBe(/defaultMode: AnimationModeType = '([^']+)'/.exec(animation)![1])
  expect(DEFAULT_PREFS.consumption).toBe(/defaultMode: ConsumptionModeType = '([^']+)'/.exec(consumption)![1])
})

test('no page a frame loads holds a preference of its own', () => {
  // an mds-pref-* keeps its choice in the storage of the origin, which the frames side by side
  // share with the preferences of the studio, in the menu of its bar (#1336): a choice of the
  // scene would become the studio's, and the studio's would reach the scene
  for (const page of ['scene.html', 'groups.html', 'hero.html', 'states.html']) {
    const html = readFileSync(join(here, '..', page), 'utf8')
    expect(html, page).not.toMatch(/<mds-pref[\s>-]/)
  }
})

/** The class a component writes on <html> for a mode, read from its source. */
const selectorOf = (component: string, mode: string) =>
  new RegExp(`(?:'${mode}'|${mode}): \\{\\s*selector: '([^']+)'`).exec(component)![1]
/** The custom property a component writes on <html>, read from its source. */
const propertyOf = (component: string) => /customPropertyAlias: string = '([^']+)'/.exec(component)![1]

test('the preferences are written on the <html> of the scene as the components write them, only when they change', () => {
  const page = new DOMParser().parseFromString(scene, 'text/html')
  const html = page.documentElement
  const prefs = { animation: 'reduce', consumption: 'low' } as const
  applyPrefs(page, prefs)
  expect(html.classList.contains(selectorOf(animation, 'reduce'))).toBe(true)
  expect(html.classList.contains(selectorOf(consumption, 'low'))).toBe(true)
  expect(html.style.getPropertyValue(propertyOf(animation))).toBe('reduce')
  expect(html.style.getPropertyValue(propertyOf(consumption))).toBe('low')

  // another mode takes the place of the one before
  applyPrefs(page, { ...prefs, animation: 'system' })
  expect(html.classList.contains(selectorOf(animation, 'system'))).toBe(true)
  expect(html.classList.contains(selectorOf(animation, 'reduce'))).toBe(false)

  // the same choice again writes nothing, so the store of the page hears of no change
  const classes = vi.spyOn(DOMTokenList.prototype, 'add')
  const properties = vi.spyOn(CSSStyleDeclaration.prototype, 'setProperty')
  applyPrefs(page, { ...prefs, animation: 'system' })
  expect(classes).not.toHaveBeenCalled()
  expect(properties).not.toHaveBeenCalled()
  classes.mockRestore()
  properties.mockRestore()
})
