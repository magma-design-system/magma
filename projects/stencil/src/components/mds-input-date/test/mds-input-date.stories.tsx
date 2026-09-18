import { h } from '@stencil/core'
import { useEffect, useState } from 'react'
import { expect, waitFor } from 'storybook/test'

export default {
  title: 'Form / Input Date',
  argTypes: {
    disabled: {
      type: { name: 'boolean' },
      description: 'If true, the element is displayed as disabled',
    },
    min: {
      type: { name: 'string' },
      description: 'Specifies the min date can be set',
    },
    max: {
      type: { name: 'string' },
      description: 'Specifies the max date can be set',
    },
    readOnly: {
      type: { name: 'boolean' },
      description: 'Specifies that the element is read-only',
    },
    required: {
      type: { name: 'boolean' },
      description:
        'Specifies that the element must be filled out before submitting the form',
    },
    value: {
      type: { name: 'string' },
      description: 'Specifies the value of the input',
    },
  },
}

const getDate = (offsetDays: number = 0): string => {
  const today = new Date()
  today.setDate(today.getDate() + offsetDays)

  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const Template = args => (
  <mds-input-date {...args} class="max-w-[400px]"></mds-input-date>
)

export const Default = {
  render: Template,

  args: {
    value: getDate(),
  },
}

export const MinMax = {
  render: Template,

  args: {
    min: getDate(-15),
    max: getDate(15),
  },
}

export const Invalid = {
  render: Template,

  args: {
    value: '2025-04-31',
  },
}

export const Required = {
  render: Template,

  args: {
    required: true,
  },
}

export const Disabled = {
  render: Template,

  args: {
    disabled: true,
  },
}

// A date field inside a modal with a custom window (mds-banner in slot="window", so the calendar
// pops out of the window instead of being clipped by the default window). The play opens the
// modal and the calendar and checks that the calendar takes the field width, capped by
// the calendar max-width, with seven evenly sized columns, anchored to the end of the field.
const InsideModalTemplate = () => {
  const [opened, setOpened] = useState(false)

  useEffect(() => {
    const modalElement = document.querySelector('#date-modal')
    const close = (): void => setOpened(false)
    modalElement?.addEventListener('mdsModalClose', close)
    modalElement?.addEventListener('mdsModalHide', close)
    return () => {
      modalElement?.removeEventListener('mdsModalClose', close)
      modalElement?.removeEventListener('mdsModalHide', close)
    }
  }, [])

  return (
    <div>
      <mds-button id="open-modal" onClick={() => setOpened(true)}>
        Apri la modale
      </mds-button>
      <mds-modal id="date-modal" opened={opened ? true : undefined} position="center">
        <mds-banner slot="window" class="max-w-[480px]">
          <mds-button
            icon="mi/baseline/close"
            variant="dark"
            tone="quiet"
            style={{ position: 'absolute', right: '0.5rem', top: '0.5rem' }}
            onClick={() => setOpened(false)}
          ></mds-button>
          <mds-input-field label="Preparato da">
            <mds-input value="Mario Rossi"></mds-input>
          </mds-input-field>
          <mds-input-field label="il">
            <mds-input-date id="modal-date" value={getDate()}></mds-input-date>
          </mds-input-field>
          <mds-input-field label="Commento">
            <mds-input type="textarea" placeholder="Commento"></mds-input>
          </mds-input-field>
        </mds-banner>
      </mds-modal>
    </div>
  )
}

// Waits for the dropdown opening transition to stand still before measuring.
const waitForSettled = (element: Element): Promise<void> =>
  waitFor(
    () => {
      const { opacity, transform } = getComputedStyle(element)
      expect(opacity).toBe('1')
      expect(['none', 'matrix(1, 0, 0, 1, 0, 0)']).toContain(transform)
    },
    { timeout: 5000 },
  )

// The play starts on the React render, before the Stencil hydration: wait for the components,
// then for mdsModalShow (the end of the window's opening transition) before opening the calendar.
const openModalAndCalendar = async ({ canvasElement, userEvent }) => {
  const modal = canvasElement.querySelector('#date-modal') as HTMLMdsModalElement
  const host = canvasElement.querySelector('#modal-date') as HTMLMdsInputDateElement
  await Promise.all([modal.componentOnReady(), host.componentOnReady()])
  const dropdown = host.shadowRoot?.querySelector('mds-dropdown') as HTMLMdsDropdownElement
  await dropdown.componentOnReady()

  let shown = false
  modal.addEventListener(
    'mdsModalShow',
    () => {
      shown = true
    },
    { once: true },
  )
  await userEvent.click(canvasElement.querySelector('#open-modal') as HTMLElement)
  await waitFor(() => expect(shown).toBe(true), { timeout: 5000 })

  await userEvent.click(host.shadowRoot?.querySelector('#calendar-dropdown') as HTMLElement)
  await waitFor(() => expect(dropdown).toHaveAttribute('visible'), { timeout: 5000 })
  await waitForSettled(dropdown)

  return {
    host,
    dropdown,
    calendar: dropdown.querySelector('mds-calendar') as HTMLMdsCalendarElement,
  }
}

// The calendar takes the field width (100cqw of the input-date host) capped by its own max-width,
// with seven evenly sized columns; the dropdown ends at the field's right edge (placement
// bottom-end), pushed past it by at most the dropdown arrow padding.
const expectCalendarSizedToField = ({ host, dropdown, calendar }): void => {
  const { width: fieldWidth, right: fieldRight } = host.getBoundingClientRect()
  const maxWidth = parseFloat(getComputedStyle(calendar).maxWidth)
  const { width } = calendar.getBoundingClientRect()
  expect(maxWidth).toBeGreaterThan(0)
  expect(width).toBeCloseTo(Math.min(fieldWidth, maxWidth), 0)

  const cells = calendar.shadowRoot?.querySelector('.month-view__cells') as HTMLElement
  const tracks = getComputedStyle(cells).gridTemplateColumns.split(' ').map(parseFloat)
  expect(tracks).toHaveLength(7)
  tracks.forEach(track => expect(track).toBeCloseTo(tracks[0], 0))

  // sub-pixel rounding aside, the dropdown never starts before the field's end
  const overshoot = dropdown.getBoundingClientRect().right - fieldRight
  expect(overshoot).toBeGreaterThanOrEqual(-1)
  expect(overshoot).toBeLessThanOrEqual(dropdown.arrowPadding)
}

export const UseCaseInsideModal = {
  render: InsideModalTemplate,

  play: async context => {
    expectCalendarSizedToField(await openModalAndCalendar(context))
  },
}
