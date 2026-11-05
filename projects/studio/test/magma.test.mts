// @vitest-environment jsdom
import { afterEach, expect, test, vi } from 'vitest'
import { h, render } from 'preact'

import { Check, Range, Select, TextInput } from '../src/magma.js'

// The form controls of Magma hand back the next value, as a native control of Preact does, and
// never the echo of the value the page set: mds-input, mds-input-select and mds-input-range emit
// their change event on a value set by the page too. jsdom does not upgrade the components: the
// test dispatches the events they emit.

const root = document.createElement('div')
document.body.append(root)
afterEach(() => render(null, root))

const emit = (selector: string, type: string, detail: unknown) =>
  root.querySelector(selector)!.dispatchEvent(new CustomEvent(type, { detail, bubbles: true }))

test('a text field hands back what the person types, not the echo of its own value', () => {
  const onValue = vi.fn()
  render(h(TextInput, { value: 'neutral', onValue }), root)
  emit('mds-input', 'mdsInputChange', { value: 'neutral' })
  expect(onValue).not.toHaveBeenCalled()
  emit('mds-input', 'mdsInputChange', { value: 'neutrals' })
  expect(onValue).toHaveBeenCalledWith('neutrals')
})

test('a select writes its options and hands back the one chosen', () => {
  const onValue = vi.fn()
  const options = [
    { value: 'wcag2', label: 'WCAG 2' },
    { value: 'wcag3', label: 'APCA' },
  ]
  render(h(Select, { value: 'wcag3', onValue, options, label: 'Formula' }), root)
  const select = root.querySelector('mds-input-select')!
  expect([...select.querySelectorAll('option')].map((option) => option.value)).toEqual([
    'wcag2',
    'wcag3',
  ])
  expect(select.getAttribute('aria-label')).toBe('Formula')
  emit('mds-input-select', 'mdsInputSelectChange', { value: 'wcag3', values: ['wcag3'] })
  expect(onValue).not.toHaveBeenCalled()
  emit('mds-input-select', 'mdsInputSelectChange', { value: 'wcag2', values: ['wcag2'] })
  expect(onValue).toHaveBeenCalledWith('wcag2')
})

test('a slider hands back a number, not the echo of its own value', () => {
  const onValue = vi.fn()
  render(h(Range, { value: 40, onValue, min: 0, max: 100, label: 'Disabled' }), root)
  emit('mds-input-range', 'mdsInputRangeChange', 40)
  expect(onValue).not.toHaveBeenCalled()
  emit('mds-input-range', 'mdsInputRangeChange', 45)
  expect(onValue).toHaveBeenCalledWith(45)
})

test('a checkbox hands back its state, which only the person changes', () => {
  const onChecked = vi.fn()
  render(h(Check, { checked: false, onChecked }, 'smooth'), root)
  const check = root.querySelector('mds-input-switch')!
  expect(check.getAttribute('type')).toBe('checkbox')
  expect(check.textContent).toBe('smooth')
  emit('mds-input-switch', 'mdsInputSwitchChange', { name: '', checked: true, value: '' })
  expect(onChecked).toHaveBeenCalledWith(true)
})
