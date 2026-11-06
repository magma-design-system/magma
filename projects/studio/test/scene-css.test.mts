// @vitest-environment jsdom
import { expect, test } from 'vitest'

import initialConfig from '@maggioli-design-system/design-tokens/.magma-design-tokensrc.json'
import type { MagmaConfig } from '@maggioli-design-system/design-tokens/src/lib/color.mjs'
import { namedThemeCss, themeOf } from '@maggioli-design-system/design-tokens/semantic.model'
import { sceneStyle } from '../src/scene-css.js'
import { applyFrame } from '../src/shell.js'

// The Theme section shows the configuration the person edits: the select offers its themes, and
// the frame paints them with the CSS the studio writes into it, over the installed Magma.

const config = initialConfig as unknown as MagmaConfig

test('the themes of a configuration are the tints with a surface, the base first, by their names', () => {
  const style = sceneStyle(config)!
  // porcelain has a surface in the bundled configuration, and no theme of Magma is drawn from it
  // but the deprecated cool: the theme takes the name of its family
  expect(style.themes).toEqual([
    { name: 'business', family: 'neutral', modes: ['light', 'dark'] },
    { name: 'porcelain', family: 'porcelain', modes: ['light', 'dark'] },
    { name: 'editorial', family: 'bisque', modes: ['light', 'dark'] },
  ])
})

test('the choices of the Themes page reach the frame: the name, and a theme of one mode with its lock', () => {
  const style = sceneStyle(config, {
    names: { porcelain: 'cold-desk' },
    accents: {},
    modes: { porcelain: ['dark'] },
  })!
  expect(style.themes[1]).toEqual({ name: 'cold-desk', family: 'porcelain', modes: ['dark'] })
  // the block the export of the Themes page prints, the lock first
  expect(style.css).toMatch(/:root\[data-theme-name='cold-desk'\] \{\n {2}--magma-color-modes: dark;/)
})

test('the frame gets the palette of the configuration and the block of every theme but the base', () => {
  const { css } = sceneStyle(config)!
  expect(css).toContain('--tone-porcelain-01:')
  expect(css).toContain(namedThemeCss(themeOf('porcelain', { surface: 'porcelain' })))
  expect(css).toContain(":root[data-theme-name='editorial']")
  expect(css).not.toContain(":root[data-theme-name='business']")
})

test('a theme a family name cannot name is left out, the base family is always first', () => {
  const odd = JSON.parse(JSON.stringify(config)) as MagmaConfig
  const porcelain = odd.colors.find((color) => color.name === 'tone.porcelain')!
  porcelain.name = 'tone.Porcelain2'
  const names = sceneStyle(odd)?.themes.map(({ name }) => name) ?? []
  expect(names[0]).toBe('business')
  expect(names).not.toContain('Porcelain2')
})

test('a frame follows the theme, the mode and the contrast it is given, not those the person stored', () => {
  const scene = document.implementation.createHTMLDocument('scene')
  // what mds-pref-mode and mds-pref-contrast write from a stored choice
  scene.documentElement.classList.add('pref-mode-system', 'pref-contrast-more')
  applyFrame(scene, { theme: 'editorial', scheme: 'dark', contrast: false, css: 'a {}' })
  const html = scene.documentElement
  expect(html.getAttribute('data-theme-name')).toBe('editorial')
  expect(html.hasAttribute('data-magma-pref')).toBe(true)
  expect([...html.classList].sort()).toEqual(['pref-contrast-no-preference', 'pref-mode-dark', 'pref-theme-scheme-all'])
  expect(scene.querySelectorAll('style#studio-configuration')).toHaveLength(1)

  applyFrame(scene, { theme: 'business', scheme: 'light', contrast: true, css: 'b {}' })
  expect([...html.classList].sort()).toEqual(['pref-contrast-more', 'pref-mode-light', 'pref-theme-scheme-all'])
  expect(scene.querySelectorAll('style#studio-configuration')).toHaveLength(1)
  expect(scene.getElementById('studio-configuration')?.textContent).toBe('b {}')

  // no configuration yet: the frame shows the installed Magma alone
  applyFrame(scene, { theme: 'business', scheme: 'light', contrast: false })
  expect(scene.getElementById('studio-configuration')).toBeNull()
})
