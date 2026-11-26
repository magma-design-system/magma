import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { compile } from '@tailwindcss/node'
import { expect, test } from 'vitest'
import { STYLESHEETS } from '../../mcp/src/render.ts'

// The Tailwind layer of Magma in the studio (src/tailwind.css, #1401): the theme of Magma is
// imported as `reference`, so a utility reads the variable of the Magma the page loads
// (build/vendor.ts, the stylesheets of mcp's render), with the value of the theme as the fallback
// of its var(). A name of the theme that the installed sheets do not define is read through that
// fallback, so the fallback must land on a name they define: the theme and the installed sheets
// are the ones of the same build, read here as the files the studio resolves.

const studio = fileURLToPath(new URL('..', import.meta.url))
const entry = path.join(studio, 'src/tailwind.css')
const fromStudio = createRequire(path.join(studio, 'package.json'))

const resolveIn = (from: string, specifier: string): string =>
  specifier.startsWith('.')
    ? path.resolve(path.dirname(from), specifier)
    : createRequire(from).resolve(specifier)

/** The bodies of the `@theme` blocks of a sheet. */
function themeBlocks(css: string): string[] {
  const blocks: string[] = []
  for (let at = css.indexOf('@theme'); at !== -1; at = css.indexOf('@theme', at + 1)) {
    const open = css.indexOf('{', at)
    let depth = 0
    let close = open
    for (; close < css.length; close++) {
      if (css[close] === '{') depth++
      else if (css[close] === '}' && --depth === 0) break
    }
    blocks.push(css.slice(open + 1, close))
    at = close
  }
  return blocks
}

/** The variables of the theme a sheet declares, with the sheets it imports: name to value. */
function themeOf(file: string, theme = new Map<string, string>(), seen = new Set<string>()) {
  if (seen.has(file)) return theme
  seen.add(file)
  const css = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
  for (const [, specifier] of css.matchAll(/@import\s+['"]([^'"]+)['"]/g))
    themeOf(resolveIn(file, specifier), theme, seen)
  for (const block of themeBlocks(css))
    for (const [, name, value] of block.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g))
      theme.set(name, value.trim())
  return theme
}

// the theme of Magma, as the entry imports it for reference
const referenced = [...readFileSync(entry, 'utf8').matchAll(/^@import '([^']+)' reference;$/gm)]
const theme = new Map<string, string>()
for (const [, specifier] of referenced) themeOf(resolveIn(entry, specifier), theme)

/** The custom properties a page of the studio gets from the installed Magma, by sheet. */
const installed = new Map(
  STYLESHEETS.filter(({ module }) => module.startsWith('@maggioli-design-system/')).map(
    ({ module }) => {
      const css = readFileSync(fromStudio.resolve(module), 'utf8')
      return [module, new Set([...css.matchAll(/(--[a-z0-9-]+)\s*:/g)].map(([, name]) => name))]
    },
  ),
)
const runtime = new Set([...installed.values()].flatMap((names) => [...names]))

/** The variables a value reads, in its var(), fallbacks included. */
const readsOf = (value: string): string[] =>
  [...value.matchAll(/var\((--[a-z0-9-]+)/g)].map(([, name]) => name)

/** Whether a name is installed, or every name its value reads falls back on an installed one. */
function landsOnInstalled(name: string, seen = new Set<string>()): boolean {
  if (runtime.has(name)) return true
  const value = theme.get(name)
  if (value === undefined || seen.has(name)) return false
  seen.add(name)
  const reads = readsOf(value)
  return reads.length > 0 && reads.every((read) => landsOnInstalled(read, seen))
}

/**
 * The names of the theme with a value of their own and nothing installed to fall back on, each
 * with the reason it is one: the value of the theme is what the page gets.
 */
const LITERALS: Record<string, string> = {
  // a keyword: max-w-none sets no limit, there is nothing to read
  '--max-width-none': 'none',
  // the threshold of the actions of the design language: a container query reads no var(), so
  // the theme writes the literal; the installed --magma-container-actions holds the same value
  // (role.container of design-tokens)
  '--container-actions': '23.75rem',
}

test('the entry imports the theme of Magma for reference, as the guide names its sheets', () => {
  expect(referenced.map(([, specifier]) => specifier)).toEqual([
    '@maggioli-design-system/styles/dist/tailwind/theme.css',
    '@maggioli-design-system/styles/dist/tailwind/typography.css',
  ])
  expect(theme.size).toBeGreaterThan(0)
  expect(runtime.size).toBeGreaterThan(0)
})

test('a name of the theme the installed Magma does not define falls back on one it defines', () => {
  const onlyTailwind = [...theme.keys()].filter((name) => !runtime.has(name))
  expect(onlyTailwind.length).toBeGreaterThan(0)
  const stranded = onlyTailwind.filter((name) => !landsOnInstalled(name))
  expect(Object.fromEntries(stranded.map((name) => [name, theme.get(name)]))).toEqual(LITERALS)
  // the literal threshold is the value the installed role holds
  const sheet = readFileSync(
    fromStudio.resolve('@maggioli-design-system/styles/dist/css/typography.css'),
    'utf8',
  )
  expect(/--magma-container-actions:\s*([^;]+);/.exec(sheet)?.[1].trim()).toBe(
    LITERALS['--container-actions'],
  )
})

// the container sizes that only Tailwind names (#1057): w-*, min-w-*, max-w-* and basis-* read
// the container of their size, which the installed typography.css defines
test('the sizes of the containers only Tailwind names read a container of the installed typography.css', () => {
  const typography = installed.get('@maggioli-design-system/styles/dist/css/typography.css')!
  const sizes = [...theme].filter(
    ([name]) => /^--(width|min-width|max-width|flex-basis)-/.test(name) && !typography.has(name),
  )
  expect(sizes.length).toBeGreaterThan(0)
  for (const [name, value] of sizes) {
    if (name in LITERALS) continue
    const [container] = readsOf(value)
    expect(container, `${name}: ${value}`).toMatch(/^--container-/)
    expect(typography.has(container), `${name} reads ${container}`).toBe(true)
  }
})

test('a utility reads the installed variable, the value of the theme only as its fallback', async () => {
  const compiler = await compile(readFileSync(entry, 'utf8'), {
    base: path.dirname(entry),
    onDependency: () => {},
  })
  const css = compiler.build([
    'max-w-2xl',
    'bg-surface-raised',
    'text-fg-muted',
    'text-title-h3',
    'gap-between-containers',
    'p-600',
  ])
  // no variable of the theme of Magma is declared: the installed sheets give them
  const declared = [...css.matchAll(/(--[a-z0-9-]+)\s*:/g)].map(([, name]) => name)
  expect(declared.filter((name) => theme.has(name))).toEqual([])
  // each utility reads its name of the theme first, and lands on the installed Magma
  expect(css).toContain('max-width: var(--max-width-2xl, var(--container-2xl))')
  expect(css).toContain('background-color: var(--color-surface-raised, rgb(var(--magma-surface-raised')
  expect(css).toContain('font-size: var(--text-size-title-h3, ')
  expect(css).toContain('padding: calc(var(--spacing, ')
  for (const read of readsOf(css).filter((name) => !name.startsWith('--tw-')))
    expect(theme.has(read) || runtime.has(read) || declared.includes(read), read).toBe(true)
})

// The build (`nx run studio:test` builds first): what Tailwind wrote into the bundle
const dist = path.join(studio, 'dist/assets')
const built = existsSync(dist)
const bundled = built
  ? readdirSync(dist)
      .filter((file) => file.endsWith('.css'))
      .map((file) => readFileSync(path.join(dist, file), 'utf8'))
      .join('\n')
  : ''

/** The classes the rules of a block of CSS select. */
const classesOf = (css: string): Set<string> =>
  new Set([...css.matchAll(/\.((?:\\.|[a-zA-Z0-9_-])+)/g)].map(([, name]) => name.replace(/\\/g, '')))

/** The body of the first `@layer <name> {` block of a sheet. */
function layerBody(css: string, name: string): string {
  const at = css.indexOf(`@layer ${name}{`)
  if (at === -1) return ''
  let depth = 0
  let close = css.indexOf('{', at)
  const open = close
  for (; close < css.length; close++) {
    if (css[close] === '{') depth++
    else if (css[close] === '}' && --depth === 0) break
  }
  return css.slice(open + 1, close)
}

test.skipIf(!built)('the bundle declares no variable of the theme of Magma', () => {
  expect(bundled).not.toBe('')
  const declared = [...bundled.matchAll(/(--[a-z0-9-]+)\s*:/g)].map(([, name]) => name)
  expect(declared.filter((name) => theme.has(name))).toEqual([])
})

// Tailwind makes a utility of every word of the sources that names one (`hidden`, `table`), so a
// class of a sheet of the studio with such a name would get the utility too
test.skipIf(!built)('no class of the sheets of the studio is a utility of the bundle', () => {
  const utilities = classesOf(layerBody(bundled, 'utilities'))
  const sheets = readdirSync(path.join(studio, 'src'), { recursive: true, encoding: 'utf8' })
    .filter((file) => file.endsWith('.css') && file !== 'tailwind.css')
    .map((file) =>
      readFileSync(path.join(studio, 'src', file), 'utf8').replace(/\/\*[\s\S]*?\*\//g, ''),
    )
  const own = new Set(sheets.flatMap((css) => [...css.matchAll(/\.([a-zA-Z_][\w-]*)/g)].map(([, name]) => name)))
  expect(sheets.length).toBeGreaterThan(0)
  expect([...own].filter((name) => utilities.has(name))).toEqual([])
})

// A class reaches the bundle only if Tailwind reads it whole in the sources: written apart in a
// string (`'flex gap-200'`, either branch of a condition), never glued to an expression
// (`gap-200${...}`), which the scanner does not read (#1401: the gap of a cell of Contrast check
// went missing so). Each class a page of features/ writes is a utility of the bundle or a class of
// a sheet of the studio.
test.skipIf(!built)('every class a page of features/ writes is in the bundle or in a sheet', () => {
  const ts = fromStudio('typescript') as typeof import('typescript')
  const features = path.join(studio, 'src/features')
  const pages = readdirSync(features, { recursive: true, encoding: 'utf8' }).filter((file) => file.endsWith('.tsx'))
  const written: string[] = []
  const glued: string[] = []
  /** The texts a class may be: a literal, a template, or either branch of a condition. */
  const collect = (node: import('typescript').Node, at: string): void => {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node))
      written.push(...node.text.split(/\s+/).filter(Boolean))
    else if (ts.isTemplateExpression(node)) {
      const parts = [node.head.text, ...node.templateSpans.map((span) => span.literal.text)]
      parts.forEach((text, index) => {
        if (index < parts.length - 1 && /\S$/.test(text)) glued.push(`${at}: ${text.split(/\s+/).at(-1)}\${...}`)
        if (index > 0 && /^\S/.test(text)) glued.push(`${at}: \${...}${text.split(/\s+/)[0]}`)
        written.push(...text.split(/\s+/).filter(Boolean))
      })
      node.templateSpans.forEach((span) => collect(span.expression, at))
    } else if (ts.isConditionalExpression(node)) {
      collect(node.whenTrue, at)
      collect(node.whenFalse, at)
    } else if (ts.isParenthesizedExpression(node) || ts.isJsxExpression(node)) {
      if (node.expression) collect(node.expression, at)
    }
  }
  for (const page of pages) {
    const source = ts.createSourceFile(page, readFileSync(path.join(features, page), 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
    const visit = (node: import('typescript').Node) => {
      if (ts.isJsxAttribute(node) && node.name.getText() === 'class' && node.initializer)
        collect(node.initializer, `${page}:${source.getLineAndCharacterOfPosition(node.getStart()).line + 1}`)
      ts.forEachChild(node, visit)
    }
    visit(source)
  }
  expect(glued).toEqual([])
  expect(written.length).toBeGreaterThan(0)
  const utilities = classesOf(layerBody(bundled, 'utilities'))
  const sheets = new Set(
    readdirSync(path.join(studio, 'src'), { recursive: true, encoding: 'utf8' })
      .filter((file) => file.endsWith('.css'))
      .flatMap((file) => [...readFileSync(path.join(studio, 'src', file), 'utf8').matchAll(/\.([a-zA-Z_][\w-]*)/g)].map(([, name]) => name)),
  )
  expect([...new Set(written)].filter((name) => !utilities.has(name) && !sheets.has(name))).toEqual([])
})
