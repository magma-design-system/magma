// @vitest-environment jsdom
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { h, render } from 'preact'

import { Studio } from '../src/shell.js'

// The shell of the studio: the bar names the three sections, each page is a link with the
// current one marked (app-shell), and the Theme section shows the theme in its own document.
// jsdom does not upgrade the Magma components: the test reads the markup the shell writes.

const root = document.createElement('div')
document.body.append(root)
beforeEach(() => {
  // not served by a command: the studio starts from the configuration it bundles
  vi.stubGlobal('fetch', () => Promise.reject(new Error('no server')))
  localStorage.clear()
})
afterEach(() => {
  render(null, root)
  vi.unstubAllGlobals()
  location.hash = ''
})

const at = async (hash: string) => {
  location.hash = hash
  render(h(Studio, {}), root)
  await vi.waitFor(() => {
    if (!root.querySelector('mds-header-bar')) throw new Error('no bar yet')
  })
}
const links = (scope: Element | null) =>
  [...(scope?.querySelectorAll('mds-button[href]') ?? [])].map((link) => ({
    text: link.textContent?.trim(),
    href: link.getAttribute('href'),
    current: link.getAttribute('aria-current'),
  }))

test('the bar names the three sections, Colors and Behavior opening their pages from a menu', async () => {
  await at('#/colors/groups')
  const nav = [...root.querySelectorAll('mds-header-bar > mds-button[slot="nav"]')]
  expect(nav.map((one) => one.textContent?.trim())).toEqual(['Colors', 'Theme', 'Behavior'])
  expect(nav[0].getAttribute('tone')).toBe('weak')

  const [colors, behavior] = [...root.querySelectorAll('mds-dropdown')].filter((menu) =>
    ['#studio-colors', '#studio-behavior'].includes(String((menu as { target?: string }).target ?? menu.getAttribute('target'))),
  )
  expect(links(colors).map(({ text }) => text)).toEqual([
    'Palette', 'Contrast scales', 'Semantic surface', 'Themes', 'Groups', 'Diffs',
  ])
  expect(links(colors).find(({ current }) => current === 'page')?.href).toBe('#/colors/groups')
  expect(links(behavior).map(({ text }) => text)).toEqual(['Design language', 'Patterns', 'Blocks'])
  // the verdict of the contrast gate heads the Colors menu, once the configuration is judged
  const badge = await vi.waitFor(() => {
    const found = colors.querySelector('mds-badge')
    if (!found) throw new Error('no verdict yet')
    return found
  })
  expect(badge.getAttribute('label')).toBe('All contrasts are OK')
})

test('the Theme section shows the theme in a document of its own, its controls over it', async () => {
  await at('#/theme')
  await vi.waitFor(() => {
    if (!root.querySelector('.studio-theme')) throw new Error('no theme page yet')
  })
  expect(root.querySelector('iframe.studio-scene')?.getAttribute('src')).toBe('scene.html')
  const options = [...root.querySelectorAll('.studio-toolbar mds-input-select option')]
  expect(options.map((option) => option.getAttribute('value'))).toEqual(['business', 'editorial'])
  const axes = [...root.querySelectorAll('.studio-toolbar mds-button')]
  expect(axes.filter((axis) => !axis.hasAttribute('disabled')).map((axis) => axis.getAttribute('aria-label')))
    .toEqual(['Preferences of the person'])
})
