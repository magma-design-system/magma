// The named themes as the build ships them in dist/css/themes.css (#692): business is the base
// :root and emits no rule of its own, editorial retints the tint to bisque and the accent to the
// Maggioli Editore brand, every theme publishes its preview for a picker, and a name kept until
// the next major would say so above its block. Needs a build first (nx: test dependsOn build).
import { readFileSync } from 'fs'
import { join, resolve } from 'path'
import postcss, { type Comment, type Rule } from 'postcss'
import { describe, expect, test } from 'vitest'

import { namedThemeCss, semanticModel } from '../../design-tokens/semantic.model'

const css = postcss.parse(readFileSync(join(resolve(__dirname, '..'), 'dist', 'css', 'themes.css'), 'utf8'))
const rules: Rule[] = []
css.walkRules((rule) => {
  rules.push(rule)
})
/** `--name: value` of the rule whose selector is exactly `selector`. */
const declarations = (selector: string): Map<string, string> => {
  const rule = rules.find((one) => one.selector === selector)
  if (!rule) throw new Error(`no ${selector} in themes.css`)
  const map = new Map<string, string>()
  rule.walkDecls((decl) => {
    map.set(decl.prop, decl.value)
  })
  return map
}
const scope = (name: string) => `[data-theme-name='${name}']`
const model = semanticModel()

describe('the two themes of the products', () => {
  test('business comes first, and the base layer is business', () => {
    expect(model.themes[0].name).toBe('business')
    expect(model.themes[0].decls).toEqual([])
  })

  test('business emits no rule: no data-theme-name keeps meaning business', () => {
    expect(rules.filter((rule) => rule.selector.includes(scope('business')))).toEqual([])
  })

  test('editorial retints the tint to bisque and the accent to the Maggioli Editore brand', () => {
    const editorial = declarations(`:root${scope('editorial')}`)
    expect(editorial.get('--magma-tint-default')).toBe('var(--surface-bisque-default)')
    expect(editorial.get('--magma-tint-text-default')).toBe('var(--text-bisque-default)')
    expect(editorial.get('--magma-tint-scale-09')).toBe('var(--tone-bisque-09)')
    expect(editorial.get('--magma-tint-accent-emphasis')).toBe('var(--variant-secondary-04)')
    // the AI accent is not the brand's: editorial leaves it alone
    expect([...editorial.keys()].some((name) => name.startsWith('--magma-tint-accent-ai-'))).toBe(false)
  })

  test('editorial restates the contrast promotions in its own family', () => {
    expect(rules.some((rule) => rule.selector === `:root${scope('editorial')}.pref-contrast-more`)).toBe(true)
  })

  // magma 3 removed default, cool and warm, the names magma 2 kept until the next major (#1334)
  test('ships business and editorial, and no name kept until the next major', () => {
    expect(model.themes.map(({ name }) => name)).toEqual(['business', 'editorial'])
    expect(model.themes.filter((theme) => theme.deprecated)).toEqual([])
    for (const name of ['default', 'cool', 'warm'])
      expect(rules.some((one) => one.selector.includes(scope(name))), name).toBe(false)
  })
})

describe('the preview of each theme', () => {
  const previews = declarations(':root')

  test.each(model.themes.map(({ name }) => name))('%s publishes its wash and its accent on :root', (name) => {
    expect(previews.get(`--magma-preview-${name}-wash`)).toMatch(/^var\(--tone-[a-z]+-09\)$/)
    expect(previews.get(`--magma-preview-${name}-accent`)).toMatch(/^var\(--variant-[a-z]+-04\)$/)
  })

  test('a preview is what the roles resolve to under its theme', () => {
    const editorial = declarations(`:root${scope('editorial')}`)
    expect(previews.get('--magma-preview-editorial-wash')).toBe(editorial.get('--magma-tint-scale-09'))
    expect(previews.get('--magma-preview-editorial-accent')).toBe(editorial.get('--magma-tint-accent-emphasis'))
    expect(previews.get('--magma-preview-business-wash')).toBe('var(--tone-neutral-09)')
    expect(previews.get('--magma-preview-business-accent')).toBe('var(--variant-primary-04)')
  })
})

// Magma 3 ships no deprecated theme (#1334), so the block is printed from one made up here.
test('a deprecated theme says why it goes, on the line above its block', () => {
  const editorial = model.themes.find(({ name }) => name === 'editorial')!
  const sheet = postcss.parse(namedThemeCss({ ...editorial, name: 'old', deprecated: 'use editorial' }))
  const rule = sheet.nodes.find((node): node is Rule => node.type === 'rule')!
  const comment = rule.prev() as Comment | undefined
  expect(comment?.type).toBe('comment')
  expect(comment?.text).toBe('old, deprecated: use editorial.')
})
