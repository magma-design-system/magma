// The corner axis as it ships: corner.ts writes build/css/corner.css and copy.ts appends it to
// dist/css/globals.css. Every shape block carries the cap, and a browser without corner-shape
// gets the round scale and the fallback cap back from an @supports block, after the squircle
// one, that leaves an explicit round alone (#913). Reads dist, not build: CI hands the test job
// only dist. Needs a build first (nx: test dependsOn build).
import { readFileSync } from 'fs'
import { resolve } from 'path'
import postcss, { type AtRule, type Rule } from 'postcss'
import { describe, expect, test } from 'vitest'

const GLOBALS = resolve(__dirname, '../dist/css/globals.css')
const root = postcss.parse(readFileSync(GLOBALS, 'utf8'), { from: GLOBALS })

const declarations = (rule: Rule): Map<string, string> => {
  const map = new Map<string, string>()
  rule.walkDecls((decl) => {
    map.set(decl.prop, decl.value)
  })
  return map
}

// globals.css has a :root of its own before the axis: a shape block is one that sets the shape
const shapeBlocks = root.nodes.filter(
  (node): node is Rule => node.type === 'rule' && declarations(node).has('--magma-corner-shape'),
)
const shapeBlock = (selector: string): Rule => {
  const rule = shapeBlocks.find((node) => node.selector === selector)
  if (!rule) throw new Error(`no ${selector} shape block in ${GLOBALS}`)
  return rule
}
const blockOf = (selector: string): Map<string, string> => declarations(shapeBlock(selector))

describe('the corner axis of globals.css', () => {
  test.each([':root', "[data-corner-shape='round']", "[data-corner-shape='squircle']"])(
    '%s lets a corner take half the height, where the browser clamps',
    (selector) => {
      expect(blockOf(selector).get('--magma-corner-cap')).toBe('0.5')
    },
  )

  describe('without corner-shape', () => {
    const supports = root.nodes.filter(
      (node): node is AtRule =>
        node.type === 'atrule' && node.name === 'supports' && node.params.includes('corner-shape'),
    )
    const fallback = supports[0]?.first as Rule

    test('comes after the squircle block, so it wins over it at equal weight', () => {
      expect(supports).toHaveLength(1)
      expect(supports[0].params).toBe('not (corner-shape: squircle)')
      expect(root.index(supports[0])).toBeGreaterThan(
        root.index(shapeBlock("[data-corner-shape='squircle']")),
      )
    })

    test('covers the default and an explicit squircle, never an explicit round', () => {
      expect(fallback.selectors).toEqual([
        ":root:not([data-corner-shape='round'])",
        "[data-corner-shape='squircle']",
      ])
    })

    test('draws round, with the round scale', () => {
      const values = declarations(fallback)
      const round = blockOf("[data-corner-shape='round']")
      expect(values.get('--magma-corner-shape')).toBe('round')
      for (const [name, value] of round) {
        if (name.startsWith('--magma-radius-')) expect(values.get(name)).toBe(value)
      }
    })

    test('caps a corner at the round look-alike of a squircle cut to half the height', () => {
      // 1.715: the round to squircle factor of radius.json, equal cut area
      expect(Number(declarations(fallback).get('--magma-corner-cap'))).toBeCloseTo(0.5 / 1.715, 4)
    })
  })
})
