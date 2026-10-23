// The `dark:` variant as Tailwind compiles it with the Magma entry point (#1100). Without a
// variant of its own Tailwind compiles `dark:` on `@media (prefers-color-scheme: dark)`, the OS
// alone, so a page in pref-mode-dark on a light OS never got its rules. The variant has to turn
// dark exactly where the palette does: on the selectors of the shipped colors-rgb.css. Whether
// a browser applies it under each mode is checked in stencil (src/test/dark-variant.e2e.ts).
// Needs a build first (nx: test dependsOn build).
import { readFileSync } from 'fs'
import { createRequire } from 'module'
import { dirname, join, resolve } from 'path'
import postcss, { type AtRule, type Rule } from 'postcss'
import { __unstable__loadDesignSystem } from 'tailwindcss'
import { beforeAll, describe, expect, test } from 'vitest'

const PROJECT = resolve(__dirname, '..')
const DIST = resolve(PROJECT, 'dist')
const require = createRequire(join(PROJECT, 'package.json'))
const resolveId = (id: string, base: string) =>
  id.startsWith('.') ? resolve(base, id) : require.resolve(id, { paths: [base] })

const { entry } = JSON.parse(readFileSync(join(DIST, 'tailwind', 'consumption.json'), 'utf8')) as { entry: string[] }

const MEDIA = '(prefers-color-scheme: dark)'
const inMedia = (rule: Rule): boolean =>
  rule.parent?.type === 'atrule' && (rule.parent as AtRule).params === MEDIA
const selectorList = (selector: string): string[] => selector.split(',').map((s) => s.trim())

// the palette: the first block after the light :root, and the one in the dark media query
const palette = postcss.parse(readFileSync(join(DIST, 'css', 'colors-rgb.css'), 'utf8'))
const paletteRules: Rule[] = []
palette.walkRules((rule) => {
  paletteRules.push(rule)
})
const paletteForced = paletteRules.find((rule) => rule.selector !== ':root' && !inMedia(rule))
const paletteSystem = paletteRules.find(inMedia)

let compiled: Rule[]

beforeAll(async () => {
  const ds = await __unstable__loadDesignSystem(entry.join('\n'), {
    base: PROJECT,
    async loadStylesheet (id: string, base: string) {
      const file = resolveId(id === 'tailwindcss' ? 'tailwindcss/index.css' : id, base)
      return { path: file, base: dirname(file), content: readFileSync(file, 'utf8') }
    },
  })
  const [css] = ds.candidatesToCss(['dark:bg-surface-raised'])
  compiled = []
  postcss.parse(css ?? '').walkRules((rule) => {
    compiled.push(rule)
  })
})

/** The selector of a `dark:bg-surface-raised` rule that turns dark on `selectors`, each root and what is under it. */
const darkOn = (selectors: string[]): string =>
  `.dark\\:bg-surface-raised:where(${selectors.flatMap((s) => [s, `${s} *`]).join(', ')})`

describe('the dark: variant', () => {
  test('the palette turns dark on a forced block and a system block', () => {
    expect(selectorList(paletteForced!.selector)).toEqual([
      ':root:not(.pref-theme-scheme-light).pref-mode-dark',
      ':root.pref-theme-scheme-dark',
    ])
    expect(selectorList(paletteSystem!.selector)).toEqual([
      ':root:not(.pref-theme-scheme-light).pref-mode-system',
      ':root:not([data-magma-pref])',
    ])
  })

  test('compiles on two rules, never on the OS alone', () => {
    expect(compiled).toHaveLength(2)
    expect(compiled.map((rule) => rule.selector)).not.toContain('.dark\\:bg-surface-raised')
  })

  test('turns dark where the palette is forced dark, whatever the OS', () => {
    const forced = compiled.find((rule) => !inMedia(rule))

    expect(forced?.parent?.type).toBe('root')
    expect(forced?.selector).toBe(darkOn(selectorList(paletteForced!.selector)))
  })

  test('turns dark where the palette follows a dark OS', () => {
    const system = compiled.find(inMedia)

    expect(system?.selector).toBe(darkOn(selectorList(paletteSystem!.selector)))
  })

  test('keeps the weight of a plain utility', () => {
    for (const rule of compiled) expect(rule.selector).toMatch(/^\.dark\\:bg-surface-raised:where\(.*\)$/)
  })
})
