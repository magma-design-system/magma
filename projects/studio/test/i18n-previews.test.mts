// @vitest-environment jsdom
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test, vi } from 'vitest'

import { IT_PREVIEWS } from '../src/i18n-it-previews.js'
import { followLanguage, previewTexts, translatePage } from '../src/i18n-previews.js'

// The previews in the language of the studio (#1336, i18n-previews.ts): the sample pages the
// frames show, held to their Italian catalogue, and the switch of language that reaches them.

// the folder of this file: the URL global of jsdom is no file URL readFileSync takes
const here = dirname(fileURLToPath(import.meta.url))

/** A preview as its frame shows it: parsed, and its script run on it (groups.html writes its matrices). */
const load = (name: string): Document => {
  const page = new DOMParser().parseFromString(readFileSync(join(here, '..', name), 'utf8'), 'text/html')
  for (const script of page.querySelectorAll('script[type="module"]'))
    new Function('document', script.textContent ?? '')(page)
  return page
}
const PAGES = ['hero.html', 'scene.html', 'groups.html']

/** Proper names, the same in every language. */
const NAMES = new Set<string>([
  'Giulia Bianchi', 'Luca Ferri', 'Marco Rossi', 'Anna Conti', 'Elena Ricci', 'g.bianchi', '240 KB',
])
/** A value of the components (a variant, a tone, the name of a role): one lowercase word. */
const isValue = (text: string) => /^[a-z][a-z0-9-]*$/.test(text)
const translated = (text: string) => /[A-Za-z]{2,}/.test(text) && !isValue(text) && !NAMES.has(text)

const texts = PAGES.flatMap((page) => previewTexts(load(page)).filter(translated).map((text) => ({ page, text })))

test('every text of the previews has its Italian', () => {
  const missing = texts.filter(({ text }) => !(text in IT_PREVIEWS)).map(({ page, text }) => `${page}: ${text}`)
  expect([...new Set(missing)]).toEqual([])
})

test('every Italian text of the previews is in a page', () => {
  const used = new Set(texts.map(({ text }) => text))
  expect(Object.keys(IT_PREVIEWS).filter((text) => !used.has(text))).toEqual([])
})

test('a preview goes into Italian and back into English, the components that copy their text too', () => {
  const page = load('hero.html')
  const banner = page.querySelector('mds-banner')!
  const button = page.querySelector('mds-button')!
  translatePage(page, 'it')
  expect(page.documentElement.lang).toBe('it')
  expect(banner.getAttribute('headline')).toBe(IT_PREVIEWS['Send the request to the officer?'])
  // a text that breaks over lines in the page is translated whole
  const text = () => [...banner.childNodes].find((node) => node.nodeType === 3 && node.textContent!.trim())!.textContent!.trim()
  expect(text()).toMatch(/^La richiesta di Laura Bianchi/)
  // mds-button copies the text of its slot into its label once, here after the switch
  button.setAttribute('label', button.textContent!.trim())
  expect(button.getAttribute('label')).toBe(IT_PREVIEWS.Cancel)
  translatePage(page, 'en')
  expect(page.documentElement.lang).toBe('en')
  expect(banner.getAttribute('headline')).toBe('Send the request to the officer?')
  expect(button.getAttribute('label')).toBe('Cancel')
  expect(button.textContent?.trim()).toBe('Cancel')
  expect(text()).toMatch(/^The request of Laura Bianchi/)
})

test('a preview follows the language of the studio at once', async () => {
  const page = load('hero.html')
  const studio = document.implementation.createHTMLDocument('')
  studio.documentElement.lang = 'en'
  followLanguage(page, studio)
  expect(page.documentElement.lang).toBe('en')
  studio.documentElement.lang = 'it'
  await vi.waitFor(() => expect(page.documentElement.lang).toBe('it'))
  expect(page.querySelector('mds-banner')?.getAttribute('headline')).toBe(IT_PREVIEWS['Send the request to the officer?'])
})
