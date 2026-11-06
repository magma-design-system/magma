// @vitest-environment jsdom
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { h, render } from 'preact'

import { Studio } from '../src/shell.js'
import { THEME_CHOICES_KEY, resetThemeChoices, updateThemeChoices } from '../src/theme-choices.js'

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
  resetThemeChoices()
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
    'Palette', 'Contrast scales', 'Semantic surface', 'Themes', 'Groups', 'Contrast check', 'Diffs',
  ])
  expect(links(colors).find(({ current }) => current === 'page')?.href).toBe('#/colors/groups')
  // the outline icons, the filled one for the page shown
  const icons = [...colors.querySelectorAll('mds-button[href]')].map((link) => link.getAttribute('icon'))
  expect(icons).toEqual([
    'mi/outline/palette', 'mi/outline/contrast', 'mi/outline/account-tree', 'mi/outline/theater-comedy',
    'mi/baseline/workspaces', 'mi/outline/fact-check', 'mi/outline/difference',
  ])
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
  // the themes of the configuration, once it is loaded: porcelain is one, though Magma ships none
  // by that name
  await vi.waitFor(() => {
    const options = [...root.querySelectorAll('.studio-toolbar mds-input-select option')]
    expect(options.map((option) => option.getAttribute('value'))).toEqual(['business', 'porcelain', 'editorial'])
  })
  // only the axes with something to set: the others wait for their panel, out of sight (#696)
  const axes = [...root.querySelectorAll('.studio-toolbar mds-button')]
  expect(axes.map((axis) => axis.getAttribute('aria-label'))).toEqual(['Preferences of the person'])
  expect(axes.some((axis) => axis.hasAttribute('disabled'))).toBe(false)
})

test('an axis opens its controls in a dropdown from its button, and says which one is open', async () => {
  await at('#/theme')
  const button = await vi.waitFor(() => {
    const found = root.querySelector('.studio-toolbar mds-button[aria-label="Preferences of the person"]')
    if (!found) throw new Error('no bar yet')
    return found
  })
  // the dropdown is not inside the bar, a toolbar of controls, and anchors to the button
  const dropdown = root.querySelector(`mds-dropdown[target="#${button.id}"]`)!
  expect(dropdown).not.toBeNull()
  expect(dropdown.closest('.studio-toolbar')).toBeNull()
  expect(dropdown.getAttribute('placement')).toBe('top')
  // a panel of controls, not a menu: mds-dropdown leaves its contents alone; its title names it
  expect(dropdown.getAttribute('role')).toBe('group')
  const title = dropdown.querySelector(`#${dropdown.getAttribute('aria-labelledby')}`)!
  expect(title.textContent).toBe('Accessibility')
  expect(title.nextElementSibling?.tagName).toBe('MDS-SEPARATOR')
  expect([...dropdown.querySelectorAll('mds-input-select, mds-tab')].map((one) => one.getAttribute('aria-label')))
    .toEqual(['Animations', 'Consumption'])

  dropdown.dispatchEvent(new CustomEvent('mdsDropdownVisible', { bubbles: true }))
  await vi.waitFor(() => expect(button.getAttribute('tone')).toBe('strong'))
  dropdown.dispatchEvent(new CustomEvent('mdsDropdownHide', { bubbles: true }))
  await vi.waitFor(() => expect(button.getAttribute('tone')).toBe('text'))

  // a choice is the state of the studio: the panel says it, every frame receives it
  const animations = dropdown.querySelector('mds-tab[aria-label="Animations"]')!
  animations.dispatchEvent(new CustomEvent('mdsTabChange', { detail: { id: 0, value: 'reduce' }, bubbles: true }))
  await vi.waitFor(() => expect(animations.previousElementSibling?.textContent).toBe('Animations Disabled'))
  expect(animations.querySelector('mds-tab-item[value="reduce"]')?.hasAttribute('selected')).toBe(true)
})

test('a theme of one mode is seen in that mode only, the other choices of the header off', async () => {
  updateThemeChoices((prev) => ({ ...prev, modes: { neutral: ['dark'] } }))
  await at('#/theme')
  // the base theme, business, locked to dark on the Themes page
  await vi.waitFor(() => {
    const frames = [...root.querySelectorAll('iframe.studio-scene')]
    expect(frames.map((frame) => frame.getAttribute('title'))).toEqual(['The theme on a page of a product, dark mode'])
  })
  const [, modes] = [...root.querySelectorAll('.studio-theme-head mds-tab')]
  const items = [...modes.querySelectorAll('mds-tab-item')]
  expect(items.map((item) => [item.getAttribute('value'), item.hasAttribute('disabled'), item.hasAttribute('selected')]))
    .toEqual([['light', true, false], ['dark', false, true], ['both', true, false]])
  expect(items[0].getAttribute('title')).toBe('Business is dark only')
})

test('the choices of the Themes page outlive a reload', async () => {
  updateThemeChoices((prev) => ({ ...prev, names: { porcelain: 'cold-desk' } }))
  expect(JSON.parse(localStorage.getItem(THEME_CHOICES_KEY)!).names).toEqual({ porcelain: 'cold-desk' })
})

test('the header sets what the theme is checked under: both modes are two frames, the width a breakpoint', async () => {
  await at('#/theme')
  const head = await vi.waitFor(() => {
    const found = root.querySelector('.studio-theme-head')
    if (!found) throw new Error('no header yet')
    return found
  })
  const [views, modes] = [...head.querySelectorAll('mds-tab')]
  expect([...views.querySelectorAll('mds-tab-item')].map((item) => item.getAttribute('value')))
    .toEqual(['scenes', 'groups'])
  views.dispatchEvent(new CustomEvent('mdsTabChange', { detail: { id: 1, value: 'groups' }, bubbles: true }))
  await vi.waitFor(() => expect(root.querySelector('iframe.studio-scene')?.getAttribute('src')).toBe('groups.html'))
  views.dispatchEvent(new CustomEvent('mdsTabChange', { detail: { id: 0, value: 'scenes' }, bubbles: true }))
  await vi.waitFor(() => expect(root.querySelector('iframe.studio-scene')?.getAttribute('src')).toBe('scene.html'))

  expect([...modes.querySelectorAll('mds-tab-item')].map((item) => item.getAttribute('value')))
    .toEqual(['light', 'dark', 'both'])
  modes.dispatchEvent(new CustomEvent('mdsTabChange', { detail: { id: 2, value: 'both' }, bubbles: true }))
  await vi.waitFor(() => expect(root.querySelectorAll('iframe.studio-scene')).toHaveLength(2))
  expect([...root.querySelectorAll('iframe.studio-scene')].map((frame) => frame.getAttribute('title')))
    .toEqual(['The theme on a page of a product, light mode', 'The theme on a page of a product, dark mode'])

  const width = head.querySelector('mds-input-select')!
  expect([...width.querySelectorAll('option')].map((option) => option.getAttribute('value')))
    .toEqual(['full', 'desktop', 'tablet', 'mobile'])
  width.dispatchEvent(new CustomEvent('mdsInputSelectChange', { detail: { value: 'tablet' }, bubbles: true }))
  await vi.waitFor(() => expect(root.querySelector('.studio-frames')?.getAttribute('data-width')).toBe('tablet'))
})

test('the bar says the version of the Magma the studio runs on, under its name', async () => {
  const meta = Object.assign(document.createElement('meta'), { name: 'magma-version', content: '2.11.0' })
  document.head.append(meta)
  try {
    await at('#/colors/palette')
    const version = root.querySelector('.studio-product-version')!
    expect(version.getAttribute('typography')).toBe('label')
    expect(version.textContent).toBe('for Magma v2.11.0')
  } finally {
    meta.remove()
  }
  // served without vendor.ts (a test, a page of its own): no version rather than a wrong one
  render(null, root)
  await at('#/colors/palette')
  expect(root.querySelector('.studio-product-version')).toBeNull()
})
