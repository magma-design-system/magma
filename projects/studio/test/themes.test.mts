// @vitest-environment jsdom
import { afterEach, expect, test } from 'vitest'
import { h, render } from 'preact'

import initialConfig from '@maggioli-design-system/design-tokens/.magma-design-tokensrc.json'
import type { MagmaConfig } from '@maggioli-design-system/design-tokens/src/lib/color.mjs'
import { namedThemeCss, themeOf } from '@maggioli-design-system/design-tokens/semantic.model'
import { semantic } from '@maggioli-design-system/design-tokens/semantic.config'
import { RESERVED_THEME_NAMES, ThemesManager, themeNameProblem } from '../src/themes.js'

// The themes view of the studio: it builds the export CSS while rendering, so a throw anywhere
// in that path (e.g. a helper used but never imported) silently drops the whole block from the
// page. A theme has a name of its own, not the name of the family it is drawn from.

const root = document.createElement('div')
document.body.append(root)
afterEach(() => render(null, root))

const show = () => render(h(ThemesManager, { config: initialConfig as unknown as MagmaConfig }), root)

test('the themes view renders a card per theme, the base first, each named apart from its family', () => {
  show()

  const cards = [...root.querySelectorAll('.theme-card')]
  expect(cards.length).toBeGreaterThan(1)
  expect(cards[0].querySelector('.theme-attr-code')?.textContent).toBe(':root')
  expect(cards[0].querySelector('.scale-usage')?.textContent).toBe('business')
  expect(cards[0].querySelector('.theme-fam')?.textContent).toContain(semantic.tint)
  const editorial = cards.find((card) => card.querySelector('.scale-usage')?.textContent === 'editorial')
  expect(editorial?.querySelector('.theme-fam')?.textContent).toContain('bisque')
  expect(editorial?.querySelector('.theme-attr-code')?.textContent).toBe("data-theme-name='editorial'")
})

test('the export repoints the tint ramp for every non-base theme', () => {
  show()

  const exported = root.querySelector('.theme-export')?.textContent ?? ''
  const blocks = exported.match(/:root\[data-theme-name='[^']+'\] \{[^}]*\}/g) ?? []
  expect(blocks.length).toBeGreaterThan(0)
  for (const block of blocks) expect(block).toContain('--magma-tint-scale-')
})

test('the export prints each theme as themes.css does: the shipped ones by their name and accents', () => {
  show()

  const exported = root.querySelector('.theme-export')?.textContent ?? ''
  const names = [...exported.matchAll(/^:root\[data-theme-name='([^']+)'\] \{/gm)].map((m) => m[1])
  expect(names).toContain('editorial')
  expect(names).not.toContain('bisque')
  // a theme Magma ships prints its block of themes.css; any other the family alone, by its name
  const expected = names.map((name) =>
    name in semantic.themes
      ? namedThemeCss(themeOf(name, semantic.themes[name]))
      : namedThemeCss(themeOf(name, { surface: name })),
  )
  expect(exported).toBe(expected.join('\n\n'))
  expect(exported).toContain(":root[data-theme-name='editorial'].pref-contrast-more {")
})

test('a theme of the person never takes a name Magma ships, nor a name already given', () => {
  for (const name of ['business', 'editorial', 'default', 'cool', 'warm'])
    expect(RESERVED_THEME_NAMES.has(name)).toBe(true)
  expect(themeNameProblem('editorial', 'porcelain', {})).toMatch(/Magma ships/)
  expect(themeNameProblem('My Theme', 'porcelain', {})).toMatch(/lowercase/)
  expect(themeNameProblem('studio', 'porcelain', { kaolin: 'studio' })).toMatch(/kaolin/)
  expect(themeNameProblem('my-product', 'porcelain', { porcelain: 'my-product' })).toBeNull()
})
