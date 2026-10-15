// What each semantic role is for (#876): every public role has one line in the sources, the
// model refuses a role without it, and the DTCG export carries it on the role and on its group.
// The DTCG case reads dist/dtcg, so it needs a build first (nx: test dependsOn build).
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { describe, expect, test } from 'vitest'

import { roleDescription, roleDescriptions, semantic } from '../semantic.config'
import { semanticModel } from '../semantic.model'

const hues = Object.keys(semantic.hues)
const accents = Object.keys(semantic.accents)
const publicRoles = () =>
  semanticModel().base.flatMap(({ decls }) => decls).filter((decl) => decl.tw)

describe('the descriptions of the semantic roles', () => {
  test('every public role has one line that says what it is for', () => {
    const roles = publicRoles()
    expect(roles.length).toBeGreaterThan(100)
    const wrong = roles.filter(
      ({ description }) =>
        !description ||
        description.includes('\n') ||
        /<\w+>/.test(description) ||
        !description.endsWith('.') ||
        /\ba [aeiou]/i.test(description) ||
        /[^\x20-\x7E]/.test(description),
    )
    expect(wrong.map(({ name }) => name)).toEqual([])
  })

  test('describes a status role and an accent role by their kind', () => {
    expect(roleDescription('danger-emphasis', hues, accents)).toBe(
      'The solid danger fill: a solid badge, a button.',
    )
    expect(roleDescription('info-text-default', hues, accents)).toBe(
      'Info text on the info background.',
    )
    expect(roleDescription('accent-ai-surface', hues, accents)).toBe(
      'A background tinted with the AI accent: a selected row or chip.',
    )
    expect(roleDescription('accent-fg', hues, accents)).toBe(
      'Text or an icon in the brand accent on a neutral surface, such as a link.',
    )
    expect(roleDescription('danger-unknown-kind', hues, accents)).toBeUndefined()
  })

  test('stops the model on a public role nothing describes', () => {
    const saved = roleDescriptions['surface-default']
    delete roleDescriptions['surface-default']
    try {
      expect(() => semanticModel()).toThrow(/--magma-surface-default/)
    } finally {
      roleDescriptions['surface-default'] = saved
    }
  })
})

describe('the descriptions in the DTCG export', () => {
  type Node = Record<string, unknown>
  const base = JSON.parse(
    readFileSync(resolve(__dirname, '../dist/dtcg/base.tokens.json'), 'utf8'),
  ) as { magma: Record<string, Node> }

  test('every group of the layer and every public role has its $description', () => {
    const groups = Object.entries(base.magma).filter(([key]) => !key.startsWith('$'))
    expect(groups.filter(([, node]) => !node.$description).map(([key]) => key)).toEqual([])

    const byCss = new Map<string, Node>()
    for (const [, group] of groups)
      for (const [key, token] of Object.entries(group))
        if (!key.startsWith('$') && token && typeof token === 'object' && '$value' in token)
          byCss.set(
            ((token as Node).$extensions as Record<string, { css: string }>)['it.maggioli.magma']
              .css,
            token as Node,
          )
    const missing = publicRoles().filter(
      ({ name, description }) => byCss.get(`--${name}`)?.$description !== description,
    )
    expect(missing.map(({ name }) => name)).toEqual([])
  })
})
