import { afterEach, expect, test, vi } from 'vitest'
import { page, userEvent } from 'vitest/browser'
import { h, render } from 'preact'
import { useState } from 'preact/hooks'

import { LangProvider } from '../src/i18n.js'
import { Check, Field, Range, Select, TextInput } from '../src/magma.js'

// The form controls of Magma hand back the next value, as a native control of Preact does, and
// never the echo of the value the page set: mds-input, mds-input-select and mds-input-range emit
// their change event from the watcher of `value`, so a value the page sets comes back at once,
// while Preact is still setting the props. The components are the real ones: the page of the test
// loads the installed magma as every page of the studio does (vendor.ts), and the person types,
// chooses and moves the slider through Playwright.

const root = document.createElement('div')
document.body.append(root)
afterEach(() => render(null, root))

type MagmaTag = Extract<keyof HTMLElementTagNameMap, `mds-${string}`>

/** The element of a tag once its component has loaded and rendered. */
async function ready<T extends MagmaTag>(tag: T): Promise<HTMLElementTagNameMap[T]> {
  await customElements.whenDefined(tag)
  const element = root.querySelector(tag)!
  await element.componentOnReady()
  return element
}

/** Counts the events of a type an element emits: the echoes the bridges leave out. */
function counter(element: Element, type: string) {
  const count = { events: 0 }
  element.addEventListener(type, () => count.events++)
  return count
}

test('a text field hands back what the person types, not the echo of the value the page sets', async () => {
  const onValue = vi.fn()
  render(h(TextInput, { value: 'neutral', onValue }), root)
  const changes = counter(await ready('mds-input'), 'mdsInputChange')
  render(h(TextInput, { value: 'kaolin', onValue }), root)
  expect(changes.events).toBe(1)
  expect(onValue).not.toHaveBeenCalled()
  await userEvent.fill(page.getByRole('textbox'), 'kaolins')
  expect(onValue).toHaveBeenLastCalledWith('kaolins')
})

test('a select writes its options and hands back the one chosen', async () => {
  const onValue = vi.fn()
  const options = [
    { value: 'wcag2', label: 'WCAG 2' },
    { value: 'wcag3', label: 'APCA' },
  ]
  render(h(Select, { value: 'wcag3', onValue, options, label: 'Formula' }), root)
  const select = await ready('mds-input-select')
  expect([...select.querySelectorAll('option')].map((option) => option.value)).toEqual([
    'wcag2',
    'wcag3',
  ])
  const changes = counter(select, 'mdsInputSelectChange')
  render(h(Select, { value: 'wcag2', onValue, options, label: 'Formula' }), root)
  expect(changes.events).toBe(1)
  expect(onValue).not.toHaveBeenCalled()
  await userEvent.selectOptions(page.getByRole('combobox', { name: 'Formula' }), 'wcag3')
  expect(onValue).toHaveBeenLastCalledWith('wcag3')
})

test('a slider hands back a number, not the echo of its own value', async () => {
  const onValue = vi.fn()
  render(h(Range, { value: 40, onValue, min: 0, max: 100, label: 'Lightness' }), root)
  const changes = counter(await ready('mds-input-range'), 'mdsInputRangeChange')
  render(h(Range, { value: 45, onValue, min: 0, max: 100, label: 'Lightness' }), root)
  expect(changes.events).toBe(1)
  expect(onValue).not.toHaveBeenCalled()
  ;(page.getByRole('slider', { name: 'Lightness' }).element() as HTMLInputElement).focus()
  await userEvent.keyboard('{ArrowRight}')
  expect(onValue).toHaveBeenLastCalledWith(46)
})

test('a checkbox hands back its state, which only the person changes', async () => {
  const onChecked = vi.fn()
  render(h(Check, { checked: false, onChecked, children: 'smooth' }), root)
  const check = await ready('mds-input-switch')
  expect(check.getAttribute('type')).toBe('checkbox')
  expect(check.textContent).toBe('smooth')
  render(h(Check, { checked: true, onChecked, children: 'smooth' }), root)
  expect(onChecked).not.toHaveBeenCalled()
  await userEvent.click(page.getByText('smooth'))
  expect(onChecked).toHaveBeenLastCalledWith(false)
})

test('a checkbox and a slider mount again when the language changes, to read their new text', async () => {
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
  await ready('mds-input-range')
  const [checkBefore, sliderBefore] = [check(), slider()]
  // the same language keeps the elements, whatever else the page renders
  draw('en', 'Smooth')
  expect(check()).toBe(checkBefore)
  expect(slider()).toBe(sliderBefore)
  draw('it', 'Morbida')
  expect(check()).not.toBe(checkBefore)
  expect(slider()).not.toBe(sliderBefore)
  expect(check()?.textContent).toBe('Morbida')
  await ready('mds-input-range')
  await expect.element(page.getByRole('slider', { name: 'Morbida' })).toBeInTheDocument()
})

test('a field that commits on leaving hands back on Enter, never at every key', async () => {
  const onValue = vi.fn()
  render(h(TextInput, { value: '8', onValue, commit: 'leave', type: 'number' }), root)
  const field = await ready('mds-input')
  await userEvent.fill(page.getByRole('spinbutton'), '20')
  expect(onValue).not.toHaveBeenCalled()
  // the field shows what the person typed, once Preact renders the draft
  await expect.poll(() => field.value).toBe('20')
  await userEvent.keyboard('{Enter}')
  expect(onValue).toHaveBeenLastCalledWith('20')
})

test('a field that commits on leaving hands back a change made with the focus elsewhere, and on blur', async () => {
  const onValue = vi.fn()
  render(h(TextInput, { value: '8', onValue, commit: 'leave', type: 'number' }), root)
  await ready('mds-input')
  // the arrows of a number field change the value with the focus on themselves: a commit
  await userEvent.click(page.getByRole('button', { name: 'Increase' }))
  expect(onValue).toHaveBeenLastCalledWith('9')
  onValue.mockClear()
  await userEvent.fill(page.getByRole('spinbutton'), '12')
  expect(onValue).not.toHaveBeenCalled()
  await userEvent.tab()
  expect(onValue).toHaveBeenCalledOnce()
  expect(onValue).toHaveBeenLastCalledWith('12')
})

test('a field says how its value stands, the control marked invalid on an error', async () => {
  render(
    h(Field, {
      label: 'Name',
      message: 'Magma ships editorial',
      variant: 'error',
      children: h(TextInput, { value: 'editorial', onValue: () => undefined, variant: 'error' }),
    }),
    root,
  )
  await ready('mds-input-field')
  expect(root.querySelector('mds-input-field')?.getAttribute('variant')).toBe('error')
  expect(root.querySelector('mds-input')?.getAttribute('aria-invalid')).toBe('true')
})

test('a slider is named by its text, which mds-input-range reads, hidden from the eye', async () => {
  render(h(Range, { value: 40, onValue: () => undefined, min: 0, max: 100, label: 'Disabled' }), root)
  const slider = await ready('mds-input-range')
  expect(slider.textContent).toBe('Disabled')
  expect(slider.hasAttribute('aria-label')).toBe(false)
  await expect.element(page.getByRole('slider', { name: 'Disabled' })).toBeInTheDocument()
  // the text takes no room on the page: a box of one pixel, clipped
  const text = slider.querySelector('span')!
  const box = text.getBoundingClientRect()
  expect(box.width).toBeLessThanOrEqual(1)
  expect(box.height).toBeLessThanOrEqual(1)
  expect(getComputedStyle(text).clipPath).toBe('inset(50%)')
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
  const field = await ready('mds-input')
  const input = field.shadowRoot!.querySelector('input')!
  const type = (text: string) => {
    input.value = text
    input.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true }))
  }
  // a quick hand: the commit, then within one frame the field takes the focus again, is emptied
  // and committed with Enter, before Preact runs the effects of the render the commit caused
  input.focus()
  type('city, palette')
  input.blur()
  await new Promise((resolve) => setTimeout(resolve))
  input.focus()
  type('')
  input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, composed: true }))
  await expect.poll(() => calls).toEqual(['city, palette', ''])
  expect(field.value).toBe('')
})
