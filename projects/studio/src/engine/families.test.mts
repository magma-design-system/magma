import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'
import initialConfigJson from '@maggioli-design-system/design-tokens/.magma-design-tokensrc.json'
import type { ColorConfig, MagmaConfig } from '@maggioli-design-system/design-tokens/src/lib/color.mjs'

import {
  BUILTIN_ALIAS_NAMES,
  DERIVED_GROUPS,
  groupNameOf,
  groupNameProblem,
  inheritedFrom,
  isMagmaCompatible,
  MAGMA_STEPS,
  resolveBaseColor,
  themesUsing,
} from './families.js'
import { sceneStyle } from './scene-css.js'
import { NO_THEME_CHOICES } from './theme-choices.js'

// A family as Colours and Groups read it (#1403): its references, where its values come from, its
// scale, the name of a new group.

const here = path.dirname(fileURLToPath(import.meta.url))
const preset = initialConfigJson as unknown as MagmaConfig
const family = (name: string) => preset.colors.find((one) => one.name === name) as ColorConfig

test('the groups the engine derives are the ones of design-tokens', () => {
  const source = readFileSync(path.resolve(here, '../../../design-tokens/src/lib/text-role.mts'), 'utf8')
  const declared = source.match(/const DERIVED_GROUPS = new Set\(\[([^\]]*)\]\)/)
  expect(declared).not.toBeNull()
  expect([...declared![1].matchAll(/"([^"]+)"/g)].map((match) => match[1])).toEqual(DERIVED_GROUPS)
})

test('a reference resolves to the colour of the family it follows; the built-in ones are known', () => {
  expect(resolveBaseColor(preset, family('variant.primary'))).toBe(family('brand.maggioli').color)
  expect(resolveBaseColor(preset, family('label.red'))).toBe('#d01b1b')
  expect([...BUILTIN_ALIAS_NAMES]).toEqual(['variant.primary', 'variant.secondary', 'variant.ai'])
})

test('a value the family does not set comes from its group or from the preset', () => {
  const neutral = family('tone.neutral')
  // the scale and the export are decided by the group, even one that sets none
  expect(inheritedFrom(preset, neutral, 'ratios')).toEqual({ from: 'group', group: 'tone' })
  expect(inheritedFrom(preset, family('label.red'), 'ratios')).toEqual({ from: 'group', group: 'label' })
  // the formula from the group that sets one, else from the preset
  expect(inheritedFrom(preset, neutral, 'formula')).toEqual({ from: 'preset' })
  const withFormula = { ...preset, groups: { ...preset.groups, tone: { ratios: 'tone', formula: 'wcag2' } } } as MagmaConfig
  expect(inheritedFrom(withFormula, neutral, 'formula')).toEqual({ from: 'group', group: 'tone' })
  expect(inheritedFrom(preset, neutral, 'colorspace')).toEqual({ from: 'preset' })
  expect(inheritedFrom(preset, neutral, 'smooth')).toEqual({ from: 'preset' })
  // a value of its own comes from nowhere else
  expect(inheritedFrom(preset, neutral, 'export')).toBeUndefined()
  expect(inheritedFrom(preset, family('tone.kaolin'), 'colorspace')).toBeUndefined()
})

test('a scale holds the roles of Magma with as many steps as they name', () => {
  expect(MAGMA_STEPS).toBe(10)
  expect(isMagmaCompatible(Array.from({ length: 10 }, (_, i) => i))).toBe(true)
  expect(isMagmaCompatible(Array.from({ length: 20 }, (_, i) => i))).toBe(false)
  expect(isMagmaCompatible(undefined)).toBe(false)
})

test('a new group takes a name that names tokens, never a derived one, never variant for a colour', () => {
  expect(groupNameOf('  Game Board ')).toBe('game-board')
  expect(groupNameProblem('game', 'color')).toBeUndefined()
  expect(groupNameProblem('', 'color')).toBe('Write the name of the group.')
  expect(groupNameProblem('2d', 'color')).toMatch(/letter first/)
  expect(groupNameProblem('game.board', 'color')).toMatch(/letter first/)
  expect(groupNameProblem('surface', 'color')).toMatch(/engine makes a group/)
  expect(groupNameProblem('variant', 'color')).toMatch(/references alone/)
  expect(groupNameProblem('variant', 'alias')).toBeUndefined()
})

test('the themes that use a family, as their tint or through an accent', () => {
  const { themes } = sceneStyle(preset, NO_THEME_CHOICES)
  expect(themesUsing(preset, 'tone.neutral', themes, NO_THEME_CHOICES)).toEqual([{ theme: 'business', as: 'tint' }])
  // business and porcelain point their accent at variant.primary, which follows brand.maggioli;
  // editorial points it at variant.secondary, which follows brand.maggioli-editore
  const maggioli = themesUsing(preset, 'brand.maggioli', themes, NO_THEME_CHOICES)
  expect(maggioli).toEqual([
    { theme: 'business', as: 'accent' },
    { theme: 'porcelain', as: 'accent' },
  ])
  expect(themesUsing(preset, 'variant.primary', themes, NO_THEME_CHOICES)).toEqual(maggioli)
  expect(themesUsing(preset, 'brand.maggioli-editore', themes, NO_THEME_CHOICES)).toEqual([
    { theme: 'editorial', as: 'accent' },
  ])
  expect(themesUsing(preset, 'label.violet', themes, NO_THEME_CHOICES).map((use) => use.as)).toEqual(themes.map(() => 'ai'))
  expect(themesUsing(preset, 'label.red', themes, NO_THEME_CHOICES)).toEqual([])
})
