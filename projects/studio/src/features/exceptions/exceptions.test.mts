import { afterEach, expect, test } from 'vitest'
import { h, render } from 'preact'

import { LangProvider } from '../../shared/i18n/i18n.js'
import { ExceptionsPage } from './exceptions.js'

// The stage of the exceptions (#1402, a page of features/): stage 4 has no view yet, so its page
// says what it will hold and when it comes, after Magma 3 (#1404).

const root = document.createElement('div')
document.body.append(root)

afterEach(() => {
  render(null, root)
})

const show = (lang: 'en' | 'it' = 'en') =>
  render(h(LangProvider, { value: lang }, h(ExceptionsPage, {})), root)

const title = () => root.querySelector('mds-text[tag="h1"]')?.textContent
const summary = () => root.querySelector('header mds-text[tag="p"]')?.textContent

test('the page names the stage, says what it will hold and that it comes after Magma 3', () => {
  show()
  expect(root.querySelector('main')).not.toBeNull()
  expect(title()).toBe('Exceptions')
  expect(summary()).toMatch(/^How a function shared by several components paints/)
  const banner = root.querySelector('mds-banner')
  expect(banner?.getAttribute('variant')).toBe('info')
  expect(banner?.getAttribute('headline')).toBe('Not built yet')
  expect(banner?.textContent).toMatch(/^This stage comes after Magma 3/)
})

test('in Italian the name of the stage comes from the catalogue of the studio, the rest from the page', () => {
  show('it')
  expect(title()).toBe('Eccezioni')
  expect(summary()).toMatch(/^Come dipinge in ogni stato/)
  expect(root.querySelector('mds-banner')?.getAttribute('headline')).toBe('Non ancora costruito')
})
