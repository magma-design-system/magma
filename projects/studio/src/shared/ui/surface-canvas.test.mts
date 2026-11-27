import { afterEach, expect, test } from 'vitest'
import { h, render } from 'preact'
import { within } from '@testing-library/preact'

import initialConfig from '@maggioli-design-system/design-tokens/.magma-design-tokensrc.json'
import { createColorTokens } from '@maggioli-design-system/design-tokens/src/lib/color.mjs'
import { TEXT_ROLES } from '@maggioli-design-system/design-tokens/src/lib/text-role.mjs'
import { SurfaceCanvas, type RoleSet } from './surface-canvas.js'
import { LangProvider } from '../i18n/i18n.js'

// The canvas of a mode (#1403, out of the Semantic surface page): the surfaces of a family, its
// text roles and its borders, each contrast with its verdict as a badge of Magma.

const root = document.createElement('div')
document.body.append(root)
afterEach(() => render(null, root))

type Modes = Record<string, Record<'light' | 'dark', RoleSet>>
const color = createColorTokens(JSON.parse(JSON.stringify(initialConfig))).tokens.color as Record<string, Modes>

/** The canvases of the neutral family, light and dark, in a language. */
function show (lang: 'en' | 'it' = 'en') {
  render(
    h(
      LangProvider,
      { value: lang },
      (['light', 'dark'] as const).map((mode) =>
        h(SurfaceCanvas, {
          mode,
          s: color.surface.neutral[mode],
          b: color.border.neutral[mode],
          ink: color.text.neutral[mode],
          ownText: true,
          canvasText: color.text.neutral[mode].default.value,
        }),
      ),
    ),
    root,
  )
  return within(root).queryAllByText(/^\S+ - canvas\b/).map((label) => label.parentElement!)
}

test('the contrast verdicts of the canvas are Magma badges, not emoji', () => {
  const verdicts = ['success', 'warning', 'error']
  const canvases = show()
  expect(canvases).toHaveLength(2)
  for (const canvas of canvases) {
    // every text role carries its verdict: `text muted`, its colour, its Lc, its badge
    const texts = within(canvas).getAllByText(/^text \S+$/)
    expect(texts).toHaveLength(TEXT_ROLES.length)
    for (const text of texts) expect(verdicts).toContain(text.querySelector('mds-badge')?.getAttribute('variant'))
    // a border of state carries one, a decorative border none
    const strong = within(canvas).getByText('border strong')
    const muted = within(canvas).getByText('border muted')
    expect(verdicts).toContain(strong.querySelector('mds-badge')?.getAttribute('variant'))
    expect(muted.querySelector('mds-badge')).toBeNull()
  }
  expect(root.textContent).not.toMatch(/✅|⚠/u)
})

test('the canvas speaks the language of the studio; the roles keep their names', () => {
  const [light] = show('it')
  expect(light.querySelector('.surfaces-canvas-label')?.textContent).toMatch(/^chiaro - canvas #/)
  expect(light.textContent).toContain('border strong')
  expect(light.getAttribute('title')).toBe('il canvas della pagina')
})
