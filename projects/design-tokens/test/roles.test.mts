// The roles of the design language (#1189) as the build publishes them: the rhythm and the
// widths in typography.css, their bridges in the Tailwind theme, the titles by role pointing
// at their level, and the same roles in the DTCG export. The values are the decisions of
// #1189 (rhythm 1 to 4, titles 5, widths 6). Needs a build first (nx: test dependsOn build).
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { describe, expect, test } from 'vitest'

import { NAMESPACE } from '../scripts/dtcg/sets'

const DIST = resolve(__dirname, '../dist')

/** `--name: value` of the first block of `file` whose selector starts with `selector`. */
const block = (file: string, selector: string): Map<string, string> => {
  const css = readFileSync(resolve(DIST, 'css', file), 'utf8')
  const start = css.indexOf(selector)
  if (start < 0) throw new Error(`${selector} not in ${file}`)
  const body = css.slice(css.indexOf('{', start) + 1, css.indexOf('}', start))
  return new Map([...body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]))
}

const vars = block('typography.css', ':root {')
const theme = block('tailwind-theme-typography.css', '@theme {')
type Extension = { css?: string, tier?: string, cssOnly?: Array<{ css: string, value: string }> }
type Node = { $value?: unknown, $type?: string, $description?: string, $extensions: Record<string, Extension> }
const base = JSON.parse(readFileSync(resolve(DIST, 'dtcg', 'base.tokens.json'), 'utf8')) as Record<string, unknown>
/** The token or group of the base set at a dotted path. */
const at = (path: string): Node =>
  path.split('.').reduce<unknown>((node, key) => (node as Record<string, unknown>)?.[key], base) as Node

const px = (value: string | undefined): number => {
  const match = /^(\d+(?:\.\d+)?)px$/.exec(value ?? '')
  if (!match) throw new Error(`${value} is no px length`)
  return Number(match[1])
}

const RHYTHM: Record<string, number> = {
  'inline': 12,
  'title-content': 12,
  'label-control': 12,
  'between-containers': 16,
  'between-fields': 24,
  'inset': 24,
  'between-groups': 40,
  'between-sections': 64,
}

describe('rhythm', () => {
  test.each(Object.entries(RHYTHM))('--magma-rhythm-%s is %ipx, a literal', (id, value) => {
    expect(px(vars.get(`--magma-rhythm-${id}`))).toBe(value)
  })

  test('publishes the relations decided, and no other', () => {
    const published = [...vars.keys()].filter((name) => name.startsWith('--magma-rhythm-'))
    expect(published.sort()).toEqual(Object.keys(RHYTHM).map((id) => `--magma-rhythm-${id}`).sort())
  })

  // rhythm/step-ratio: each step at least 1.5 times the step it contains, for the relations
  // with no boundary between their elements
  test('each relation is at least 1.5 times the one it contains', () => {
    const ladder = ['title-content', 'between-fields', 'between-groups', 'between-sections']
      .map((id) => px(vars.get(`--magma-rhythm-${id}`)))
    for (let i = 1; i < ladder.length; i++) expect(ladder[i] / ladder[i - 1]).toBeGreaterThanOrEqual(1.5)
  })

  test('the inset of a container is the step between fields, and its boundary lets the cards stand closer', () => {
    expect(vars.get('--magma-rhythm-inset')).toBe(vars.get('--magma-rhythm-between-fields'))
    expect(px(vars.get('--magma-rhythm-between-containers'))).toBeLessThan(px(vars.get('--magma-rhythm-inset')))
  })

  test.each(Object.keys(RHYTHM))('the Tailwind theme bridges %s as a spacing key, with its value as fallback', (id) => {
    expect(theme.get(`--spacing-${id}`)).toBe(`var(--magma-rhythm-${id}, ${vars.get(`--magma-rhythm-${id}`)})`)
  })
})

describe('widths', () => {
  test('the reading measure, and the column of a form on it', () => {
    expect(vars.get('--magma-width-reading')).toBe('56ch')
    expect(vars.get('--magma-width-form')).toBe('var(--magma-width-reading)')
    expect(theme.get('--container-form')).toBe('var(--magma-width-form, 56ch)')
  })

  test('the frame of a page: 1280px, with the gutter of the bar', () => {
    expect(px(vars.get('--magma-width-page'))).toBe(1280)
    expect(px(vars.get('--magma-width-page-gutter'))).toBe(24)
  })

  test('the window of a dialog is the column of a form plus its inset on both sides', () => {
    expect(vars.get('--magma-width-dialog')).toBe('calc(var(--magma-width-form) + 2 * var(--magma-rhythm-inset))')
  })

  // #1204: max-w-text, the cap of the reset on p, li and figcaption, is the reading measure
  test('the measure of text points at the reading measure, in both sheets', () => {
    expect(vars.get('--spacing-text')).toBe('var(--magma-width-reading, 56ch)')
    expect(theme.get('--spacing-text')).toBe('var(--magma-width-reading, 56ch)')
  })

  test('the Tailwind 3 preset measures text at the same 56ch', () => {
    const props = readFileSync(resolve(DIST, 'js', 'tailwind-props.js'), 'utf8')
    expect([...props.matchAll(/'text': '([^']+)'/g)].map((m) => m[1])).toEqual(['56ch', '56ch'])
  })
})

describe('titles by role', () => {
  const ROLES: Record<string, string> = { page: 'h3', section: 'h5', dialog: 'h5', part: 'h6', group: 'h6' }
  const PARTS = ['', '--font-weight', '--letter-spacing', '--line-height']

  test.each(Object.entries(ROLES))('%s points at %s, in typography.css and in the Tailwind theme', (role, level) => {
    for (const sheet of [vars, theme])
      for (const part of PARTS) {
        const target = `--text-size-title-${level}${part}`
        expect(sheet.has(target), target).toBe(true)
        expect(sheet.get(`--text-size-title-${role}${part}`)).toBe(`var(${target})`)
      }
  })

  test.each(Object.entries(ROLES))('the DTCG style of %s is an alias of %s', (role, level) => {
    const style = at(`typography.title.${role}`)
    expect(style.$value).toBe(`{typography.title.${level}}`)
    expect(style.$description).toMatch(new RegExp(`^titles/${role}: `))
    expect(style.$extensions[NAMESPACE].tier).toBe('semantic')
  })
})

describe('the roles in the DTCG export', () => {
  test.each(Object.keys(RHYTHM))('magma.rhythm.%s is a semantic role, an alias of its size step, named after its rule', (id) => {
    const token = at(`magma.rhythm.${id}`)
    expect(token.$type).toBe('dimension')
    expect(token.$value).toMatch(/^\{size\.\d+\}$/)
    expect(token.$description).toMatch(new RegExp(`^rhythm/${id}: `))
    expect(token.$extensions[NAMESPACE]).toEqual({ css: `--magma-rhythm-${id}`, tier: 'semantic' })
  })

  test('the widths: page and gutter as dimensions, the others with no DTCG type on their group', () => {
    expect(at('magma.width.page').$value).toBe('{size.32000}')
    expect(at('magma.width.page-gutter').$value).toBe('{size.600}')
    const cssOnly = at('magma.width').$extensions[NAMESPACE].cssOnly!
    expect(cssOnly.map(({ css }) => css)).toEqual(['--magma-width-reading', '--magma-width-form', '--magma-width-dialog'])
    for (const { css, value } of cssOnly) expect(vars.get(css)).toBe(value)
  })

  test('the measure of text points at the reading measure, with no DTCG type', () => {
    const text = at('spacing').$extensions[NAMESPACE].cssOnly!.find(({ css }) => css === '--spacing-text')
    expect(text?.value).toBe('var(--magma-width-reading, 56ch)')
  })
})
