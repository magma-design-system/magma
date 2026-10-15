// The Tailwind consumption map (dist/tailwind/consumption.json, #875) against Tailwind
// and the stylesheets of the same build: every @theme variable of the Magma theme and
// every @utility is in it, every token it names is a token of dist/dtcg, and what it
// says a class or variant reads is what Tailwind compiles. The generator learns that
// from Tailwind's theme lookups; this test reads the compiled CSS instead. Needs a
// build first (nx: test dependsOn build).
import { readFileSync, readdirSync } from 'fs'
import { createRequire } from 'module'
import { dirname, join, resolve } from 'path'
import postcss from 'postcss'
import { __unstable__loadDesignSystem } from 'tailwindcss'
import { beforeAll, describe, expect, test } from 'vitest'

import { publishedTokens } from '../scripts/dtcg/globals'

const PROJECT = resolve(__dirname, '..')
const DIST = resolve(PROJECT, 'dist')
const TAILWIND = resolve(DIST, 'tailwind')
const require = createRequire(join(PROJECT, 'package.json'))
const TAILWIND_PACKAGE = dirname(require.resolve('tailwindcss/package.json'))

type Entry = { theme: string, description?: string, namespace: string | null, key?: string | null, property?: string, shadowed?: Record<string, string | null> }
type Utility = { source: string | string[], apply?: string[], tokens: string[], theme: string[], css: string }
type ConsumptionMap = {
  tailwind: string
  entry: string[]
  tokens: Record<string, Entry>
  namespaces: Record<string, { utilities: string[], variants: string[] }>
  spacing: { multiplier: string, value: string, utilities: string[], keys: string[], steps: string[] }
  utilities: Record<string, Utility>
}

const map = JSON.parse(readFileSync(join(TAILWIND, 'consumption.json'), 'utf8')) as ConsumptionMap

const resolveId = (id: string, base: string) =>
  id.startsWith('.') ? resolve(base, id) : require.resolve(id, { paths: [base] })

/** A Magma stylesheet and every Magma stylesheet it imports or references. */
const closure = (file: string, seen = new Set<string>()): postcss.Root[] => {
  if (seen.has(file) || file.startsWith(TAILWIND_PACKAGE)) return []
  seen.add(file)
  const root = postcss.parse(readFileSync(file, 'utf8'), { from: file })
  const nested: string[] = []
  root.walkAtRules(/^(import|reference)$/, (rule) => {
    const id = /^['"]([^'"]+)['"]/.exec(rule.params)?.[1]
    if (id) nested.push(resolveId(id, dirname(file)))
  })
  return [root, ...nested.flatMap((next) => closure(next, seen))]
}

const themeVariables = new Map<string, string>()
for (const root of closure(join(TAILWIND, 'theme.css')))
  root.walkAtRules('theme', (rule) => rule.walkDecls(/^--/, (decl) => {
    themeVariables.set(decl.prop, decl.value.replace(/\s+/g, ' ').trim())
  }))

const dtcgTokens = new Map([
  ...publishedTokens(JSON.parse(readFileSync(resolve(PROJECT, '../design-tokens/dist/dtcg/base.tokens.json'), 'utf8'))),
  ...publishedTokens(JSON.parse(readFileSync(join(DIST, 'dtcg', 'globals.tokens.json'), 'utf8'))),
])
const dtcgNames = new Set(dtcgTokens.keys())

let ds: Awaited<ReturnType<typeof __unstable__loadDesignSystem>>
const compile = (classes: string[]) => ds.candidatesToCss(classes)

beforeAll(async () => {
  // the entry point the map says it was generated from
  ds = await __unstable__loadDesignSystem(map.entry.join('\n'), {
    base: PROJECT,
    async loadStylesheet (id: string, base: string) {
      const file = resolveId(id === 'tailwindcss' ? 'tailwindcss/index.css' : id, base)
      return { path: file, base: dirname(file), content: readFileSync(file, 'utf8') }
    },
  })
})

describe('coverage', () => {
  test('every @theme variable reachable from tailwind/theme.css is in the map, linked to a dtcg token', () => {
    expect(themeVariables.size).toBeGreaterThan(500)
    const byTheme = new Map(Object.entries(map.tokens).map(([token, { theme }]) => [theme, token]))
    expect([...themeVariables.keys()].filter((name) => !byTheme.has(name))).toEqual([])
    expect(byTheme.size).toBe(themeVariables.size)
    expect(Object.keys(map.tokens).filter((token) => !dtcgNames.has(token))).toEqual([])
    // the token is the variable itself, or the custom property its value wraps
    for (const [theme, token] of byTheme)
      if (theme !== token) expect(themeVariables.get(theme), theme).toContain(`var(${token}`)
  })

  test('every @utility of dist/tailwind/*.css, and of what they import, is listed with its CSS', () => {
    const defined = new Set<string>()
    const seen = new Set<string>()
    for (const sheet of readdirSync(TAILWIND).filter((file) => file.endsWith('.css')))
      for (const root of closure(join(TAILWIND, sheet), seen))
        root.walkAtRules('utility', (rule) => { defined.add(rule.params.trim()) })
    expect(defined.size).toBeGreaterThan(20)
    expect(Object.keys(map.utilities).sort()).toEqual([...defined].sort())
    for (const [name, utility] of Object.entries(map.utilities)) {
      expect(utility.css, name).toContain(`.${name} {`)
      expect(utility.tokens.filter((token) => !dtcgNames.has(token)), name).toEqual([])
    }
  })

  test('a typography utility names its family, size and line height', () => {
    const { tokens, apply, theme } = map.utilities['text-title-h1']
    expect(apply).toContain('text-size-title-h1')
    expect(tokens).toEqual(expect.arrayContaining(['--font-title', '--text-size-title-h1', '--text-size-title-h1--line-height']))
    expect(theme).toContain('--font-weight-black')
  })

  test('a token carries the $description of its dtcg token, every semantic role has one (#876)', () => {
    const wrong = Object.entries(map.tokens).filter(
      ([token, { description }]) => description !== dtcgTokens.get(token)?.$description,
    )
    expect(wrong.map(([token]) => token)).toEqual([])
    expect(map.tokens['--magma-surface-default'].description).toBe('The page canvas, the background of the body.')
    const roles = Object.entries(map.tokens).filter(([token]) => /^--magma-(?!tint-)/.test(token))
    expect(roles.length).toBeGreaterThan(100)
    expect(roles.filter(([, { description }]) => !description).map(([token]) => token)).toEqual([])
  })
})

describe('what Tailwind compiles', () => {
  // the shadow utilities inline the value (to recolor it), so their CSS holds no var()
  const INLINED = new Set(['--shadow'])
  const keyed = Object.values(map.tokens).filter((entry) => entry.namespace && entry.key && !entry.property)

  test('the namespace of a token gives its utilities, except where the map says another variable wins', () => {
    expect(keyed.length).toBeGreaterThan(600)
    for (const { theme, namespace, key, shadowed = {} } of keyed) {
      const roots = map.namespaces[namespace!].utilities
      const css = compile(roots.map((root) => `${root}-${key}`))
      roots.forEach((root, index) => {
        const label = `${root}-${key} (${theme})`
        const out = css[index]
        if (root in shadowed) {
          if (out) expect(out, label).not.toContain(`var(${theme})`)
          // the variable that wins, read through var() or inlined (`max-w-prose` is 65ch)
          const winner = shadowed[root]
          if (winner) expect([`var(${winner})`, ds.resolveThemeValue(winner, true)].some((form) => out?.includes(form!)), label).toBe(true)
          return
        }
        expect(out, label).not.toBeNull()
        if (!INLINED.has(namespace!)) expect(out, label).toContain(`var(${theme})`)
      })
    }
  })

  test('the variants of a namespace hold the value of the token', () => {
    for (const { theme, namespace, key, shadowed = {} } of keyed)
      for (const pattern of map.namespaces[namespace!].variants) {
        if (pattern in shadowed) continue
        const [out] = compile([`${pattern.replace('*', key!)}:flex`])
        expect(out, `${pattern} (${theme})`).toContain(themeVariables.get(theme)!)
      }
  })

  // compiles every class Tailwind knows (thousands): over 5s on the CI runners,
  // past the default timeout, so it gets its own
  test('a variable with no namespace is read by no class', () => {
    const orphans = Object.values(map.tokens).filter((entry) => !entry.namespace).map(({ theme }) => theme)
    const all = compile(ds.getClassList().map(([name]) => name)).filter(Boolean).join('\n')
    for (const theme of orphans) expect(all, theme).not.toContain(`var(${theme})`)
  }, 30_000)

  test('spacing: the multiplier and the roots that take a numeric step', () => {
    expect(map.spacing.multiplier).toBe('--spacing')
    expect(map.spacing.value).toBe(themeVariables.get('--spacing'))
    const css = compile(map.spacing.utilities.map((root) => `${root}-400`))
    map.spacing.utilities.forEach((root, index) =>
      expect(css[index], `${root}-400`).toMatch(/var\(--spacing\) \* -?400\b/))
    const keys = keyed.filter(({ namespace }) => namespace === '--spacing').map(({ key }) => key)
    expect([...map.spacing.keys, ...map.spacing.steps].sort()).toEqual(keys.sort())
  })

  // the facts the README states
  test('text roles are fg-, containers lose to spacing, breakpoints are variants', () => {
    expect(map.tokens['--magma-text-muted']).toMatchObject({ theme: '--color-fg-muted', namespace: '--color', key: 'fg-muted' })
    expect(map.namespaces['--color'].utilities).toEqual(expect.arrayContaining(['bg', 'border', 'text']))
    expect(map.tokens['--container-xs'].shadowed).toMatchObject({ 'max-w': '--spacing-xs', w: '--spacing-xs' })
    expect(map.tokens['--container-5xl'].shadowed).toBeUndefined()
    expect(map.namespaces['--breakpoint']).toMatchObject({ utilities: [], variants: expect.arrayContaining(['*', 'max-*']) })
    expect(map.tokens['--border-xs'].namespace).toBeNull()
    expect(map.tokens['--duration-200'].namespace).toBeNull()
  })
})
