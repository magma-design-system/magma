// @vitest-environment jsdom
import { afterEach, expect, test, vi } from 'vitest'
import { h, render } from 'preact'
import { useState } from 'preact/hooks'

import { LangProvider } from '../src/i18n.js'
import { Check, Field, Range, Select, TextInput, swatchIcon } from '../src/magma.js'

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

test('a checkbox and a slider mount again when the language changes, to read their new text', () => {
  // mds-input-switch and mds-input-range read their text once into the name of their control
  // (#1336): keyed by the language, a change of it gives them a new element, which reads it again
  const draw = (lang: 'en' | 'it', text: string) =>
    render(
      h(LangProvider, { value: lang }, [
        h(Check, { checked: true, onChecked: () => undefined, children: text }),
        h(Range, { value: 40, onValue: () => undefined, min: 0, max: 100, label: text }),
      ]),
      root,
    )
  const check = () => root.querySelector('mds-input-switch')
  const slider = () => root.querySelector('mds-input-range')
  draw('en', 'Smooth')
  const [checkBefore, sliderBefore] = [check(), slider()]
  // the same language keeps the elements, whatever else the page renders
  draw('en', 'Smooth')
  expect(check()).toBe(checkBefore)
  expect(slider()).toBe(sliderBefore)
  draw('it', 'Morbida')
  expect(check()).not.toBe(checkBefore)
  expect(slider()).not.toBe(sliderBefore)
  expect(check()?.textContent).toBe('Morbida')
  expect(slider()?.textContent).toBe('Morbida')
})

test('a value the page sets is not handed back, though the component emits it while Preact sets it', () => {
  // as the watcher of mds-input: the change event leaves while the property is being set,
  // before Preact attaches the handler of the new render
  customElements.define(
    'mds-input',
    class extends HTMLElement {
      #value = ''
      get value() {
        return this.#value
      }
      set value(next: string) {
        this.#value = next
        this.dispatchEvent(new CustomEvent('mdsInputChange', { detail: { value: next }, bubbles: true }))
      }
    },
  )
  const onValue = vi.fn()
  render(h(TextInput, { value: 'neutral', onValue }), root)
  render(h(TextInput, { value: 'kaolin', onValue }), root)
  expect(onValue).not.toHaveBeenCalled()
  emit('mds-input', 'mdsInputChange', { value: 'kaolins' })
  expect(onValue).toHaveBeenCalledWith('kaolins')
})

test('a field that commits on leaving hands back on Enter and on blur, never at every key', async () => {
  const onValue = vi.fn()
  render(h(TextInput, { value: '8', onValue, commit: 'leave', type: 'number' }), root)
  emit('mds-input', 'mdsInputFocus', undefined)
  emit('mds-input', 'mdsInputChange', { value: '2' })
  emit('mds-input', 'mdsInputChange', { value: '20' })
  expect(onValue).not.toHaveBeenCalled()
  // the field shows what the person typed, once Preact renders the draft
  await new Promise((resolve) => setTimeout(resolve))
  expect((root.querySelector('mds-input') as unknown as { value: string }).value).toBe('20')
  emit('mds-input', 'mdsInputKeydown', new KeyboardEvent('keydown', { key: 'Enter' }))
  expect(onValue).toHaveBeenLastCalledWith('20')

  render(null, root)
  onValue.mockClear()
  render(h(TextInput, { value: '8', onValue, commit: 'leave' }), root)
  emit('mds-input', 'mdsInputChange', { value: '9' })
  // with the focus elsewhere (the arrows of a number field) the change is a commit
  expect(onValue).toHaveBeenLastCalledWith('9')
  onValue.mockClear()
  emit('mds-input', 'mdsInputFocus', undefined)
  emit('mds-input', 'mdsInputChange', { value: '12' })
  emit('mds-input', 'mdsInputBlur', undefined)
  expect(onValue).toHaveBeenCalledOnce()
  expect(onValue).toHaveBeenLastCalledWith('12')
})

test('a field says how its value stands, the control marked invalid on an error', () => {
  render(
    h(Field, { label: 'Name', message: 'Magma ships editorial', variant: 'error' }, h(TextInput, {
      value: 'editorial',
      onValue: () => undefined,
      variant: 'error',
    })),
    root,
  )
  expect(root.querySelector('mds-input-field')?.getAttribute('variant')).toBe('error')
  expect(root.querySelector('mds-input')?.getAttribute('aria-invalid')).toBe('true')
})

test('a slider is named by its text, which mds-input-range reads, hidden from the eye', () => {
  render(h(Range, { value: 40, onValue: () => undefined, min: 0, max: 100, label: 'Disabled' }), root)
  const slider = root.querySelector('mds-input-range')!
  expect(slider.textContent).toBe('Disabled')
  expect(slider.querySelector('span')?.className).toBe('studio-hidden')
  expect(slider.hasAttribute('aria-label')).toBe(false)
})

test('what the person types right after a commit is kept, not reset by the value of the page', async () => {
  const calls: string[] = []
  function Page () {
    const [value, setValue] = useState('')
    return h(TextInput, {
      value,
      commit: 'leave',
      onValue: (next: string) => {
        calls.push(next)
        setValue(next)
      },
    })
  }
  render(h(Page, {}), root)
  emit('mds-input', 'mdsInputFocus', undefined)
  emit('mds-input', 'mdsInputChange', { value: 'city, palette' })
  emit('mds-input', 'mdsInputBlur', undefined)
  // the page renders the value handed back; then, within the same frame, the field takes the
  // focus again and is emptied, then Enter
  await new Promise((resolve) => setTimeout(resolve))
  emit('mds-input', 'mdsInputFocus', undefined)
  emit('mds-input', 'mdsInputChange', { value: '' })
  emit('mds-input', 'mdsInputKeydown', new KeyboardEvent('keydown', { key: 'Enter' }))
  await new Promise((resolve) => setTimeout(resolve, 150))
  expect(calls).toEqual(['city, palette', ''])
  expect((root.querySelector('mds-input') as unknown as { value: string }).value).toBe('')
})

test('the swatch of a chip draws the colour, and nothing that is not a colour', () => {
  expect(swatchIcon('#4f8fd9')).toContain('fill="#4f8fd9"')
  expect(swatchIcon('rgb(10 20 30 / 0.5)')).toContain('fill="rgb(10 20 30 / 0.5)"')
  expect(swatchIcon(undefined)).toContain('fill="none"')
  // a colour from a loaded file goes into the markup mds-icon draws: no way out of the attribute
  expect(swatchIcon('red"/><script>alert(1)</script>')).toContain('fill="none"')
})
