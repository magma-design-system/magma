// The DTCG export (dist/dtcg, #874) against the stylesheets of the same build:
// every global custom property is in the JSON, the JSON is valid DTCG 2025.10, and
// merging the sets the way the resolver says gives the values the CSS gives in each
// mode, theme and contrast preference. Needs a build first (nx: test dependsOn build).
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { describe, expect, test } from 'vitest'

import { semanticModel } from '../semantic.model'
import { NAMESPACE } from '../scripts/dtcg/sets'
import {
  colorChannels,
  cubicBezier,
  dimension,
  hexColor,
  shadow,
  type DtcgColor,
  type DtcgDimension,
  type DtcgDuration,
  type DtcgShadowLayer,
} from '../scripts/dtcg/values'

const DIST = resolve(__dirname, '../dist')
const DTCG = resolve(DIST, 'dtcg')

type Node = Record<string, unknown>
type Token = { $type: string, $value: unknown, $extensions?: Record<string, { css?: string, cssValue?: string, tier?: string }> }
type Sources = Array<{ $ref: string }>
type Resolver = {
  version: string
  sets: Record<string, { sources: Sources }>
  modifiers: Record<string, { default?: string, contexts: Record<string, Sources> }>
  resolutionOrder: Sources
}

const readJson = (file: string): Node => JSON.parse(readFileSync(resolve(DTCG, file), 'utf8'))
const isToken = (node: unknown): node is Token =>
  typeof node === 'object' && node !== null && '$value' in node

/** Every token of a tree with its path; `$root` keeps its name in the path. */
const walk = (tree: Node, path: string[] = []): Array<[string[], Token]> =>
  Object.entries(tree).flatMap(([key, node]) => {
    if (key.startsWith('$') && key !== '$root') return []
    if (isToken(node)) return [[[...path, key], node] as [string[], Token]]
    return typeof node === 'object' && node !== null ? walk(node as Node, [...path, key]) : []
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

/** Merge the sets of one mode and one theme context, in the resolver's order. */
const scenario = (mode: string, theme: string): Node => {
  const resolver = readJson('magma.resolver.json') as unknown as Resolver
  const inputs: Record<string, string> = { mode, theme }
  const files = resolver.resolutionOrder.flatMap(({ $ref }) => {
    const [, kind, name] = $ref.split('/')
    return kind === 'sets'
      ? resolver.sets[name].sources
      : resolver.modifiers[name].contexts[inputs[name]]
  })
  const tree: Node = {}
  for (const { $ref } of files) mergeSets(tree, JSON.parse(JSON.stringify(readJson($ref))))
  return tree
}

const lookup = (tree: Node, path: string): Token => {
  const node = path.split('.').reduce<unknown>((at, key) => (at as Node)?.[key], tree)
  if (!isToken(node)) throw new Error(`{${path}} is no token`)
  return node
}

/** A value with every curly-brace alias replaced by the value it names. */
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

/** `--name: value` of the first block whose selector starts with `selector`. */
const cssBlock = (file: string, selector: string): Map<string, string> => {
  const css = readFileSync(resolve(DIST, 'css', file), 'utf8')
  const start = css.indexOf(`${selector}`)
  if (start < 0) throw new Error(`${selector} not in ${file}`)
  const body = css.slice(css.indexOf('{', start) + 1, css.indexOf('}', start))
  return new Map([...body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]))
}

const light = cssBlock('colors-rgb.css', ':root {')
const dark = cssBlock('colors-rgb.css', ':root:not(.pref-theme-scheme-light).pref-mode-dark')
const scale = cssBlock('typography.css', ':root {')
const motion = cssBlock('transitions.css', ':root {')
const channels = (block: Map<string, string>) => (name: string) =>
  block.get(name)!.split(' ').map(Number) as [number, number, number]

const base = readJson('base.tokens.json')
const baseTokens = walk(base)
const ext = (token: Token) => token.$extensions?.[NAMESPACE] ?? {}

describe('values', () => {
  test('colors carry sRGB components and the hex fallback', () => {
    expect(hexColor('#23B2E1')).toEqual({
      colorSpace: 'srgb',
      components: [0.1373, 0.698, 0.8824],
      hex: '#23b2e1',
    })
    expect(colorChannels(hexColor('#050505'))).toEqual([5, 5, 5])
  })

  test('dimensions take px and rem only', () => {
    expect(dimension('0')).toEqual({ value: 0, unit: 'px' })
    expect(dimension('0.0025rem')).toEqual({ value: 0.0025, unit: 'rem' })
    expect(() => dimension('50ch')).toThrow()
    expect(() => dimension('-0.025em')).toThrow()
  })

  test('cubic-bezier() becomes its four points', () => {
    expect(cubicBezier('cubic-bezier(0.6, -0.28, 0.735, 0.045)')).toEqual([0.6, -0.28, 0.735, 0.045])
  })

  test('shadows parse with the color first or last, inset, and a var() color', () => {
    const none = () => [0, 0, 0] as [number, number, number]
    expect(shadow('rgb(0 0 0 / 0.2) 0px 12px 28px 0px', none)).toEqual([
      {
        color: { colorSpace: 'srgb', components: [0, 0, 0], hex: '#000000', alpha: 0.2 },
        offsetX: { value: 0, unit: 'px' },
        offsetY: { value: 12, unit: 'px' },
        blur: { value: 28, unit: 'px' },
        spread: { value: 0, unit: 'px' },
      },
    ])
    const [inset, second] = shadow('inset 0 2px 4px 0 rgb(0 0 0 / 0.05), inset 0 0 0 1px rgb(0 0 0 / 0.01)', none)
    expect(inset.inset).toBe(true)
    expect(second.spread).toEqual({ value: 1, unit: 'px' })
    const [ring] = shadow('0 0 0 1px rgb(var(--tone-neutral-01) / 0.3)', (name) => {
      expect(name).toBe('--tone-neutral-01')
      return [5, 5, 5]
    })
    expect(ring.color).toEqual({ colorSpace: 'srgb', components: [0.0196, 0.0196, 0.0196], hex: '#050505', alpha: 0.3 })
  })
})

describe('coverage', () => {
  const inJson = new Set([
    ...baseTokens.map(([, token]) => ext(token).css).filter(Boolean),
    ...walkCssOnly(base),
  ])

  test('every custom property of the token stylesheets is in the base set', () => {
    const published = [...light.keys(), ...scale.keys(), ...motion.keys()]
    expect(published.filter((name) => !inJson.has(name))).toEqual([])
  })

  test('every declaration of the semantic layer is in the base set', () => {
    const declared = semanticModel().base.flatMap(({ decls }) => decls.map(({ name }) => `--${name}`))
    expect(declared.length).toBeGreaterThan(100)
    expect(declared.filter((name) => !inJson.has(name))).toEqual([])
  })
})

function walkCssOnly (tree: Node): string[] {
  return Object.entries(tree).flatMap(([key, node]) => {
    if (key === '$extensions')
      return ((node as Node)[NAMESPACE] as { cssOnly?: Array<{ css: string }> })?.cssOnly?.map(({ css }) => css) ?? []
    if (key.startsWith('$') || isToken(node) || typeof node !== 'object' || node === null) return []
    return walkCssOnly(node as Node)
  })
}

describe('DTCG 2025.10', () => {
  const files = ['base', 'mode-dark', 'contrast-more', 'theme-cool', 'theme-cool-contrast-more', 'theme-warm', 'theme-warm-contrast-more']
  const TYPES = ['color', 'dimension', 'fontFamily', 'fontWeight', 'duration', 'cubicBezier', 'number', 'shadow', 'typography']
  const isDimension = (value: unknown) =>
    typeof (value as DtcgDimension)?.value === 'number' && ['px', 'rem'].includes((value as DtcgDimension).unit)
  const isColor = (value: unknown) => {
    const color = value as DtcgColor
    return color?.colorSpace === 'srgb' &&
      color.components.length === 3 &&
      color.components.every((c) => c >= 0 && c <= 1) &&
      /^#[0-9a-f]{6}$/.test(color.hex) &&
      (color.alpha === undefined || (color.alpha >= 0 && color.alpha <= 1))
  }
  const SHAPES: Record<string, (value: unknown) => boolean> = {
    color: isColor,
    dimension: isDimension,
    fontFamily: (value) =>
      Array.isArray(value) && value.every((name) => typeof name === 'string' && !/['"]/.test(name)),
    fontWeight: (value) => Number.isInteger(value) && (value as number) >= 1 && (value as number) <= 1000,
    duration: (value) => {
      const time = value as DtcgDuration
      return typeof time?.value === 'number' && ['ms', 's'].includes(time.unit)
    },
    cubicBezier: (value) => {
      const points = value as number[]
      return Array.isArray(points) && points.length === 4 &&
        points[0] >= 0 && points[0] <= 1 && points[2] >= 0 && points[2] <= 1
    },
    number: (value) => typeof value === 'number' && Number.isFinite(value),
    shadow: (value) => ([value].flat() as DtcgShadowLayer[]).every((layer) =>
      isColor(layer.color) && [layer.offsetX, layer.offsetY, layer.blur, layer.spread].every(isDimension)),
    typography: (value) => {
      const style = value as Record<string, unknown>
      return Array.isArray(style.fontFamily) && isDimension(style.fontSize) && Number.isInteger(style.fontWeight) &&
        isDimension(style.letterSpacing) && typeof style.lineHeight === 'number'
    },
  }

  test.each(files)('%s: names, types and value shapes', (file) => {
    const tree = readJson(`${file}.tokens.json`)
    const merged = mergeSets(JSON.parse(JSON.stringify(base)), tree)
    const tokens = walk(tree)
    expect(tokens.length).toBeGreaterThan(0)
    for (const [path, token] of tokens) {
      for (const key of path) expect(key, path.join('.')).not.toMatch(/[.{}]|^\$(?!root$)/)
      expect(TYPES, path.join('.')).toContain(token.$type)
      const value = resolveValue(merged, token.$value)
      expect(SHAPES[token.$type](value), `${path.join('.')} ${JSON.stringify(value)}`).toBe(true)
      // an alias names a token of the same type
      if (typeof token.$value === 'string')
        expect(lookup(merged, token.$value.slice(1, -1)).$type, path.join('.')).toBe(token.$type)
    }
  })

  test('the resolver names existing sets and a default context for each modifier', () => {
    const resolver = readJson('magma.resolver.json') as unknown as Resolver
    expect(resolver.version).toBe('2025.10')
    for (const modifier of Object.values(resolver.modifiers)) {
      expect(Object.keys(modifier.contexts)).toContain(modifier.default)
      for (const sources of Object.values(modifier.contexts))
        for (const { $ref } of sources) expect(files).toContain($ref.replace('.tokens.json', ''))
    }
  })
})

describe('values match the stylesheets', () => {
  const lightTree = scenario('light', 'default')
  const darkTree = scenario('dark', 'default')

  test('palette, light and dark: colors-rgb.css', () => {
    for (const [mode, tree, block] of [['light', lightTree, light], ['dark', darkTree, dark]] as const)
      for (const [path, token] of walk(tree).filter(([path]) => path[0] === 'palette')) {
        const color = resolveValue(tree, token.$value) as DtcgColor
        const css = ext(token).css!
        expect(colorChannels(color).join(' '), `${mode} ${path.join('.')}`).toBe(block.get(css) ?? light.get(css))
      }
  })

  test('scale and motion: typography.css and transitions.css', () => {
    const asCss = (value: unknown, token: Token): unknown => {
      const extension = ext(token)
      if (extension.cssValue && token.$type !== 'shadow') return extension.cssValue
      switch (token.$type) {
        case 'dimension': {
          const { value: number, unit } = value as DtcgDimension
          return `${number}${unit}`
        }
        case 'fontFamily': return (value as string[]).join(',')
        case 'fontWeight': return String(value)
        case 'duration': {
          const { value: number, unit } = value as DtcgDuration
          return `${number}${unit}`
        }
        default: return value
      }
    }
    const fromCss = (css: string, token: Token): unknown => {
      if (ext(token).cssValue && token.$type !== 'shadow') return css
      switch (token.$type) {
        case 'dimension': {
          const { value, unit } = dimension(css)
          return `${value}${unit}`
        }
        case 'fontFamily': return css.split(',').map((name) => name.trim().replace(/^['"]|['"]$/g, '')).join(',')
        case 'cubicBezier': return cubicBezier(css)
        case 'shadow': return shadow(css, channels(light))
        default: return css
      }
    }
    for (const [path, token] of walk(lightTree)) {
      const css = ext(token).css
      const expected = css && (scale.get(css) ?? motion.get(css))
      if (!expected) continue
      let value = resolveValue(lightTree, token.$value)
      if (token.$type === 'shadow') value = [value].flat()
      expect(asCss(value, token), `${path.join('.')} (${css})`).toEqual(fromCss(expected, token))
    }
  })

  test('a value the CSS writes differently is the same quantity', () => {
    // letter spacing: the em of the CSS, at the style's own font size
    for (const [path, token] of walk(lightTree).filter(([path]) => path.at(-1) === 'letter-spacing')) {
      const size = lookup(lightTree, [...path.slice(0, -1), '$root'].join('.')).$value as DtcgDimension
      const em = Number(ext(token).cssValue!.replace('em', ''))
      expect((token.$value as DtcgDimension).value, path.join('.')).toBeCloseTo(em * size.value, 4)
    }
    // aspect ratios: the number the w/h of the CSS stands for
    for (const [path, token] of walk(lightTree).filter(([path]) => path[0] === 'aspect')) {
      const [w, h] = ext(token).cssValue!.split('/').map(Number)
      expect(resolveValue(lightTree, token.$value), path.join('.')).toBeCloseTo(w / h, 10)
    }
  })

  test('the ring shadows follow the dark palette', () => {
    const ring = resolveValue(darkTree, lookup(darkTree, 'shadow.ring').$value) as { color: DtcgColor }
    expect(colorChannels(ring.color).join(' ')).toBe(dark.get('--tone-neutral-01'))
  })

  // a ring is a line around an element and flips; a projected shadow does not (#790)
  test('the shadow ink is the ink extreme in light and pure black in dark, in every theme', () => {
    const ink = (tree: Node) =>
      colorChannels(resolveValue(tree, lookup(tree, 'magma.shadow.ink').$value) as DtcgColor).join(' ')
    expect(ink(lightTree)).toBe(light.get('--tone-neutral-01'))
    for (const { name } of semanticModel().themes) expect(ink(scenario('dark', name)), name).toBe('0 0 0')
  })

  // The semantic layer, resolved the way the browser cascades semantic.css and
  // themes.css: base, then the dark ink, the base contrast block, the theme block
  // and the theme's own contrast block. Each role ends on a palette custom property,
  // whose channels come from colors-rgb.css.
  const model = semanticModel()
  const scenarios = ['light', 'dark'].flatMap((mode) =>
    model.themes.flatMap(({ name }) => [false, true].map((contrast) => ({ mode, theme: name, contrast }))))

  test.each(scenarios)('semantic roles: $mode, theme $theme, contrast more $contrast', ({ mode, theme, contrast }) => {
    const themed = model.themes.find(({ name }) => name === theme)!
    const cascade = [
      ...model.base.flatMap(({ decls }) => decls),
      ...(mode === 'dark' ? model.dark : []),
      ...(contrast ? model.contrast : []),
      ...themed.decls,
      ...(contrast ? themed.contrast : []),
    ]
    const vars = new Map(cascade.map(({ name, ref }) => [name, ref]))
    const palette = mode === 'dark' ? dark : light
    const cssChannels = (name: string): string => {
      const ref = vars.get(name)
      if (ref) return cssChannels(ref)
      return palette.get(`--${name}`) ?? light.get(`--${name}`)!
    }
    const tree = scenario(mode, contrast ? `${theme}-contrast-more` : theme)
    const roles = walk(tree).filter(([path]) => path[0] === 'magma')
    expect(roles.length).toBe(vars.size)
    for (const [path, token] of roles) {
      const name = ext(token).css!.slice(2)
      const color = resolveValue(tree, token.$value) as DtcgColor
      expect(colorChannels(color).join(' '), `${path.join('.')} (--${name})`).toBe(cssChannels(name))
    }
  })
})
