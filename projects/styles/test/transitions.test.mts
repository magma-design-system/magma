// The transition utilities as Tailwind compiles them with the Magma entry point. Tailwind 4
// moves an element with the individual `translate`, `scale` and `rotate` properties, not with
// `transform`: a transition list that names only `transform` lets `hover:-translate-y-100`
// jump instead of animate (#791). Needs a build first (nx: test dependsOn build).
import { readFileSync } from 'fs'
import { createRequire } from 'module'
import { dirname, join, resolve } from 'path'
import postcss from 'postcss'
import { __unstable__loadDesignSystem } from 'tailwindcss'
import { beforeAll, expect, test } from 'vitest'

const PROJECT = resolve(__dirname, '..')
const DIST = resolve(PROJECT, 'dist')
const require = createRequire(join(PROJECT, 'package.json'))
const resolveId = (id: string, base: string) =>
  id.startsWith('.') ? resolve(base, id) : require.resolve(id, { paths: [base] })

const { entry } = JSON.parse(readFileSync(join(DIST, 'tailwind', 'consumption.json'), 'utf8')) as { entry: string[] }

let ds: Awaited<ReturnType<typeof __unstable__loadDesignSystem>>

beforeAll(async () => {
  ds = await __unstable__loadDesignSystem(entry.join('\n'), {
    base: PROJECT,
    async loadStylesheet (id: string, base: string) {
      const file = resolveId(id === 'tailwindcss' ? 'tailwindcss/index.css' : id, base)
      return { path: file, base: dirname(file), content: readFileSync(file, 'utf8') }
    },
  })
})

const list = (value: string) => value.split(',').map((property) => property.trim())

/** The transition-property a utility compiles to, as a list. */
const transitionProperty = (utility: string): string[] => {
  const [css] = ds.candidatesToCss([utility])
  if (!css) throw new Error(`${utility} compiles to nothing`)
  let value = ''
  postcss.parse(css).walkDecls('transition-property', (decl) => { value = decl.value })
  return list(value)
}

test('transition-cosmetic animates every property Tailwind moves an element with', () => {
  const transform = transitionProperty('transition-transform')
  // what Tailwind 4 writes for translate-*, scale-* and rotate-*, besides transform-*
  expect(transform).toEqual(expect.arrayContaining(['transform', 'translate', 'scale', 'rotate']))
  expect(transitionProperty('transition-cosmetic')).toEqual(expect.arrayContaining(transform))
})

test('--transition-property-cosmetic is the list the utility compiles to', () => {
  let value = ''
  postcss.parse(readFileSync(join(DIST, 'css', 'transitions.css'), 'utf8'))
    .walkDecls('--transition-property-cosmetic', (decl) => { value = decl.value })
  expect(list(value)).toEqual(transitionProperty('transition-cosmetic'))
})
