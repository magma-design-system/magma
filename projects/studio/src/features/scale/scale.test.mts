import { afterEach, expect, test, vi } from 'vitest'
import { h, render } from 'preact'
import { act } from 'preact/test-utils'
import { within } from '@testing-library/preact'

import { ScalePage } from './scale.js'
import { LangProvider, type Lang } from '../../shared/i18n/i18n.js'
import type { Route } from '../../shared/routes/routes.js'
import { selectFamily } from '../../state/palette.js'
import { builtinScalesOf, changeScale, scalesOf } from '../../state/scales.js'
import { createStudio, type StudioState } from '../../state/studio.js'
import { inStudio } from '../../../test/studio.mjs'
import { textOf } from '../../../test/text.mjs'

// The page of a contrast scale (#1403; Contrast scales until then): one scale at the centre, on the
// state of the studio. jsdom does not upgrade the components: the test dispatches the events they
// emit and reads the attributes Preact writes. A stop is handed back when the person commits it.

const root = document.createElement('div')
document.body.append(root)
afterEach(() => act(() => render(null, root)))

type ScaleRoute = Extract<Route, { section: 'scale' }>

/** The page on a scale, on a state of its own; the pages it opens, kept. */
function show (
  route: ScaleRoute,
  { selected = 'tone.neutral', lang = 'en', setup }: { selected?: string; lang?: Lang; setup?: (studio: StudioState) => void } = {},
) {
  const studio = createStudio({ storage: null, api: false })
  setup?.(studio)
  selectFamily(studio, selected)
  const opened: Array<{ route: Route; replace?: boolean }> = []
  act(() =>
    render(
      inStudio(
        studio,
        h(LangProvider, { value: lang }, h(ScalePage, { route, onOpen: (next: Route, options?: { replace?: boolean }) => void opened.push({ route: next, replace: options?.replace }) })),
      ),
      root,
    ),
  )
  return { studio, opened }
}

const TONE: ScaleRoute = { section: 'scale', formula: 'wcag3', name: 'tone' }
const emit = (element: Element, type: string, detail?: unknown) =>
  act(() => {
    element.dispatchEvent(new CustomEvent(type, { detail, bubbles: true }))
  })
const click = (element: HTMLElement) => act(() => element.click())
const head = () => root.querySelector('header')!
const badges = () => [...head().querySelectorAll('mds-badge')].map((one) => one.getAttribute('label'))
const steps = () => within(root).getByRole('group', { name: /^The steps of / })
const stops = () => [...steps().querySelectorAll('mds-input')].map((input) => input.getAttribute('value'))
const stop = (step: number) => root.querySelector(`mds-input[aria-label="Step ${step}"]`)!
const button = (label: string) =>
  [...root.querySelectorAll<HTMLElement>('mds-button')].find((one) => textOf(one) === label)
const field = (label: string) => root.querySelector(`mds-input-field[label="${label}"] mds-input-select`)!
const valuesOf = (studio: StudioState, name: string) => scalesOf(studio.config.value.ratios, 'wcag3')[name]

test('the head: the way back named after where the person came from, the badges, the menu, why', () => {
  show(TONE)
  const back = head().querySelector('mds-button[icon="mi/baseline/arrow-back"]')!
  expect([back.getAttribute('label'), back.getAttribute('href')]).toEqual(['tone.neutral', '#/colours'])
  expect(head().querySelector('mds-text[tag="h1"]')?.textContent).toBe('tone')
  expect(badges()).toEqual(['Built-in', 'Compatible with Magma'])
  expect(head().querySelector('mds-button[aria-label="Actions of the scale tone"]')).not.toBeNull()
  expect(root.querySelector('[data-why]')?.textContent).toBe(
    'The roles of Magma name 10 steps by number: this scale has 10. Its targets move freely, the contrast check measures them.',
  )
  // reached from a group, the way back names the group and leads to Groups
  act(() => render(null, root))
  show({ ...TONE, group: 'tone' })
  const toGroup = head().querySelector('mds-button[icon="mi/baseline/arrow-back"]')!
  expect([toGroup.getAttribute('label'), toGroup.getAttribute('href')]).toEqual(['The group tone', '#/groups'])
})

test('a scale that is not Magma-compatible says it serves only the cases outside Magma', () => {
  show({ section: 'scale', formula: 'wcag2', name: 'v1' })
  expect(badges()).toEqual(['Built-in', 'Not compatible with Magma'])
  expect(root.querySelector('[data-why]')?.textContent).toBe(
    'The roles of Magma name 10 steps by number: this scale has 20, so it serves only the families outside Magma.',
  )
  expect(within(root).getByRole('region', { name: 'Used by' }).textContent).toContain('No family uses this scale right now.')
})

test('the formula and the scale open any other scale, the way back kept', () => {
  const { opened } = show({ ...TONE, group: 'tone' })
  emit(field('Scale'), 'mdsInputSelectChange', { value: 'tint' })
  expect(opened.at(-1)?.route).toEqual({ section: 'scale', formula: 'wcag3', name: 'tint', group: 'tone' })
  // wcag2 has no tone: its default
  emit(field('Formula'), 'mdsInputSelectChange', { value: 'wcag2' })
  expect(opened.at(-1)?.route).toEqual({ section: 'scale', formula: 'wcag2', name: 'tone', group: 'tone' })
})

test('the families that use it, by group in chromatic order, the sample the one selected', () => {
  const { studio } = show(TONE)
  const chips = () => [...root.querySelectorAll('mds-chip')]
  expect(chips().map((chip) => chip.getAttribute('label'))).toEqual(['porcelain', 'kaolin', 'neutral', 'bisque', 'fireclay'])
  expect(chips().find((chip) => chip.hasAttribute('selected'))?.getAttribute('label')).toBe('neutral')
  emit(chips()[0], 'mdsChipSelect', { element: chips()[0], selected: true })
  expect(studio.selectedName.value).toBe('tone.porcelain')
})

test('a stop typed is written when the person commits it, clamped and in order', () => {
  const { studio } = show(TONE)
  const field = stop(1)
  emit(field, 'mdsInputFocus')
  emit(field, 'mdsInputChange', { value: '7' })
  emit(field, 'mdsInputChange', { value: '70' })
  // the person types: the scale waits
  expect(valuesOf(studio, 'tone')[0]).toBe(8)
  emit(field, 'mdsInputKeydown', new KeyboardEvent('keydown', { key: 'Enter' }))
  expect(valuesOf(studio, 'tone')).toEqual([15, 25, 36, 48, 70, 71, 80, 91, 101, 106])
  // past the end of the axis it stops at the end
  emit(stop(1), 'mdsInputFocus')
  emit(stop(1), 'mdsInputChange', { value: '200' })
  emit(stop(1), 'mdsInputBlur')
  expect(valuesOf(studio, 'tone').at(-1)).toBe(106)
  // a field left empty keeps its stop
  emit(stop(2), 'mdsInputFocus')
  emit(stop(2), 'mdsInputChange', { value: '' })
  emit(stop(2), 'mdsInputBlur')
  expect(stop(2).getAttribute('value')).toBe(String(valuesOf(studio, 'tone')[1]))
})

test('a built-in scale keeps its number of steps; one that is not built-in adds and removes them', () => {
  show(TONE)
  expect(root.querySelector('mds-button[aria-label^="Remove step"]')).toBeNull()
  expect(button('Add step')).toBeUndefined()
  expect(root.querySelector('[data-locked]')?.textContent).toBe('Built-in: its number of steps stays 10. To change it, duplicate it.')
  // an easing regenerates its targets on the steps it has: no field for their number
  emit(field('Distribution'), 'mdsInputSelectChange', { value: 'linear' })
  expect(root.querySelector('mds-input-field[label="Steps"]')).toBeNull()
  expect(stops()).toHaveLength(10)

  act(() => render(null, root))
  const { studio } = show({ section: 'scale', formula: 'wcag3', name: 'game' }, {
    setup: (state) => changeScale(state, 'wcag3', 'game', [20, 40, 60]),
  })
  expect(root.querySelector('[data-locked]')).toBeNull()
  click(root.querySelector<HTMLElement>('mds-button[aria-label="Remove step 2"]')!)
  expect(valuesOf(studio, 'game')).toEqual([20, 60])
  // two steps at least
  expect(root.querySelector('mds-button[aria-label="Remove step 1"]')?.hasAttribute('disabled')).toBe(true)
  click(button('Add step')!)
  expect(valuesOf(studio, 'game')).toEqual([20, 40, 60])
  emit(field('Distribution'), 'mdsInputSelectChange', { value: 'linear' })
  emit(root.querySelector('mds-input-field[label="Steps"] mds-input')!, 'mdsInputChange', { value: '5' })
  expect(valuesOf(studio, 'game')).toEqual([20, 30, 40, 50, 60])
})

test('Reset takes the scale back to the steps it was loaded with, once they changed', () => {
  const { studio } = show(TONE)
  const reset = () => button('Reset')!
  expect(reset().hasAttribute('disabled')).toBe(true)
  expect(reset().getAttribute('title')).toBe('tone holds the steps of the loaded configuration')
  emit(stop(1), 'mdsInputChange', { value: '12' })
  expect(reset().hasAttribute('disabled')).toBe(false)
  click(reset())
  expect(valuesOf(studio, 'tone')).toEqual(builtinScalesOf('wcag3').tone)
  expect(field('Distribution').getAttribute('value')).toBe('manual')
})

test('the menu: Duplicate opens the copy, Rename refuses a built-in, Delete asks nothing', () => {
  const { studio, opened } = show(TONE)
  click(button('Duplicate')!)
  expect(valuesOf(studio, 'custom-1')).toEqual(valuesOf(studio, 'tone'))
  expect(opened.at(-1)?.route).toEqual({ section: 'scale', formula: 'wcag3', name: 'custom-1' })
  expect(button('Rename')?.hasAttribute('disabled')).toBe(true)
  // Delete, last, in the error tone: no dialog, the toast of the shell undoes it
  const del = button('Delete')!
  expect(del.getAttribute('variant')).toBe('error')
  click(del)
  expect(root.querySelector('mds-modal')).toBeNull()
  expect(valuesOf(studio, 'tone')).toBeUndefined()
  expect(studio.lastUndo.value?.said.vars).toEqual({ name: 'tone' })
})

test('a scale renamed opens at its new name, in place', () => {
  const { studio, opened } = show({ section: 'scale', formula: 'wcag3', name: 'game' }, {
    setup: (state) => changeScale(state, 'wcag3', 'game', [20, 40, 60]),
  })
  click(button('Rename')!)
  const modal = root.querySelector('mds-modal')!
  const name = modal.querySelector('mds-input')!
  emit(name, 'mdsInputChange', { value: 'board' })
  click([...modal.querySelectorAll<HTMLElement>('mds-button')].find((one) => textOf(one) === 'Rename')!)
  expect(valuesOf(studio, 'board')).toEqual([20, 40, 60])
  // the page at the new name, in place (here the address stays: the shell would follow it)
  expect(opened[0]).toEqual({ route: { section: 'scale', formula: 'wcag3', name: 'board' }, replace: true })
})

test('a built-in scale redefined with another number, used by families that paint, is an error to undo', () => {
  const twelve = [4, 9, 15, 22, 30, 39, 49, 60, 72, 84, 96, 106]
  const { studio } = show({ section: 'scale', formula: 'wcag3', name: 'default' }, {
    selected: 'label.red',
    setup: (state) => changeScale(state, 'wcag3', 'default', twelve),
  })
  const banner = root.querySelector('mds-banner[variant="error"]')!
  expect(banner.getAttribute('headline')).toMatch(/^\d+ families that paint Magma are on 12 steps$/)
  expect(badges()).toEqual(['Built-in, overridden', 'Not compatible with Magma'])
  click(banner.querySelector<HTMLElement>('mds-button')!)
  expect(valuesOf(studio, 'default')).toEqual(builtinScalesOf('wcag3').default)
  expect(root.querySelector('mds-banner[variant="error"]')).toBeNull()
})

test('beside it, the states of the sample on the scale, one mode at a time', () => {
  show({ section: 'scale', formula: 'wcag3', name: 'default' }, { selected: 'status.error' })
  const frame = () => root.querySelector('iframe')?.getAttribute('title')
  expect(frame()).toBe('The states of status.error on the scale default, light mode')
  emit(root.querySelector('mds-tab[aria-label="Mode"]')!, 'mdsTabChange', { id: 1, value: 'dark' })
  expect(frame()).toBe('The states of status.error on the scale default, dark mode')
  // a family that paints nothing has no states
  act(() => render(null, root))
  show({ section: 'scale', formula: 'wcag3', name: 'default' }, { selected: 'brand.rnd' })
  expect(root.querySelector('iframe')).toBeNull()
  expect(within(root).getByRole('complementary', { name: 'The states of the sample' }).textContent).toMatch(/^brand.rnd paints no component of Magma/)
})

test('the pairs of the check the scale touches, measured after the render', async () => {
  show(TONE)
  await vi.waitFor(() => expect(Number(root.querySelector('[data-touched]')?.getAttribute('data-touched'))).toBeGreaterThan(50), { timeout: 10_000 })
  act(() => render(null, root))
  show({ section: 'scale', formula: 'wcag2', name: 'v1' })
  await vi.waitFor(() => expect(root.querySelector('[data-touched]')?.getAttribute('data-touched')).toBe('0'), { timeout: 10_000 })
}, 30_000)

test('the page speaks the language of the studio', () => {
  show(TONE, { lang: 'it' })
  expect(badges()).toEqual(['Integrata', 'Compatibile con Magma'])
  expect(within(root).getByRole('region', { name: 'Usata da' })).not.toBeNull()
})
