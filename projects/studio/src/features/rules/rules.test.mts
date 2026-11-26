import { afterEach, expect, test } from 'vitest'
import { h, render } from 'preact'

import { LangProvider } from '../../shared/i18n/i18n.js'
import { BEHAVIOR_PAGES } from '../../shared/routes/routes.js'
import { RulesPage } from './rules.js'

// The pages of Behavior, the rules (#1401, a page of features/): each says what it will hold and
// that it comes after the Theme section, in the language of the studio, its name from the table
// of the pages and the rest from the catalogue of the page.

const root = document.createElement('div')
document.body.append(root)

afterEach(() => {
  render(null, root)
})

const show = (page: (typeof BEHAVIOR_PAGES)[number]['id'], lang: 'en' | 'it' = 'en') =>
  render(h(LangProvider, { value: lang }, h(RulesPage, { page })), root)

const title = () => root.querySelector('mds-text[tag="h1"]')?.textContent
const summary = () => root.querySelector('header mds-text[tag="p"]')?.textContent

test('each page of Behavior has its name, what it will hold, and when it comes', () => {
  const summaries = new Set<string | undefined>()
  for (const { id, label } of BEHAVIOR_PAGES) {
    show(id)
    expect(root.querySelector('main')).not.toBeNull()
    expect(title()).toBe(label)
    expect(summary()).toBeTruthy()
    summaries.add(summary())
    const banner = root.querySelector('mds-banner')
    expect(banner?.getAttribute('variant')).toBe('info')
    expect(banner?.getAttribute('headline')).toBe('Read-only, after the theme')
  }
  // a summary of its own for each page
  expect(summaries.size).toBe(BEHAVIOR_PAGES.length)
  show('design-language')
  expect(summary()).toMatch(/^The rules of composition every page of a product follows/)
})

test('in Italian the name comes from the table of the pages, the rest from the catalogue of the page', () => {
  show('patterns', 'it')
  expect(title()).toBe('Pattern')
  expect(summary()).toMatch(/^Come ogni prodotto risolve un compito/)
  expect(root.querySelector('mds-banner')?.getAttribute('headline')).toBe('In sola lettura, dopo il tema')
})
