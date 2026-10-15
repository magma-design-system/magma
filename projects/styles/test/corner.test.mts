// The corner axis of build/css/corner.css (corner.ts): every shape block carries the cap, and
// a browser without corner-shape gets the round scale and the fallback cap back from a last
// @supports block that leaves an explicit round alone (#913). Needs a build first (nx: test
// dependsOn build).
import { readFileSync } from 'fs'
import { resolve } from 'path'
import postcss, { type AtRule, type Rule } from 'postcss'
import { describe, expect, test } from 'vitest'

const CORNER = resolve(__dirname, '../build/css/corner.css')
const root = postcss.parse(readFileSync(CORNER, 'utf8'), { from: CORNER })

const declarations = (rule: Rule): Map<string, string> => {
  const map = new Map<string, string>()
  rule.walkDecls((decl) => {
    map.set(decl.prop, decl.value)
  })
  return map
}

const rules = root.nodes.filter((node): node is Rule => node.type === 'rule')
const blockOf = (selector: string): Map<string, string> => {
  const rule = rules.find((node) => node.selector === selector)
  if (!rule) throw new Error(`no ${selector} block in ${CORNER}`)
  return declarations(rule)
}

describe('corner.css', () => {
  test.each([':root', "[data-corner-shape='round']", "[data-corner-shape='squircle']"])(
    '%s lets a corner take half the height, where the browser clamps',
    (selector) => {
      expect(blockOf(selector).get('--magma-corner-cap')).toBe('0.5')
    },
  )

  describe('without corner-shape', () => {
    const supports = root.nodes.filter(
      (node): node is AtRule => node.type === 'atrule' && node.name === 'supports',
    )
    const fallback = supports[0]?.first as Rule

    test('is the last block, so it wins over the squircle block of equal weight', () => {
      expect(supports).toHaveLength(1)
      expect(supports[0].params).toBe('not (corner-shape: squircle)')
      expect(root.last).toBe(supports[0])
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
