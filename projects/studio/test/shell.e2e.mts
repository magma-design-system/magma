import { afterEach, expect, test } from 'vitest'
import { page } from 'vitest/browser'
import { h, render } from 'preact'

import { createStudio } from '../src/state/studio.js'
import { Studio } from '../src/app/shell.js'
import '../src/tailwind.css'
import '../src/style.css'

// The shell of the studio in the Playwright Chromium, with its sheets and the installed magma
// (vendor.ts): the layout jsdom does not compute. The document never scrolls, the regions of a page
// do (style.css, .studio), each the containing block of what it positions: a box positioned past
// the window with no positioned ancestor inside the region scrolls the window too, and the bar then
// covers the strip of the stages under it.

const root = document.createElement('div')
document.body.append(root)
afterEach(() => {
  render(null, root)
  localStorage.clear()
  location.hash = ''
})

/** The studio at an address, on a state of its own that asks no command (createStudio, api). */
function at (hash: string) {
  location.hash = hash
  render(h(Studio, { state: createStudio({ api: false }) }), root)
}

/** How far the document scrolls past the window. */
const overflowOfDocument = () => document.documentElement.scrollHeight - window.innerHeight

test('Weights scrolls inside its region: the hidden names of its sliders never reach past the window', async () => {
  // the window where the document grew by 281px (1181 over 900) while the main was not positioned
  await page.viewport(1440, 900)
  at('#/weights')
  await customElements.whenDefined('mds-input-range')
  const sliders = [...root.querySelectorAll('mds-input-range')]
  await Promise.all(sliders.map((slider) => slider.componentOnReady()))
  // every slider of the page is named by a text hidden from the eye (magma.tsx, Range), absolute
  const names = sliders.map((slider) => slider.querySelector('.studio-hidden')!)
  expect(names.length).toBeGreaterThan(0)
  expect(names.every((name) => getComputedStyle(name).position === 'absolute')).toBe(true)
  // the stage is taller than the window, so its region scrolls ...
  const region = sliders[0].closest('main')!
  await expect.poll(() => region.scrollHeight > region.clientHeight).toBe(true)
  // ... and holds them: the document stays the height of the window
  expect(overflowOfDocument()).toBe(0)
})
