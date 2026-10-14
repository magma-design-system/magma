// The DTCG globals of this package (dist/dtcg, #875) against the stylesheets of the same
// build: every global of tokens.editor.css is in the JSON, the JSON is valid DTCG
// 2025.10 next to design-tokens' sets, and merging the sets the way the resolver says
// gives the values the CSS gives for each corner shape and depth. Needs a build first
// (nx: test dependsOn build).
import { readFileSync } from 'fs'
import { dirname, resolve } from 'path'
import postcss from 'postcss'
import { describe, expect, test } from 'vitest'

import { NAMESPACE } from '../../design-tokens/scripts/dtcg/sets'
import {
  colorChannels,
  dimension,
  shadow,
  type DtcgColor,
  type DtcgDimension,
  type DtcgDuration,
  type DtcgShadowLayer,
} from '../../design-tokens/scripts/dtcg/values'

const DIST = resolve(__dirname, '../dist')
const DTCG = resolve(DIST, 'dtcg')

type Node = Record<string, unknown>
type Token = { $type: string, $value: unknown, $extensions?: Record<string, { css?: string, cssValue?: string, tier?: string }> }
type Sources = Array<{ $ref: string }>
type Resolver = {
  version: string
  sets: Record<string, { sources: Sources }>
  modifiers: Record<string, { default: string, contexts: Record<string, Sources> }>
  resolutionOrder: Sources
}

const readJson = (file: string): Node => JSON.parse(readFileSync(resolve(DTCG, file), 'utf8'))
const isToken = (node: unknown): node is Token =>
  typeof node === 'object' && node !== null && '$value' in node

const walk = (tree: Node, path: string[] = []): Array<[string[], Token]> =>
  Object.entries(tree).flatMap(([key, node]) => {
    if (key.startsWith('$') && key !== '$root') return []
    if (isToken(node)) return [[[...path, key], node] as [string[], Token]]
    return typeof node === 'object' && node !== null ? walk(node as Node, [...path, key]) : []
  })

const cssOnly = (tree: Node): Array<{ css: string, value: string }> =>
  Object.entries(tree).flatMap(([key, node]) => {
    if (key === '$extensions')
      return ((node as Node)[NAMESPACE] as { cssOnly?: Array<{ css: string, value: string }> })?.cssOnly ?? []
    if (key.startsWith('$') || isToken(node) || typeof node !== 'object' || node === null) return []
    return cssOnly(node as Node)
  })

const mergeSets = (into: Node, from: Node): Node => {
  for (const [key, node] of Object.entries(from)) {
    const current = into[key]
    into[key] =
      !isToken(node) && typeof node === 'object' && node && typeof current === 'object' && current && !isToken(current)
        ? mergeSets(current as Node, node as Node)
        : node
  }
  return into
}

const resolver = readJson('magma.resolver.json') as unknown as Resolver

/** Merge the sets of one context per modifier, in the resolver's order. */
const scenario = (inputs: Record<string, string>): Node => {
  const files = resolver.resolutionOrder.flatMap(({ $ref }) => {
    const [, kind, name] = $ref.split('/')
    return kind === 'sets'
      ? resolver.sets[name].sources
      : resolver.modifiers[name].contexts[inputs[name] ?? resolver.modifiers[name].default]
  })
  const tree: Node = {}
  for (const { $ref } of files) mergeSets(tree, readJson($ref))
  return tree
}

const lookup = (tree: Node, path: string): Token => {
  const node = path.split('.').reduce<unknown>((at, key) => (at as Node)?.[key], tree)
  if (!isToken(node)) throw new Error(`{${path}} is no token`)
  return node
}

const resolveValue = (tree: Node, value: unknown, seen: string[] = []): unknown => {
  if (typeof value === 'string' && /^\{.+\}$/.test(value)) {
    const path = value.slice(1, -1)
    if (seen.includes(path)) throw new Error(`Alias loop: ${[...seen, path].join(' -> ')}`)
    return resolveValue(tree, lookup(tree, path).$value, [...seen, path])
  }
  if (Array.isArray(value)) return value.map((item) => resolveValue(tree, item, seen))
  if (typeof value === 'object' && value !== null)
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, resolveValue(tree, item, seen)]))
  return value
}

const ext = (token: Token) => token.$extensions?.[NAMESPACE] ?? {}

/** The custom properties of a stylesheet: registrations, then each top-level block by selector. */
const stylesheet = (file: string) => {
  const root = postcss.parse(readFileSync(resolve(DIST, 'css', file), 'utf8'))
  const initial = new Map<string, string>()
  const blocks = new Map<string, Map<string, string>>()
  for (const node of root.nodes) {
    if (node.type === 'atrule' && node.name === 'property')
      node.walkDecls('initial-value', (decl) => { initial.set(node.params.trim(), decl.value) })
    if (node.type === 'rule') {
      const block = blocks.get(node.selector) ?? new Map<string, string>()
      node.each((child) => { if (child.type === 'decl' && child.prop.startsWith('--')) block.set(child.prop, child.value.replace(/\s+/g, ' ').trim()) })
      blocks.set(node.selector, block)
    }
  }
  return { initial, blocks }
}

// the published globals.css carries the component registrations (properties.css), which
// are component tokens, not globals: only the names of the source globals.css count
const sourceGlobals = postcss.parse(readFileSync(resolve(__dirname, '../css/globals.css'), 'utf8'))
const ownNames = new Set<string>()
sourceGlobals.walkAtRules('property', (rule) => { ownNames.add(rule.params.trim()) })
sourceGlobals.walkDecls(/^--/, (decl) => { ownNames.add(decl.prop) })

const globalsCss = stylesheet('globals.css')
const themeCss = stylesheet('theme.css')
const rootValues = new Map<string, string>([
  ...[...globalsCss.initial].filter(([name]) => ownNames.has(name)),
  ...themeCss.initial,
  ...(globalsCss.blocks.get(':root') ?? []),
  ...(themeCss.blocks.get(':root') ?? []),
])

const globals = readJson('globals.tokens.json')
const tokensBase = JSON.parse(readFileSync(resolve(DIST, '../../design-tokens/dist/dtcg/base.tokens.json'), 'utf8')) as Node

describe('coverage', () => {
  test('every token of the globals groups of tokens.editor.css is in globals.tokens.json', () => {
    const editor = readFileSync(resolve(DIST, 'css', 'tokens.editor.css'), 'utf8')
    const names: string[] = []
    let inGlobals = false
    for (const line of editor.split('\n')) {
      const heading = /^\s*\/\* (.+) \*\/$/.exec(line)
      if (heading) inGlobals = heading[1].startsWith('globals')
      const decl = /^\s*(--[\w-]+):/.exec(line)
      if (inGlobals && decl) names.push(decl[1])
    }
    expect(names.length).toBeGreaterThan(50)
    const inJson = new Set([...walk(globals).map(([, token]) => ext(token).css), ...cssOnly(globals).map(({ css }) => css)])
    expect(names.filter((name) => !inJson.has(name))).toEqual([])
  })

  test('every global of the stylesheets is in the JSON, and only once', () => {
    const inJson = [...walk(globals).map(([, token]) => ext(token).css!), ...cssOnly(globals).map(({ css }) => css)]
    expect(new Set(inJson).size).toBe(inJson.length)
    expect([...rootValues.keys()].filter((name) => !inJson.includes(name))).toEqual([])
    expect(inJson.filter((name) => !rootValues.has(name))).toEqual([])
  })

  test('no global lands on a design-tokens path', () => {
    const taken = new Set(walk(tokensBase).map(([path]) => path.join('.')))
    for (const [path] of walk(globals)) {
      for (let depth = 1; depth <= path.length; depth++)
        expect(taken.has(path.slice(0, depth).join('.')), path.join('.')).toBe(false)
    }
  })
})

describe('DTCG 2025.10', () => {
  const files = Object.values(resolver.modifiers).flatMap(({ contexts }) => Object.values(contexts).flat())
    .map(({ $ref }) => $ref)
    .filter((ref) => !ref.startsWith('..'))
  const isDimension = (value: unknown) =>
    typeof (value as DtcgDimension)?.value === 'number' && ['px', 'rem'].includes((value as DtcgDimension).unit)
  const isColor = (value: unknown) => {
    const color = value as DtcgColor
    return color?.colorSpace === 'srgb' && color.components.length === 3 &&
      color.components.every((c) => c >= 0 && c <= 1) && /^#[0-9a-f]{6}$/.test(color.hex) &&
      (color.alpha === undefined || (color.alpha >= 0 && color.alpha <= 1))
  }
  const SHAPES: Record<string, (value: unknown) => boolean> = {
    color: isColor,
    dimension: isDimension,
    number: (value) => typeof value === 'number' && Number.isFinite(value),
    duration: (value) => typeof (value as DtcgDuration)?.value === 'number' && ['ms', 's'].includes((value as DtcgDuration).unit),
    border: (value) => {
      const border = value as { color: unknown, width: unknown, style: unknown }
      return isColor(border.color) && isDimension(border.width) &&
        ['solid', 'dashed', 'dotted', 'double', 'groove', 'ridge', 'outset', 'inset'].includes(border.style as string)
    },
    shadow: (value) => ([value].flat() as DtcgShadowLayer[]).every((layer) =>
      isColor(layer.color) && [layer.offsetX, layer.offsetY, layer.blur, layer.spread].every(isDimension)),
  }

  test.each(['globals.tokens.json', ...files])('%s: names, types and value shapes', (file) => {
    const tree = readJson(file)
    const merged = mergeSets(mergeSets(JSON.parse(JSON.stringify(tokensBase)), globals), tree)
    for (const [path, token] of walk(tree)) {
      for (const key of path) expect(key, path.join('.')).not.toMatch(/[.{}]|^\$(?!root$)/)
      expect(Object.keys(SHAPES), path.join('.')).toContain(token.$type)
      expect(ext(token).tier, path.join('.')).toBe('semantic')
      const value = resolveValue(merged, token.$value)
      expect(SHAPES[token.$type](value), `${path.join('.')} ${JSON.stringify(value)}`).toBe(true)
      if (typeof token.$value === 'string')
        expect(lookup(merged, token.$value.slice(1, -1)).$type, path.join('.')).toBe(token.$type)
    }
  })

  test('the resolver names existing files and a default context for each modifier', () => {
    expect(resolver.version).toBe('2025.10')
    const refs = [
      ...Object.values(resolver.sets).flatMap(({ sources }) => sources),
      ...Object.values(resolver.modifiers).flatMap(({ contexts }) => Object.values(contexts).flat()),
    ]
    for (const { $ref } of refs) expect(() => readFileSync(resolve(DTCG, $ref)), $ref).not.toThrow()
    for (const [name, modifier] of Object.entries(resolver.modifiers))
      expect(Object.keys(modifier.contexts), name).toContain(modifier.default)
    // design-tokens' own resolver, then the globals, then the axes of this package
    const tokens = JSON.parse(readFileSync(resolve(DTCG, dirname(resolver.sets.base.sources[0].$ref), 'magma.resolver.json'), 'utf8')) as Resolver
    expect(Object.keys(resolver.modifiers)).toEqual([...Object.keys(tokens.modifiers), 'corner-shape', 'theme-depth'])
    expect(resolver.resolutionOrder.map(({ $ref }) => $ref)).toEqual([
      '#/sets/base', '#/sets/globals', '#/modifiers/mode', '#/modifiers/theme',
      '#/modifiers/corner-shape', '#/modifiers/theme-depth',
    ])
  })
})

describe('values match the stylesheets', () => {
  const ATTRIBUTE = { 'corner-shape': ['squircle', 'round'], 'theme-depth': ['default', 'flat'] }
  const blockOf = (modifier: string, context: string) => {
    const sheet = modifier === 'corner-shape' ? globalsCss : themeCss
    const selector = [...sheet.blocks.keys()].find((key) => key.endsWith(`[data-${modifier}='${context}']`))
    return selector ? sheet.blocks.get(selector)! : new Map<string, string>()
  }
  const scenarios = ATTRIBUTE['corner-shape'].flatMap((corner) =>
    ATTRIBUTE['theme-depth'].map((depth) => ({ corner, depth })))

  /** The globals as the CSS cascades them under one corner shape and depth. */
  const cssValues = (corner: string, depth: string) => new Map([
    ...rootValues,
    ...blockOf('corner-shape', corner),
    ...blockOf('theme-depth', depth),
  ])

  test.each(scenarios)('corner $corner, depth $depth', ({ corner, depth }) => {
    const tree = scenario({ 'corner-shape': corner, 'theme-depth': depth })
    const css = cssValues(corner, depth)
    const paletteChannels = (name: string) => {
      const palette = walk(tree).find(([, token]) => ext(token).css === name)!
      return colorChannels(resolveValue(tree, palette[1].$value) as DtcgColor).join(' ')
    }
    const channelsOf = (value: string): string => {
      const own = /^var\((--[\w-]+)\)$/.exec(value)
      return own ? channelsOf(css.get(own[1])!) : value
    }

    for (const [path, token] of walk(globals)) {
      const name = ext(token).css!
      const current = lookup(tree, path.join('.'))
      const value = css.get(name)!
      const alias = /^(?:rgb\()?var\((--[\w-]+)[^)]*\)\)?$/.exec(value)
      if (alias) {
        // the JSON names the same token the CSS does
        expect(typeof current.$value, `${name}: ${value}`).toBe('string')
        expect(ext(lookup(tree, (current.$value as string).slice(1, -1))).css, name).toBe(alias[1])
        continue
      }
      const resolved = resolveValue(tree, current.$value)
      switch (current.$type) {
        case 'number':
          expect(String(resolved), name).toBe(value)
          break
        case 'dimension':
        case 'duration': {
          const { value: number, unit } = resolved as DtcgDimension
          expect(`${number}${unit}`, name).toBe(value)
          break
        }
        case 'color': {
          const color = resolved as DtcgColor
          // `rgb(var(--a) / var(--b))`, `transparent` or the `r g b` a color is published as
          const derived = /^rgb\(var\((--[\w-]+)\) \/ var\((--[\w-]+)\)\)$/.exec(value)
          if (derived) {
            expect(colorChannels(color).join(' '), name).toBe(channelsOf(css.get(derived[1])!))
            expect(color.alpha, name).toBe(Number(css.get(derived[2])))
            expect(ext(current).cssValue, name).toBe(value)
          } else if (value === 'transparent') expect(color.alpha, name).toBe(0)
          else expect(colorChannels(color).join(' '), name).toBe(value)
          break
        }
        case 'border': {
          const [width, style, ref] = value.split(' ')
          const border = resolved as { color: DtcgColor, width: DtcgDimension, style: string }
          expect([`${border.width.value}${border.width.unit}`, border.style], name).toEqual([width, style])
          const target = /^var\((--[\w-]+)\)$/.exec(ref)![1]
          expect(ext(lookup(tree, (current.$value as { color: string }).color.slice(1, -1))).css, name).toBe(target)
          break
        }
        case 'shadow': {
          // the elevation terms are products of --depth: work them out at this depth
          const at = Number(css.get('--depth'))
          const literal = value
            .replace(/calc\(([\d.]+)(px)? \* var\(--depth\)\)/g, (_, n: string, unit = '') => `${Number(n) * at}${unit}`)
            .replace(/var\((--[\w-]+)\)/g, (_, ref: string) => channelsOf(css.get(ref) ?? paletteChannels(ref)))
          const layers = shadow(literal, () => { throw new Error(`${name}: unresolved var()`) })
          expect(resolved, name).toEqual(layers.length === 1 ? layers[0] : layers)
          expect(ext(current).cssValue, name).toBe(value)
          break
        }
        default:
          throw new Error(`${name}: unexpected $type ${current.$type}`)
      }
    }
    // a keyword the CSS writes is listed with the value of the context
    const keywords = cssOnly(tree).filter(({ css: name }) => rootValues.has(name))
    expect(keywords.length).toBe(cssOnly(globals).length)
    for (const { css: name, value } of keywords) expect(value, name).toBe(css.get(name))
  })

  test('aliases into the palette follow dark mode', () => {
    const dark = scenario({ mode: 'dark' })
    const light = scenario({ mode: 'light' })
    const focus = (tree: Node) => colorChannels(resolveValue(tree, lookup(tree, 'magma.outline.focus-color').$value) as DtcgColor)
    const neutral = (tree: Node) => colorChannels(resolveValue(tree, lookup(tree, 'palette.tone.neutral.05').$value) as DtcgColor)
    expect(focus(dark)).toEqual(neutral(dark))
    expect(focus(light)).toEqual(neutral(light))
    expect(focus(dark)).not.toEqual(focus(light))
  })

  test('the radius steps keep design-tokens sizes', () => {
    const round = scenario({ 'corner-shape': 'round' })
    const squircle = scenario({ 'corner-shape': 'squircle' })
    const md = (tree: Node) => resolveValue(tree, lookup(tree, 'magma.radius.md').$value)
    expect(md(round)).toEqual(dimension('12px'))
    expect(md(squircle)).toEqual(dimension('20px'))
    expect(lookup(round, 'magma.radius.full').$value).toBe('{radius.full}')
  })
})
