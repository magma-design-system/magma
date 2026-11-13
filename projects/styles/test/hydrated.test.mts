// The box a component takes before it hydrates (#1409): hydrated.ts appends every
// css/<tag>-pre-hydration.css of the stencil sources to hydrated.css, through hydrated-lib.ts.
// The dist half reads dist, not build: CI hands the test job only dist. Needs a build first
// (nx: test dependsOn build).
import { readFileSync } from 'fs'
import { resolve } from 'path'
import postcss, { type Rule } from 'postcss'
import { describe, expect, test } from 'vitest'
import {
  NOT_HYDRATED,
  isPreHydrationSelector,
  preHydrationRules,
} from '../scripts/hydrated-lib'

describe('isPreHydrationSelector', () => {
  test('takes the host of its tag before hydration, with attribute selectors before the guard', () => {
    expect(isPreHydrationSelector(`mds-img${NOT_HYDRATED}`, 'mds-img')).toBe(true)
    expect(isPreHydrationSelector(`mds-img[width][height]${NOT_HYDRATED}`, 'mds-img')).toBe(true)
  })

  test('refuses a rule that would still match the hydrated host, or another element', () => {
    // page CSS beats :host whatever its layer: without the guard it overrides the component
    expect(isPreHydrationSelector('mds-img', 'mds-img')).toBe(false)
    expect(isPreHydrationSelector('mds-img:not([hydrated])', 'mds-img')).toBe(false)
    // a descendant is light DOM, not the box of the host
    expect(isPreHydrationSelector(`mds-img${NOT_HYDRATED} img`, 'mds-img')).toBe(false)
    // another component, or a tag that only starts like it
    expect(isPreHydrationSelector(`mds-video${NOT_HYDRATED}`, 'mds-img')).toBe(false)
    expect(isPreHydrationSelector(`mds-img-x${NOT_HYDRATED}`, 'mds-img')).toBe(false)
  })
})

describe('preHydrationRules', () => {
  test('ships the rules without the comments, which stay in the source', () => {
    const css = `/* why */\nmds-img${NOT_HYDRATED} {\n  /* how */\n  display: flex;\n}\n`

    expect(preHydrationRules(css, 'mds-img')).toBe(`mds-img${NOT_HYDRATED} {\n  display: flex;\n}`)
  })

  test('throws on each selector out of the form, and on an at-rule', () => {
    const css = `mds-img { width: 100%; }\n@media (width > 0) { mds-img${NOT_HYDRATED} { display: flex; } }`

    expect(() => preHydrationRules(css, 'mds-img', 'mds-img-pre-hydration.css')).toThrow(
      /mds-img-pre-hydration\.css: .*\n {2}@media \(width > 0\)\n {2}mds-img$/,
    )
  })
})

describe('the pre-hydration boxes of hydrated.css', () => {
  const HYDRATED = resolve(__dirname, '../dist/css/hydrated.css')
  const root = postcss.parse(readFileSync(HYDRATED, 'utf8'), { from: HYDRATED })
  const declarations = (selector: string): Record<string, string> => {
    const rule = root.nodes.find(
      (node): node is Rule => node.type === 'rule' && node.selector === selector,
    )
    if (!rule) throw new Error(`no ${selector} rule in ${HYDRATED}`)
    const found: Record<string, string> = {}
    rule.walkDecls((decl) => {
      found[decl.prop] = decl.value
    })
    return found
  }

  test('give mds-img the display and the width of its hydrated host', () => {
    expect(declarations(`mds-img${NOT_HYDRATED}`)).toEqual({ display: 'flex', width: '100%' })
  })

  test('give mds-img the ratio of its width and height', () => {
    expect(declarations(`mds-img[width][height]${NOT_HYDRATED}`)).toEqual({
      'aspect-ratio': 'attr(width type(<number>)) / attr(height type(<number>))',
    })
  })
})
