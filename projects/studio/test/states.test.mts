// @vitest-environment jsdom
import { expect, test } from 'vitest'

import initialConfig from '@maggioli-design-system/design-tokens/.magma-design-tokensrc.json'
import type { MagmaConfig } from '@maggioli-design-system/design-tokens/src/lib/color.mjs'
import { paintedBy } from '../src/paints.js'
import { sceneStyle } from '../src/scene-css.js'
import { onScale } from '../src/scales.js'
import { ACTION_STATES, forcedSelector, forceHover, statesMarkup, statesPlan } from '../src/states.js'

// The states of a colour beside a contrast scale (#1308): the components the family paints at
// every tone the documentation gives them, an action in the states mds-button publishes, the
// hover forced by a copy of the component's own :hover rules.

const config = initialConfig as unknown as MagmaConfig
const painted = (family: string) =>
  paintedBy(family, { config, themes: sceneStyle(config)!.themes })

test('a status shows its action at every state and tone, and its message at every tone', () => {
  const plan = statesPlan(painted('status.error'))!
  expect(plan.variant).toBe('error')
  expect(plan.action).toEqual({ tag: 'mds-button', tones: ['strong', 'weak', 'outline', 'text', 'box'] })
  expect(plan.message).toEqual({ tag: 'mds-banner', tones: ['strong', 'weak', 'box'] })
  expect(plan.markers).toEqual([])

  const page = document.createElement('main')
  page.innerHTML = statesMarkup(plan)
  const buttons = [...page.querySelectorAll('mds-button')]
  expect(buttons).toHaveLength(ACTION_STATES.length * 5)
  expect(buttons.every((button) => button.getAttribute('variant') === 'error')).toBe(true)
  for (const attribute of ['data-studio-hover', 'active', 'current', 'disabled'])
    expect(page.querySelectorAll(`mds-button[${attribute}]`), attribute).toHaveLength(5)
  expect([...page.querySelectorAll('mds-banner')].map((banner) => banner.getAttribute('tone'))).toEqual([
    'strong',
    'weak',
    'box',
  ])
})

test('a label, which neither the action nor the message takes, shows the markers of a category', () => {
  const plan = statesPlan(painted('label.lime'))!
  expect(plan.action).toBeUndefined()
  expect(plan.message).toBeUndefined()
  expect(plan.markers.map(({ tag }) => tag)).toEqual(['mds-badge', 'mds-label'])
  const page = document.createElement('main')
  page.innerHTML = statesMarkup(plan)
  expect([...page.querySelectorAll('mds-badge')].map((badge) => badge.getAttribute('tone'))).toEqual([
    'strong',
    'weak',
    'outline',
  ])
})

test('the family of a theme shows the neutral chrome, a family that paints nothing no page', () => {
  expect(statesPlan(painted('tone.neutral'))?.variant).toBe('dark')
  expect(statesPlan(painted('brand.rnd'))).toBeUndefined()
})

test('the sample family goes on the scale, the others stay as they are', () => {
  const moved = onScale(config, 'status.error', 'tint', 'wcag2')
  const error = moved.colors.find((color) => color.name === 'status.error')!
  expect([error.ratios, error.formula, error.hueShift]).toEqual(['tint', 'wcag2', undefined])
  expect(moved.colors.filter((color) => color.name !== 'status.error')).toEqual(
    config.colors.filter((color) => color.name !== 'status.error'),
  )
})

test('the hover is forced by a copy of the :hover rules of the shadow sheet, nested ones too', () => {
  expect(forcedSelector(":host([tone='weak']:hover)")).toBe(":host([tone='weak'][data-studio-hover])")

  // a sheet the component adopts, as Stencil shares one among its instances: jsdom parses the
  // sheets of the document only, so the one of a <style> in the head stands for it
  const style = document.createElement('style')
  style.textContent = `
    :host { color: black; }
    :host(:hover) { color: red; }
    @media (hover: hover) { :host(:hover) .icon { color: blue; } }
  `
  document.head.append(style)
  const host = document.createElement('mds-button')
  host.setAttribute('data-studio-hover', '')
  document.body.append(host)
  Object.assign(host.attachShadow({ mode: 'open' }), { adoptedStyleSheets: [style.sheet] })
  const done = new WeakSet<object>()
  forceHover(document, done)
  forceHover(document, done)
  const selectors = (rules: CSSRuleList): string[] =>
    [...rules].flatMap((rule) =>
      'selectorText' in rule ? [(rule as CSSStyleRule).selectorText] : selectors((rule as CSSMediaRule).cssRules),
    )
  // copied once, whatever the times it is asked
  expect(selectors(style.sheet!.cssRules)).toEqual([
    ':host',
    ':host(:hover)',
    ':host([data-studio-hover])',
    ':host(:hover) .icon',
    ':host([data-studio-hover]) .icon',
  ])
  host.remove()
  style.remove()
})
