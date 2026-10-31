// What each semantic role is for (#876): every public role has one line in the sources, the
// model refuses a role without it, and the DTCG export carries it on the role and on its group.
// The other groups of the export and the typography styles have theirs too (#1095).
// The DTCG cases read dist/dtcg, so they need a build first (nx: test dependsOn build).
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { describe, expect, test } from 'vitest'

import { tokenDescription, tokenDescriptions } from '../descriptions.config'
import { describeGroups, staleDescriptions } from '../scripts/dtcg/sets'
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

describe('the descriptions of the other groups', () => {
  type Group = Record<string, unknown>
  const base = JSON.parse(
    readFileSync(resolve(__dirname, '../dist/dtcg/base.tokens.json'), 'utf8'),
  ) as Group
  const isToken = (node: unknown) => typeof node === 'object' && node !== null && '$value' in node
  const groupsOf = (node: Group, path: string[] = []): Array<[string, Group]> =>
    Object.entries(node)
      .filter(([key, child]) => !key.startsWith('$') && !isToken(child))
      .flatMap(([key, child]) => [
        [[...path, key].join('.'), child as Group] as [string, Group],
        ...groupsOf(child as Group, [...path, key]),
      ])
  const token = { $type: 'dimension', $value: { value: 4, unit: 'px' }, $extensions: {} }

  test('every line says in one sentence what the group is for', () => {
    const wrong = Object.entries(tokenDescriptions).filter(
      ([, line]) =>
        line.includes('\n') ||
        /<\w+>/.test(line) ||
        !line.endsWith('.') ||
        /\ba [aeiou]/i.test(line) ||
        /[^\x20-\x7E]/.test(line),
    )
    expect(wrong.map(([path]) => path)).toEqual([])
  })

  test('every group of the base set and every typography style has its $description', () => {
    const groups = groupsOf(base)
    expect(groups.length).toBeGreaterThan(100)
    expect(groups.filter(([, group]) => !group.$description).map(([path]) => path)).toEqual([])

    const styles = groupsOf(base.typography as Group).flatMap(([family, group]) =>
      Object.entries(group)
        .filter(([key]) => !key.startsWith('$'))
        .map(([style, node]) => [`${family}.${style}`, node as Group] as const),
    )
    // 18 levels and the 5 titles by role of #1189 (page, section, dialog, part, group)
    expect(styles).toHaveLength(23)
    expect(styles.filter(([, node]) => !node.$description).map(([name]) => name)).toEqual([])
    expect(staleDescriptions(base)).toEqual([])
  })

  test('describes the families of a ladder, the label hues and the parts of a style by a rule', () => {
    expect(tokenDescription(['palette', 'surface', 'info'])).toBe(
      'The surface ladder of the info family.',
    )
    expect(tokenDescription(['palette', 'label', 'aqua'])).toBe(
      'The aqua hue of the categorical palette.',
    )
    expect(tokenDescription(['text-size', 'read'])).toBe('The parts of the read styles.')
    expect(tokenDescription(['palette', 'tone', 'unknown'])).toBeUndefined()
  })

  test('puts the line first in a group, after the value in a style, and stops on what nothing describes', () => {
    const tree: Group = { size: { xs: token }, typography: { title: { h1: token } } }
    describeGroups(tree)
    expect(Object.keys(tree.size as Group)).toEqual(['$description', 'xs'])
    const h1 = ((tree.typography as Group).title as Group).h1 as Group
    expect(Object.keys(h1)).toEqual(['$type', '$value', '$description', '$extensions'])
    expect(h1.$description).toBe('The largest heading: the title of a page.')

    expect(() => describeGroups({ nothing: { xs: token } })).toThrow(/nothing/)
    expect(() => describeGroups({ typography: { title: { h9: token } } })).toThrow(
      /typography\.title\.h9/,
    )
    expect(staleDescriptions({ size: {} })).toContain('palette')
  })
})
