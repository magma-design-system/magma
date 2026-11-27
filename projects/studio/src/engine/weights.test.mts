import { expect, test } from 'vitest'
import { SURFACE_ROLES } from '@maggioli-design-system/design-tokens/src/lib/surface.mjs'

import { DEFAULT_THEME, percentOf, pushSurfaces, surfaceOrderProblems } from './weights.js'

// The weights of a preset (#1403): the order of depth of the surfaces, which a moved slider keeps
// by pushing its neighbours (vittorio, 2026-11-27).

const LIGHT = DEFAULT_THEME.surfaces.light as Record<string, string>
const DARK = DEFAULT_THEME.surfaces.dark as Record<string, string>

test('a level reads as a number of the ramp, however it is written', () => {
  expect(percentOf('96%')).toBe(96)
  expect(percentOf('96')).toBe(96)
  expect(percentOf(0.96)).toBe(96)
  expect(percentOf(undefined)).toBe(0)
})

test('the surfaces of Magma are in order of depth in both modes', () => {
  expect(surfaceOrderProblems(LIGHT, SURFACE_ROLES)).toEqual([])
  expect(surfaceOrderProblems(DARK, SURFACE_ROLES)).toEqual([])
})

test('a surface moved over the one above it pushes it, and those above, up to its level', () => {
  expect(pushSurfaces(LIGHT, SURFACE_ROLES, 'sunken', 98)).toEqual({
    sunken: '98%',
    muted: '98%',
    default: '98%',
    // already at 98 and 100: left as written
    raised: '98%',
    overlay: '100%',
  })
})

test('a surface moved under the one below it pushes it, and those below, down to its level', () => {
  expect(pushSurfaces(DARK, SURFACE_ROLES, 'overlay', 19)).toEqual({
    sunken: '17%',
    muted: '19%',
    default: '19%',
    raised: '19%',
    overlay: '19%',
  })
})

test('equal levels are allowed: a move inside its neighbours touches no other surface', () => {
  const flat = Object.fromEntries(SURFACE_ROLES.map((role) => [role, '96%']))
  expect(surfaceOrderProblems(flat, SURFACE_ROLES)).toEqual([])
  expect(pushSurfaces(LIGHT, SURFACE_ROLES, 'default', 95)).toEqual({ ...LIGHT, default: '95%' })
})

test('a preset loaded out of order names each surface that passes the one above it', () => {
  expect(surfaceOrderProblems({ ...LIGHT, sunken: '98%', muted: '90%' }, SURFACE_ROLES)).toEqual([
    { role: 'sunken', above: 'muted', level: 98, aboveLevel: 90 },
  ])
})
