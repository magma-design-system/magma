// @vitest-environment jsdom
import { afterEach, expect, test } from 'vitest'
import { h, render } from 'preact'

import initialConfig from '../.magma-design-tokensrc.json'
import type { MagmaConfig } from '../src/lib/color.mjs'
import { ThemesManager } from '../playground/src/themes.js'

// Smoke test for the playground themes section: it builds the export CSS while
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
