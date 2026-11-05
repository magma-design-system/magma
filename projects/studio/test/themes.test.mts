// @vitest-environment jsdom
import { afterEach, expect, test } from 'vitest'
import { h, render } from 'preact'

import initialConfig from '@maggioli-design-system/design-tokens/.magma-design-tokensrc.json'
import type { MagmaConfig } from '@maggioli-design-system/design-tokens/src/lib/color.mjs'
import { namedThemeCss, themeOf } from '@maggioli-design-system/design-tokens/semantic.model'
import { semantic } from '@maggioli-design-system/design-tokens/semantic.config'
import { ThemesManager } from '../src/themes.js'

// Smoke test for the themes section of the studio: it builds the export CSS while
// rendering, so a throw anywhere in that path (e.g. a helper used but never
// imported) silently drops the whole block from the page.

const root = document.createElement('div')
document.body.append(root)
afterEach(() => render(null, root))

test('the themes section renders a card per theme with the default first', () => {
  render(h(ThemesManager, { config: initialConfig as unknown as MagmaConfig }), root)

  expect(root.querySelector('.themes-manager h2')?.textContent).toBe('themes')
  const cards = [...root.querySelectorAll('.theme-card')]
  expect(cards.length).toBeGreaterThan(1)
  expect(cards[0].querySelector('.theme-attr-code')?.textContent).toBe(':root')
  expect(cards[1].querySelector('.theme-attr-code')?.textContent).toMatch(/^data-theme-name='/)
})

test('the export repoints the tint ramp for every non-default theme', () => {
  render(h(ThemesManager, { config: initialConfig as unknown as MagmaConfig }), root)

  const exported = root.textContent ?? ''
  const blocks = exported.match(/:root\[data-theme-name='[^']+'\] \{[^}]*\}/g) ?? []
  expect(blocks.length).toBeGreaterThan(0)
  for (const block of blocks) expect(block).toContain('--magma-tint-scale-')
})

test('the export prints each theme as themes.css does, its contrast blocks included', () => {
  render(h(ThemesManager, { config: initialConfig as unknown as MagmaConfig }), root)

  const exported = root.querySelector('.theme-export')?.textContent ?? ''
  const families = [...exported.matchAll(/^:root\[data-theme-name='([^']+)'\] \{/gm)].map((m) => m[1])
  expect(families.length).toBeGreaterThan(0)
  expect(families).not.toContain(semantic.tint)
  // with no accent reassigned, each block is the one the model prints for the family alone
  const expected = families.map((family) => namedThemeCss(themeOf(family, { surface: family })))
  expect(exported).toBe(expected.join('\n\n'))
  expect(exported).toContain(`:root[data-theme-name='${families[0]}'].pref-contrast-more {`)
})

