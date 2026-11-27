import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { act } from 'preact/test-utils'

import { DRAFT_STORAGE_KEY } from './state/draft.js'
import { mount, type Mounted } from './main.js'

// The one entry of the studio (#1404): a host mounts it on an element of its page and takes it off
// again; the address lives in the hash of the window, or in memory for a host that owns the
// address of its page (#695). jsdom does not upgrade the components of Magma: the test reads the
// markup the studio writes.

let element: HTMLElement
let mounted: Mounted | undefined

beforeEach(() => {
  vi.stubGlobal('fetch', () => Promise.reject(new Error('no server')))
  localStorage.clear()
  element = document.createElement('div')
  document.body.append(element)
})
afterEach(() => {
  mounted?.unmount()
  mounted = undefined
  element.remove()
  location.hash = ''
  localStorage.clear()
  vi.unstubAllGlobals()
})

const title = () => element.querySelector('mds-text[tag="h1"]')?.textContent

test('mounted on an element, the studio follows the hash of the window; unmounted, it leaves the element', async () => {
  location.hash = '#/themes'
  await act(() => {
    mounted = mount(element)
  })
  await vi.waitFor(() => expect(title()).toBe('Themes'))
  location.hash = '#/weights'
  await vi.waitFor(() => expect(title()).toBe('Weights'))
  // the language is on the page before the first render
  expect(document.documentElement.lang).toMatch(/^(en|it)$/)

  await act(() => mounted!.unmount())
  mounted = undefined
  expect(element.innerHTML).toBe('')
  // off its element, it follows nothing
  location.hash = '#/themes'
  await new Promise((done) => setTimeout(done, 50))
  expect(element.innerHTML).toBe('')
})

test('in memory, it opens where the host says, follows its own links and leaves the hash of the window alone', async () => {
  location.hash = '#the-heading-of-the-host'
  await act(() => {
    mounted = mount(element, { location: 'memory', address: '#/themes' })
  })
  await vi.waitFor(() => expect(title()).toBe('Themes'))
  // the way forward of the stage, a link of Magma: in memory, the window keeps its hash
  const forward = [...element.querySelectorAll('mds-button[href]')].find(
    (one) => one.getAttribute('href') === '#/exceptions',
  )!
  const click = new MouseEvent('click', { bubbles: true, composed: true, cancelable: true })
  await act(() => {
    forward.dispatchEvent(click)
  })
  expect(click.defaultPrevented).toBe(true)
  await vi.waitFor(() => expect(title()).toBe('Exceptions'))
  expect(location.hash).toBe('#the-heading-of-the-host')
  // a link that is no address of the studio is the host's
  const outside = document.createElement('a')
  outside.setAttribute('href', '#elsewhere')
  element.append(outside)
  const other = new MouseEvent('click', { bubbles: true, cancelable: true })
  outside.dispatchEvent(other)
  expect(other.defaultPrevented).toBe(false)
})

test('a host hands in where the work is kept: with none, the draft is written nowhere', async () => {
  await act(() => {
    mounted = mount(element, { location: 'memory', address: '#/colours', storage: null, api: false })
  })
  await vi.waitFor(() => expect(title()).toBe('Colors'))
  await new Promise((done) => setTimeout(done, 50))
  expect(localStorage.getItem(DRAFT_STORAGE_KEY)).toBeNull()
})
