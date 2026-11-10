// @vitest-environment jsdom
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { h, render } from 'preact'

import initialConfig from '@maggioli-design-system/design-tokens/.magma-design-tokensrc.json'
import { DRAFT_STORAGE_KEY, hashText, type StudioDraft } from '../src/draft.js'
import { Studio } from '../src/shell.js'
import { THEME_CHOICES_KEY, resetThemeChoices, updateThemeChoices } from '../src/theme-choices.js'
import { textOf } from './text.mjs'

// The shell of the studio: the bar names the three sections, each page is a link with the
// current one marked (app-shell), and the Theme section shows the theme in its own document.
// jsdom does not upgrade the Magma components: the test reads the markup the shell writes.

// the folder of this file: the URL global of jsdom is no file URL readFileSync takes
const here = dirname(fileURLToPath(import.meta.url))

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
    text: textOf(link),
    href: link.getAttribute('href'),
    current: link.getAttribute('aria-current'),
  }))

test('the bar names the three sections, Colors and Behavior opening their pages from a menu, then Config', async () => {
  await at('#/colors/groups')
  const nav = [...root.querySelectorAll('mds-header-bar > mds-button[slot="nav"]')]
  expect(nav.map((one) => textOf(one))).toEqual(['Colors', 'Theme', 'Behavior', 'Config'])
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

// Config, after the sections of the bar, a menu of actions (config-menu.tsx): it brings a
// configuration in and takes it out from any section, each action with the format of what it reads
// or hands over in a badge the click goes through; the menu of a narrow window lists them too
test('the Config menu of the bar imports and exports the configuration from any section', async () => {
  await at('#/theme')
  const menu = [...root.querySelectorAll('mds-dropdown')].find(
    (one) => String((one as { target?: string }).target ?? one.getAttribute('target')) === '#studio-config',
  )!
  const items = () =>
    [...menu.querySelectorAll('.studio-config-item')].map((item) => [
      item.querySelector('mds-button')?.getAttribute('label'),
      item.querySelector('mds-badge')?.getAttribute('label') ?? null,
    ])
  await vi.waitFor(() => expect(items().length).toBeGreaterThan(0))
  expect(items()).toEqual([
    ['Import config', 'json'],
    ['Copy JSON', null],
    ['Download all tokens', 'misc'],
    ['Download config', 'json'],
    ['Download Figma tokens', 'DTCG'],
    ['Download CSS tokens', 'css'],
    ['Download GIMP palette', 'gpl'],
  ])
  // the format is part of the name of the action, its badge hidden
  const figma = menu.querySelector('mds-button[data-action="figma"]')!
  expect(figma.getAttribute('aria-label')).toBe('Download Figma tokens, DTCG')
  expect(figma.parentElement?.querySelector('mds-badge')?.getAttribute('aria-hidden')).toBe('true')
  // the take-outs after a separator
  expect(menu.querySelectorAll('mds-separator').length).toBe(1)
  // and in the menu of a narrow window
  const narrow = root.querySelector('nav.studio-menu-nav')!
  expect([...narrow.querySelectorAll('.studio-config-item mds-button')].map((one) => one.getAttribute('label')))
    .toContain('Import config')
  // a download from the Theme section hands over its file
  const files: string[] = []
  vi.stubGlobal('URL', Object.assign(Object.create(URL), {
    createObjectURL: () => 'blob:tokens',
    revokeObjectURL: () => undefined,
  }))
  const click = vi
    .spyOn(HTMLAnchorElement.prototype, 'click')
    .mockImplementation(function (this: HTMLAnchorElement) {
      files.push(this.download)
    })
  try {
    menu.querySelector<HTMLElement>('mds-button[data-action="config"]')!.click()
    await vi.waitFor(() => expect(files).toEqual(['magma-design-tokensrc.json']))
  } finally {
    click.mockRestore()
    vi.unstubAllGlobals()
  }
})

// The Start page comes before the sections (start.tsx): a start with no address opens it, the
// name of the studio links back to it, and its first step opens the palette, or the page of
// Colors the draft was on
test('a start with no address opens the Start page, which the name of the studio links to', async () => {
  await at('')
  await vi.waitFor(() => expect(location.hash).toBe('#/start'))
  const start = root.querySelector('main.start')
  expect(start?.querySelector('mds-text[tag="h1"]')?.textContent?.trim()).toBe('The theme of your product, readable by everyone')
  expect(root.querySelector('a.studio-product')?.getAttribute('href')).toBe('#/start')
  // no section of the bar is the one on screen, and Config is no section
  const nav = [...root.querySelectorAll('mds-header-bar > mds-button[slot="nav"]')]
  expect(nav.map((one) => one.getAttribute('tone'))).toEqual(['text', 'text', 'text', 'text'])
  expect(links(start).find(({ text }) => text === 'Open the palette')?.href).toBe('#/colors/palette')
})

test('the Start page offers to continue on the page of Colors the draft was on', async () => {
  const draft: StudioDraft = {
    config: initialConfig as StudioDraft['config'],
    selectedName: 'tone.neutral',
    view: 'scales',
    source: { path: null, hash: hashText(JSON.stringify(initialConfig)) },
  }
  localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft))
  await at('#/start')
  const start = root.querySelector('main.start')
  expect(links(start).find(({ text }) => text?.startsWith('Continue on'))).toEqual({
    text: 'Continue on Contrast scales',
    href: '#/colors/contrast-scales',
    current: null,
  })
  // the page last opened, once the person has opened one
  location.hash = '#/colors/groups'
  await vi.waitFor(() => expect(root.querySelector('main.start')).toBeNull())
  location.hash = '#/start'
  await vi.waitFor(() =>
    expect(links(root.querySelector('main.start')).map(({ text }) => text)).toContain('Continue on Groups'),
  )
})

test('the Theme section shows the theme in a document of its own, its controls in a bar over it', async () => {
  await at('#/theme')
  const page = await vi.waitFor(() => {
    const found = root.querySelector('.studio-theme')
    if (!found) throw new Error('no theme page yet')
    return found
  })
  expect(root.querySelector('iframe.studio-scene')?.getAttribute('src')).toBe('scene.html')
  // nothing over the frames: what the theme is checked under opens from the bar at the bottom too
  expect(page.firstElementChild?.classList.contains('studio-frames')).toBe(true)
  // the themes of the configuration, once it is loaded: porcelain is one, though Magma ships none
  // by that name
  await vi.waitFor(() => {
    const options = [...root.querySelectorAll('.studio-toolbar mds-input-select option')]
    expect(options.map((option) => option.getAttribute('value'))).toEqual(['business', 'porcelain', 'editorial'])
  })
  // only the axes with something to set: the others wait for their panel, out of sight (#696);
  // then the ruler of the preview
  const buttons = [...root.querySelectorAll('.studio-toolbar mds-button')]
  expect(buttons.map((button) => button.getAttribute('aria-label'))).toEqual(['Preferences of the person', 'Preview'])
  expect(buttons.map((button) => button.getAttribute('icon'))).toEqual(['mi/baseline/accessibility', 'mi/outline/straighten'])
  expect(buttons.some((button) => button.hasAttribute('disabled'))).toBe(false)
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
  // the mode and the contrast first, the words of mds-pref-mode and mds-pref-contrast
  expect([...dropdown.querySelectorAll('mds-input-select, mds-tab')].map((one) => one.getAttribute('aria-label')))
    .toEqual(['Mode', 'Contrast', 'Animations', 'Consumption'])

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

test('a theme of one mode is seen in that mode only, the other modes of the preferences off', async () => {
  updateThemeChoices((prev) => ({ ...prev, modes: { neutral: ['dark'] } }))
  await at('#/theme')
  // the base theme, business, locked to dark on the Themes page
  await vi.waitFor(() => {
    const frames = [...root.querySelectorAll('iframe.studio-scene')]
    expect(frames.map((frame) => frame.getAttribute('title'))).toEqual(['The theme on a page of a product, dark mode'])
  })
  const modes = root.querySelector('mds-dropdown[target="#studio-axis-preferences"] mds-tab[aria-label="Mode"]')!
  expect(modes.previousElementSibling?.textContent).toBe('Mode Dark')
  const items = [...modes.querySelectorAll('mds-tab-item')]
  expect(items.map((item) => [item.getAttribute('value'), item.hasAttribute('disabled'), item.hasAttribute('selected')]))
    .toEqual([['light', true, false], ['dark', false, true], ['both', true, false]])
  // the reason is the title of a mode off, the word of the mode the title of the others
  expect(items.map((item) => item.getAttribute('title')))
    .toEqual(['Business is dark only', 'Dark', 'Business is dark only'])
})

test('an address that names a theme and a mode opens the section on them, and follows the choices made there', async () => {
  await at('#/theme/editorial/dark')
  const select = await vi.waitFor(() => {
    const found = root.querySelector('.studio-toolbar mds-input-select')
    expect(found?.getAttribute('value')).toBe('editorial')
    return found!
  })
  // the mode is a preference of the person, in the dropdown of the preferences
  const modes = root.querySelector('mds-dropdown[target="#studio-axis-preferences"] mds-tab[aria-label="Mode"]')!
  expect([...modes.querySelectorAll('mds-tab-item')].map((item) => item.hasAttribute('selected')))
    .toEqual([false, true, false])
  expect([...root.querySelectorAll('iframe.studio-scene')].map((frame) => frame.getAttribute('title')))
    .toEqual(['The theme on a page of a product, dark mode'])

  // a choice made in the section goes into the address in place: no page to go back to
  const entries = history.length
  modes.dispatchEvent(new CustomEvent('mdsTabChange', { detail: { id: 2, value: 'both' }, bubbles: true }))
  await vi.waitFor(() => expect(location.hash).toBe('#/theme/editorial/both'))
  // porcelain, a theme of the configuration only: in the select once the configuration is loaded
  await vi.waitFor(() => expect(select.querySelector('option[value="porcelain"]')).not.toBeNull())
  select.dispatchEvent(new CustomEvent('mdsInputSelectChange', { detail: { value: 'porcelain' }, bubbles: true }))
  await vi.waitFor(() => expect(location.hash).toBe('#/theme/porcelain/both'))
  expect(history.length).toBe(entries)
})

test('the choices of the Themes page outlive a reload', async () => {
  updateThemeChoices((prev) => ({ ...prev, names: { porcelain: 'cold-desk' } }))
  expect(JSON.parse(localStorage.getItem(THEME_CHOICES_KEY)!).names).toEqual({ porcelain: 'cold-desk' })
})

test('the preferences set the mode and the contrast: both modes are two frames', async () => {
  await at('#/theme')
  const dropdown = await vi.waitFor(() => {
    const found = root.querySelector('mds-dropdown[target="#studio-axis-preferences"]')
    if (!found) throw new Error('no bar yet')
    return found
  })
  const modes = dropdown.querySelector('mds-tab[aria-label="Mode"]')!
  expect([...modes.querySelectorAll('mds-tab-item')].map((item) => [item.getAttribute('value'), item.getAttribute('icon')]))
    .toEqual([['light', 'mi/baseline/light-mode'], ['dark', 'mi/baseline/dark-mode'], ['both', 'mi/baseline/compare']])
  modes.dispatchEvent(new CustomEvent('mdsTabChange', { detail: { id: 2, value: 'both' }, bubbles: true }))
  await vi.waitFor(() => expect(root.querySelectorAll('iframe.studio-scene')).toHaveLength(2))
  expect([...root.querySelectorAll('iframe.studio-scene')].map((frame) => frame.getAttribute('title')))
    .toEqual(['The theme on a page of a product, light mode', 'The theme on a page of a product, dark mode'])
  expect(modes.previousElementSibling?.textContent).toBe('Mode Light and dark')

  const contrast = dropdown.querySelector('mds-tab[aria-label="Contrast"]')!
  expect(contrast.previousElementSibling?.textContent).toBe('Contrast Default')
  contrast.dispatchEvent(new CustomEvent('mdsTabChange', { detail: { id: 0, value: 'more' }, bubbles: true }))
  await vi.waitFor(() => expect(contrast.previousElementSibling?.textContent).toBe('Contrast More'))
  expect(contrast.querySelector('mds-tab-item[value="more"]')?.hasAttribute('selected')).toBe(true)
})

test('the ruler opens the preview: the view the frame shows, its width a breakpoint', async () => {
  await at('#/theme')
  const button = await vi.waitFor(() => {
    const found = root.querySelector('.studio-toolbar mds-button[aria-label="Preview"]')
    if (!found) throw new Error('no bar yet')
    return found
  })
  // a panel of controls above the bar, out of it, named by its title, as the one of an axis
  const dropdown = root.querySelector(`mds-dropdown[target="#${button.id}"]`)!
  expect(dropdown.closest('.studio-toolbar')).toBeNull()
  expect([dropdown.getAttribute('placement'), dropdown.getAttribute('role')]).toEqual(['top', 'group'])
  const title = dropdown.querySelector(`#${dropdown.getAttribute('aria-labelledby')}`)!
  expect(title.textContent).toBe('Preview')
  expect(title.nextElementSibling?.tagName).toBe('MDS-SEPARATOR')
  dropdown.dispatchEvent(new CustomEvent('mdsDropdownVisible', { bubbles: true }))
  await vi.waitFor(() => expect(button.getAttribute('tone')).toBe('strong'))
  dropdown.dispatchEvent(new CustomEvent('mdsDropdownHide', { bubbles: true }))
  await vi.waitFor(() => expect(button.getAttribute('tone')).toBe('text'))

  // the view: its name beside the page it opens
  const views = dropdown.querySelector('mds-tab[aria-label="View"]')!
  expect([...views.querySelectorAll('mds-tab-item')].map((item) => item.getAttribute('label')))
    .toEqual(['Scenes', 'Groups'])
  views.dispatchEvent(new CustomEvent('mdsTabChange', { detail: { id: 1, value: 'groups' }, bubbles: true }))
  await vi.waitFor(() => expect(root.querySelector('iframe.studio-scene')?.getAttribute('src')).toBe('groups.html'))
  expect(views.previousElementSibling?.textContent).toBe('View The theme on every component')
  views.dispatchEvent(new CustomEvent('mdsTabChange', { detail: { id: 0, value: 'scenes' }, bubbles: true }))
  await vi.waitFor(() => expect(root.querySelector('iframe.studio-scene')?.getAttribute('src')).toBe('scene.html'))

  // the width: the room of the section, or a breakpoint of Magma
  const width = dropdown.querySelector('mds-tab[aria-label="Width"]')!
  expect([...width.querySelectorAll('mds-tab-item')].map((item) => item.getAttribute('value')))
    .toEqual(['full', 'desktop', 'tablet', 'mobile'])
  expect(width.previousElementSibling?.textContent).toBe('Width Full width')
  width.dispatchEvent(new CustomEvent('mdsTabChange', { detail: { id: 2, value: 'tablet' }, bubbles: true }))
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

// #1336: the menu of the bar, at every width, holds the preferences of the person: the language
// first, then the mode, the contrast and the animations; on a narrow window the sections before them
test('the menu of the bar holds the preferences of the person, at every width', async () => {
  await at('#/start')
  expect(root.querySelector('mds-header')?.getAttribute('menu')).toBe('all')
  const prefs = root.querySelector('.studio-menu mds-pref')!
  // the studio follows the language at once: no reload to ask for
  expect(prefs.hasAttribute('live-language')).toBe(true)
  expect([...prefs.children].map((one) => one.localName)).toEqual([
    'mds-pref-language', 'mds-pref-mode', 'mds-pref-contrast', 'mds-pref-animation',
  ])
  expect([...prefs.querySelectorAll('mds-pref-language-item')].map((one) => one.getAttribute('code'))).toEqual(['it', 'en'])
  const menu = root.querySelector('.studio-menu')!
  expect([...menu.children].map((one) => one.className)).toEqual(['studio-menu-nav', 'studio-menu-prefs'])
})

test('the menu hides its sections from the width the bar shows them, the tablet breakpoint of Magma', () => {
  // a media query reads no custom property: the width of style.css is screen.tablet.min
  const tablet = JSON.parse(readFileSync(join(here, '../../design-tokens/tokens/screen/default.json'), 'utf8'))
    .screen.tablet.min.value
  const css = readFileSync(join(here, '../src/style.css'), 'utf8')
  expect(css).toMatch(new RegExp(`@media \\(width >= ${tablet}\\) \\{\\s*\\.studio-menu-nav \\{\\s*display: none;`))
  // and mds-header-bar shows its sections from that breakpoint up (nav="desktop", the default)
  const bar = readFileSync(join(here, '../../stencil/src/components/mds-header-bar/mds-header-bar.css'), 'utf8')
  expect(bar).toMatch(/:host\(\[nav='desktop'\]\) \.nav \{\s*@apply max-tablet:hidden;/)
})

test('the studio follows the language of <html lang> at once', async () => {
  document.documentElement.lang = 'it'
  try {
    await at('#/start')
    const nav = () => [...root.querySelectorAll('mds-header-bar > mds-button[slot="nav"]')].map((one) => textOf(one))
    expect(nav()).toEqual(['Colori', 'Tema', 'Regole', 'Configurazione'])
    document.documentElement.lang = 'en'
    await vi.waitFor(() => expect(nav()).toEqual(['Colors', 'Theme', 'Behavior', 'Config']))
  } finally {
    document.documentElement.lang = ''
  }
})
