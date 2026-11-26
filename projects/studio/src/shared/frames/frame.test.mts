import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'

import { KINDS, paintedSelector } from '../../engine/paints.js'
import { markPainted } from './frame.js'

// The scene puts first the elements a family paints (#1308): markPainted on the sample page of
// the studio, with the selector of paints.ts. Moved from the tests of paints (#1399): it parses
// the page, so it needs a document.

// the folder of this file: the URL global of jsdom is no file URL readFileSync takes
const here = dirname(fileURLToPath(import.meta.url))

const scene = () =>
  new DOMParser().parseFromString(
    readFileSync(join(here, '../../../scene.html'), 'utf8'),
    'text/html',
  )

test('the scene marks the elements of the family, and forgets them for another', () => {
  const page = scene()
  const tags = markPainted(page, 'status.error', paintedSelector(['error']))
  expect(tags).toEqual(['mds-banner', 'mds-badge', 'mds-input-field', 'mds-input', 'mds-button'])
  expect(page.documentElement.getAttribute('data-studio-paints')).toBe('status.error')
  expect(page.querySelector('mds-banner[variant="error"]')?.hasAttribute('data-studio-painted')).toBe(true)

  // the surfaces of a theme have nothing to put first: the page goes back as it is
  expect(markPainted(page, 'tone.neutral', '')).toEqual([])
  expect(page.documentElement.hasAttribute('data-studio-paints')).toBe(false)
  expect(page.querySelectorAll('[data-studio-painted]')).toHaveLength(0)
})

test('the scene has an element for every label colour of the guide', () => {
  const page = scene()
  for (const [variant, kind] of KINDS)
    if (kind === 'Label')
      expect(page.querySelector(`[variant="${variant}"]`), variant).not.toBeNull()
})
