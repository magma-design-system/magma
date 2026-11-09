// @vitest-environment jsdom
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, expect, test } from 'vitest'

import initialConfig from '@maggioli-design-system/design-tokens/.magma-design-tokensrc.json'
import type { MagmaConfig } from '@maggioli-design-system/design-tokens/src/lib/color.mjs'
import { semantic } from '@maggioli-design-system/design-tokens/semantic.config'
import { componentAxes } from '../magma-api.js'
import { markPainted } from '../src/frame.js'
import {
  COMPONENTS,
  KINDS,
  TONES,
  VARIANTS_OF_ACCENT,
  colourVariants,
  paintedBy,
  paintedSelector,
  paintingComponents,
  paintsAny,
} from '../src/paints.js'
import { sceneStyle } from '../src/scene-css.js'
import {
  NO_THEME_CHOICES,
  resetThemeChoices,
  type ThemeChoices,
} from '../src/theme-choices.js'

// What a family paints (#1308): read from the documentation.json of the installed magma, the
// guide of the variants and the accents of the themes, never guessed. The bundled configuration
// is the one Magma builds with: variant.primary is an alias of brand.maggioli, variant.ai of
// label.violet, and the editorial theme points the accent at variant.secondary.

const config = initialConfig as unknown as MagmaConfig
// the folder of this file: the URL global of jsdom is no file URL readFileSync takes
const here = dirname(fileURLToPath(import.meta.url))
const guide = readFileSync(join(here, '../../../docs/agents/variants.md'), 'utf8')
afterEach(() => resetThemeChoices())

const painted = (family: string, choices: ThemeChoices = NO_THEME_CHOICES) =>
  paintedBy(family, { config, themes: sceneStyle(config, choices)!.themes, choices })
const variants = (family: string, choices?: ThemeChoices) =>
  painted(family, choices).variants.map(({ variant, kind, through }) => [variant, kind, through])

test('the colour variants and the tones are those of the guide', () => {
  expect(KINDS).toEqual(colourVariants(guide))
  expect(KINDS.get('primary')).toBe('Accent')
  expect(KINDS.get('secondary')).toBe('Accent')
  expect(KINDS.get('error')).toBe('Status')
  expect(KINDS.get('dark')).toBe('Neutral')
  expect(KINDS.get('google')).toBe('Identity')
  // the families table cuts the labels short: the rows of the variants give them all
  expect([...KINDS].filter(([, kind]) => kind === 'Label').map(([name]) => name)).toHaveLength(12)
  expect(KINDS.has('strong')).toBe(false)
  expect(TONES).toEqual(['strong', 'weak', 'outline', 'text', 'box'])
})

test('the accent roles are those of the layer, each accent variant painted by one of them', () => {
  expect(Object.keys(VARIANTS_OF_ACCENT).sort()).toEqual(Object.keys(semantic.accents).sort())
  const accents = [...KINDS].filter(([, kind]) => kind === 'Accent').map(([name]) => name)
  expect(Object.values(VARIANTS_OF_ACCENT).flat().sort()).toEqual(accents.sort())
})

test('the documentation gives each component its variant and its tone, a default as a value', () => {
  const axes = componentAxes({
    components: [
      {
        tag: 'mds-button',
        props: [
          { name: 'variant', values: [{ value: 'error', type: 'string' }, { type: 'undefined' }], default: "'primary'" },
          { name: 'tone', values: [{ value: 'weak', type: 'string' }] },
        ],
      },
      { tag: 'mds-separator', props: [{ name: 'size', values: [] }] },
    ],
  })
  expect(axes).toEqual([
    { tag: 'mds-button', variant: { values: ['error'], fallback: 'primary' }, tone: { values: ['weak'], fallback: undefined } },
  ])
})

test('a variant of typography or of guidance is no colour', () => {
  const tags = paintingComponents(COMPONENTS, KINDS).map(({ tag }) => tag)
  expect(tags).toEqual(expect.arrayContaining(['mds-button', 'mds-banner', 'mds-badge', 'mds-label', 'mds-input-field']))
  for (const tag of ['mds-text', 'mds-usage', 'mds-list-item', 'mds-input-tip-item'])
    expect(tags).not.toContain(tag)
})

test('a status and a label paint their own variant, seen in the base theme', () => {
  const error = painted('status.error')
  expect(error.theme?.name).toBe('business')
  expect(error.surfaces).toBe(false)
  expect(variants('status.error')).toEqual([['error', 'Status', 'status.error']])
  expect(error.variants[0].tags).toEqual(expect.arrayContaining(['mds-banner', 'mds-button', 'mds-badge', 'mds-input-field']))
  expect(variants('label.lime')).toEqual([['lime', 'Label', 'label.lime']])
})

test('a family paints what its aliases paint, an accent where a theme points the role at it', () => {
  expect(variants('brand.maggioli')).toEqual([
    ['primary', 'Accent', 'variant.primary'],
    ['secondary', 'Accent', 'variant.primary'],
  ])
  expect(variants('label.violet')).toEqual([
    ['violet', 'Label', 'label.violet'],
    ['ai', 'Accent', 'variant.ai'],
  ])
  // no theme is drawn from variant.secondary: it is seen in editorial, which points the accent at it
  expect(painted('variant.secondary').theme?.name).toBe('editorial')
  expect(variants('variant.secondary')).toEqual([
    ['primary', 'Accent', 'variant.secondary'],
    ['secondary', 'Accent', 'variant.secondary'],
  ])
})

test('a repointed accent moves the buttons from one family to the other', () => {
  // every theme of the configuration points the accent at variant.secondary
  const families = sceneStyle(config)!.themes.map((theme) => theme.family)
  expect(families.length).toBeGreaterThan(2)
  const choices: ThemeChoices = {
    ...NO_THEME_CHOICES,
    accents: Object.fromEntries(families.map((family) => [family, { accent: 'variant-secondary' }])),
  }
  expect(variants('variant.primary', choices)).toEqual([])
  expect(paintsAny(painted('variant.primary', choices))).toBe(false)
  expect(painted('variant.secondary', choices).theme?.name).toBe('business')
})

test('the family of a theme paints its surfaces and the neutral variants', () => {
  const bisque = painted('tone.bisque')
  expect(bisque.theme?.name).toBe('editorial')
  expect(bisque.surfaces).toBe(true)
  expect(variants('tone.bisque')).toEqual([
    ['dark', 'Neutral', 'tone.bisque'],
    ['light', 'Neutral', 'tone.bisque'],
  ])
})

test('a family no variant takes and no theme is drawn from paints nothing', () => {
  const rnd = painted('brand.rnd')
  expect(rnd.surfaces).toBe(false)
  expect(rnd.variants).toEqual([])
  expect(paintsAny(rnd)).toBe(false)
})

test('the selector finds a component by its variant, or by its default', () => {
  const selector = paintedSelector(['error'])
  expect(selector).toContain('mds-button[variant="error"]')
  // mds-notification is an error unless it says otherwise
  expect(selector).toContain('mds-notification:not([variant])')
  expect(selector).not.toContain('mds-text')
  expect(paintedSelector(['primary'])).toContain('mds-button:not([variant])')
  expect(paintedSelector([])).toBe('')
})

const scene = () =>
  new DOMParser().parseFromString(
    readFileSync(join(here, '../scene.html'), 'utf8'),
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
