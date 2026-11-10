// typography.css, the plain-CSS twin of tailwind-theme-typography.css (#513): the same tokens,
// through the source, transforms and filter of the css platform of tailwind4.json, in one
// :root {} with no Tailwind at-rule, so a page with no Tailwind build reads them. The two
// templates (src/formats/css-vars-typography, src/formats/css-tailwind-theme-typography) decide
// where the sheets differ, and only there: typography.css declares the roles of the design
// language (#1189), the Tailwind theme bridges them onto its own namespaces and adds what only
// its utilities read. The contract is in SPEC.md, "The two typography sheets". Needs a build
// first (nx: test dependsOn build).
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { describe, expect, test } from 'vitest'

const ROOT = resolve(__dirname, '..')
const read = (file: string): string => readFileSync(resolve(ROOT, 'dist', 'css', file), 'utf8')
const withoutComments = (css: string): string => css.replace(/\/\*[\s\S]*?\*\//g, '')

/** `--name: value` of the first block of `css` whose selector starts with `selector`. */
const block = (css: string, selector: string): Map<string, string> => {
  const start = css.indexOf(selector)
  if (start < 0) throw new Error(`${selector} not found`)
  const body = css.slice(css.indexOf('{', start) + 1, css.indexOf('}', start))
  return new Map([...body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]))
}

const sheet = read('typography.css')
const vars = block(sheet, ':root {')
const theme = block(read('tailwind-theme-typography.css'), '@theme {')

/** The name and the fallback of the `var()` that is the whole of `value`. */
const asVar = (value: string): { name: string, fallback?: string } | undefined => {
  const match = /^var\(\s*(--[\w-]+)\s*(?:,\s*(.*))?\)$/s.exec(value)
  if (!match) return undefined
  const fallback = match[2]?.trim()
  // var(--a, 1px) + var(--b) is no single var(): its fallback would close a paren it never opened
  let depth = 0
  for (const char of fallback ?? '') {
    depth += char === '(' ? 1 : char === ')' ? -1 : 0
    if (depth < 0) return undefined
  }
  return { name: match[1], fallback }
}

/** `value` with each var() replaced by what `sheet` gives its name, else by its fallback. */
const resolveIn = (sheet: Map<string, string>, value: string, seen: string[] = []): string => {
  const start = value.indexOf('var(')
  if (start < 0) return value
  let depth = 0
  let end = start + 3
  do depth += value[end] === '(' ? 1 : value[end] === ')' ? -1 : 0
  while (depth > 0 && ++end < value.length)
  const { name, fallback } = asVar(value.slice(start, end + 1))!
  if (seen.includes(name)) throw new Error(`var() loop: ${[...seen, name].join(' -> ')}`)
  const declared = sheet.get(name) ?? fallback
  if (declared === undefined) throw new Error(`${name} is not declared and has no fallback`)
  const replaced = resolveIn(sheet, declared, [...seen, name])
  return resolveIn(sheet, value.slice(0, start) + replaced + value.slice(end + 1), seen)
}

/** The named steps of the spacing group, from the token source both sheets read. */
const SPACING_STEPS = Object.keys(
  (JSON.parse(readFileSync(resolve(ROOT, 'tokens', 'sizing', 'spacing.json'), 'utf8')) as { spacing: object }).spacing,
)

describe('typography.css', () => {
  test('is one :root block with no Tailwind at-rule', () => {
    const rules = withoutComments(sheet).trim()
    expect(rules).toMatch(/^:root \{[^{}]*\}$/)
    expect(rules).not.toMatch(/@|--theme\(/)
  })

  test('declares what the Tailwind theme declares, with the same value', () => {
    // the one difference a shared name may carry: the theme writes the literal of the
    // property a var() points at as its fallback, which a sheet that only references the
    // theme (the components, @reference) needs (#1200: the titles by role)
    const differ = [...vars].filter(([name, value]) => {
      const themed = theme.get(name)
      if (themed === undefined || themed === value) return false
      const target = asVar(value)
      return !(target && target.fallback === undefined && themed === `var(${target.name}, ${theme.get(target.name)})`)
    })
    expect(differ).toEqual([])
  })

  test('leaves out only what Tailwind alone reads', () => {
    const own = [...theme].filter(([name]) => !vars.has(name))
    for (const [name, value] of own) {
      // the size namespaces of Tailwind (w-*, min-w-*, max-w-*, basis-*): they point at a
      // container size typography.css declares, or say none (#1057)
      if (/^--(width|min-width|max-width|flex-basis)-/.test(name)) {
        if (value !== 'none') expect(vars.has(asVar(value)?.name ?? ''), `${name}: ${value}`).toBe(true)
        continue
      }
      // a bridge onto a role: var(--magma-*, the value the role resolves to)
      const bridge = asVar(value)
      if (bridge?.name.startsWith('--magma-')) {
        expect(vars.has(bridge.name), `${name}: ${value}`).toBe(true)
        expect(bridge.fallback, name).toBe(resolveIn(vars, vars.get(bridge.name)!))
        continue
      }
      // the literal of a role, where Tailwind reads no var() (a container query): --container-actions
      expect(vars.get(`--magma-${name.slice(2)}`), `${name}: ${value}`).toBe(value)
    }
  })

  test('adds only the roles of the design language and the named steps of spacing', () => {
    // the roles are declared here and bridged by the theme (#1189); a named step of spacing is
    // a CSS variable here, which the theme may leave out, since its spacing utilities take a
    // numeric step and a t-shirt name is a container size there (#1061)
    const step = new RegExp(`^--spacing-(${SPACING_STEPS.join('|')})$`)
    const own = [...vars.keys()].filter((name) => !theme.has(name))
    expect(own.filter((name) => !name.startsWith('--magma-') && !step.test(name))).toEqual([])
  })
})
