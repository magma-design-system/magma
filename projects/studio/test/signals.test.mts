import { afterEach, expect, test } from 'vitest'
import { h, render } from 'preact'
import { act } from 'preact/test-utils'
import {
  batch,
  computed,
  effect,
  signal,
  useComputed,
  useSignal,
  useSignalEffect,
} from '@preact/signals'

// The state of the studio moves to Preact Signals (#1400). @preact/signals hooks into the options
// of Preact to redraw what reads a signal; its peer range declares Preact 11, but its own tests
// run on Preact 10. Here it runs on the Preact of the studio (11.2.0): the core, a component that
// reads a signal, a signal bound to a text and to a prop, the hooks, an unmount.

const root = document.createElement('div')
document.body.append(root)
afterEach(() => act(() => render(null, root)))

test('a computed follows its signals, an effect runs on each change until disposed', () => {
  const lightness = signal(40)
  const steps = signal(10)
  const stops = computed(() => Array.from({ length: steps.value }, (_, i) => lightness.value + i))
  const seen: number[] = []
  const dispose = effect(() => {
    seen.push(stops.value.length)
  })
  expect(stops.value[0]).toBe(40)
  lightness.value = 50
  expect(stops.value[0]).toBe(50)
  // one batch, one run of the effect
  batch(() => {
    steps.value = 12
    lightness.value = 60
  })
  expect(seen).toEqual([10, 10, 12])
  dispose()
  steps.value = 3
  expect(seen).toEqual([10, 10, 12])
})

test('a component that reads a signal redraws when it changes, and only then', async () => {
  const name = signal('kaolin')
  const unrelated = signal(0)
  let draws = 0
  function Name() {
    draws++
    return h('p', null, `the colour ${name.value}`)
  }
  act(() => render(h(Name, null), root))
  expect(root.textContent).toBe('the colour kaolin')
  await act(() => {
    name.value = 'cobalt'
  })
  expect(root.textContent).toBe('the colour cobalt')
  expect(draws).toBe(2)
  await act(() => {
    unrelated.value = 1
  })
  expect(draws).toBe(2)
})

test('a signal written as a text or a prop updates the DOM without redrawing the component', async () => {
  const label = signal('Light')
  const variant = signal('info')
  let draws = 0
  function Badge() {
    draws++
    // an mds-* tag never upgraded in jsdom: the prop lands as on any custom element
    return h('mds-badge', { variant, label }, label)
  }
  act(() => render(h(Badge, null), root))
  const badge = root.querySelector('mds-badge')!
  expect(badge.textContent).toBe('Light')
  expect(badge.getAttribute('variant')).toBe('info')
  await act(() => {
    label.value = 'Dark'
    variant.value = 'warning'
  })
  expect(badge.textContent).toBe('Dark')
  expect(badge.getAttribute('label')).toBe('Dark')
  expect(badge.getAttribute('variant')).toBe('warning')
  expect(draws).toBe(1)
})

test('useSignal, useComputed and useSignalEffect keep their state across redraws', async () => {
  const seen: number[] = []
  let increment: () => void = () => undefined
  function Counter({ step }: { step: number }) {
    const count = useSignal(0)
    const double = useComputed(() => count.value * 2)
    useSignalEffect(() => {
      seen.push(count.value)
    })
    increment = () => {
      count.value += step
    }
    return h('output', null, `${count.value} ${double.value}`)
  }
  act(() => render(h(Counter, { step: 1 }), root))
  await act(() => increment())
  // a redraw from the parent keeps the signals of the component
  act(() => render(h(Counter, { step: 5 }), root))
  await act(() => increment())
  expect(root.textContent).toBe('6 12')
  expect(seen).toEqual([0, 1, 6])
})

test('an unmounted component stops reading its signals', async () => {
  const name = signal('kaolin')
  let draws = 0
  function Name() {
    draws++
    return h('p', null, name.value)
  }
  act(() => render(h(Name, null), root))
  act(() => render(null, root))
  await act(() => {
    name.value = 'cobalt'
  })
  expect(draws).toBe(1)
  expect(root.textContent).toBe('')
})
