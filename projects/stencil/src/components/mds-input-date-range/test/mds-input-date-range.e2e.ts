import { E2EPage, newE2EPage } from '@stencil/core/testing'

type DateRangeDetail = {
  startDate: string
  endDate: string
}

type DateRangeEvents = {
  valueChange: DateRangeDetail[]
}

declare global {
  interface Window {
    __dateRangeEvents?: DateRangeEvents
  }
}

type CalendarLayout = {
  width: number
  declaredWidth: number
  overflows: boolean
}

// The dropdown becomes visible on the caller click, then floating-ui places it asynchronously while
// its opening transition (a scale) plays: on a slow runner a measure taken right after the click
// still sees the closed dropdown, and every calendar in it is 0px wide.
const openCalendarDropdown = async (page: E2EPage): Promise<void> => {
  const openCalendar = await page.find('mds-input-date-range >>> .action-open-calendar')
  await openCalendar.click()
  await page.waitForChanges()
  await page.waitForFunction(
    () => {
      const dropdown = document.querySelector('mds-input-date-range')?.shadowRoot?.querySelector('mds-dropdown')
      if (!dropdown || !dropdown.hasAttribute('visible')) return false
      const { transform } = getComputedStyle(dropdown)
      return transform === 'none' || transform === 'matrix(1, 0, 0, 1, 0, 0)'
    },
    { timeout: 5000 },
  )
}

// The width the component assigns to each calendar (--mds-input-date-range-calendar-width) reaches
// the browser as the calendar's min-inline-size: a calendar squeezed by the panel or by a sibling is
// narrower than that, and its nav row overflows it.
const readCalendarLayouts = (page: E2EPage): Promise<CalendarLayout[]> =>
  page.$eval('mds-input-date-range', element =>
    Array.from(element.shadowRoot?.querySelectorAll('mds-calendar') ?? []).map(calendar => ({
      width: calendar.getBoundingClientRect().width,
      declaredWidth: parseFloat(getComputedStyle(calendar).minInlineSize),
      overflows: calendar.scrollWidth > calendar.clientWidth,
    })),
  )

const expectCalendarNotShrunk = ({ width, declaredWidth, overflows }: CalendarLayout): void => {
  expect(declaredWidth).toBeGreaterThan(0)
  expect(width).toBeCloseTo(declaredWidth, 0)
  expect(overflows).toBe(false)
}

describe('mds-input-date-range', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-input-date-range></mds-input-date-range>')

    const element = await page.find('mds-input-date-range')
    expect(element).toHaveAttribute('hydrated')
  })

  it('is form-associated and sets form value', async () => {
    const page = await newE2EPage()
    await page.setContent(`
      <form>
        <mds-input-date-range name="period" start-date="2026-01-01" end-date="2026-01-10">
          <mds-input-date slot="start"></mds-input-date>
          <mds-input-date slot="end"></mds-input-date>
        </mds-input-date-range>
      </form>
    `)
    await page.waitForChanges()

    const isFormAssociated = await page.$eval('mds-input-date-range', element => {
      return (element.constructor as typeof HTMLElement & { formAssociated?: boolean }).formAssociated === true
    })
    expect(isFormAssociated).toBe(true)

    const formValue = await page.$eval('form', form => {
      const formData = new FormData(form as HTMLFormElement)
      return formData.get('period')
    })

    expect(formValue).toBe(JSON.stringify({ startDate: '2026-01-01', endDate: '2026-01-10' }))
  })

  it('renders a single calendar by default', async () => {
    const page = await newE2EPage()
    await page.setContent(`
      <mds-input-date-range>
        <mds-input-date slot="start"></mds-input-date>
        <mds-input-date slot="end"></mds-input-date>
      </mds-input-date-range>
    `)
    await page.waitForChanges()

    const calendars = await page.findAll('mds-input-date-range >>> mds-calendar')
    expect(calendars).toHaveLength(1)
  })

  it('keeps a usable width for the single calendar when opened', async () => {
    const page = await newE2EPage()
    await page.setContent(`
      <mds-input-date-range>
        <mds-input-date slot="start"></mds-input-date>
        <mds-input-date slot="end"></mds-input-date>
      </mds-input-date-range>
    `)
    await page.waitForChanges()

    await openCalendarDropdown(page)

    const layouts = await readCalendarLayouts(page)

    expect(layouts).toHaveLength(1)
    expectCalendarNotShrunk(layouts[0])
  })

  it('shows and applies preselection values when a preselection is clicked', async () => {
    const page = await newE2EPage()
    await page.setContent(`
      <mds-input-date-range>
        <mds-input-date slot="start"></mds-input-date>
        <mds-input-date slot="end"></mds-input-date>
        <mds-input-date-range-preselection start="2026-06-02" end="2026-06-08">
          Questa settimana
        </mds-input-date-range-preselection>
      </mds-input-date-range>
    `)
    await page.waitForChanges()

    await openCalendarDropdown(page)

    const preselectionVisible = await page.$eval('mds-input-date-range', element => {
      const calendar = element.shadowRoot?.querySelector('mds-calendar')
      const panel = element.shadowRoot?.querySelector('.calendar-preselection-panel')
      const preselection = calendar?.shadowRoot?.querySelector('.calendar-preselection')
      const panelRect = panel?.getBoundingClientRect()
      const calendarRect = calendar?.getBoundingClientRect()

      return {
        panelExists: panel !== null,
        internalVisible: preselection?.classList.contains('calendar-preselection--has-preselection') ?? false,
        panelIsOnTheLeft:
          panelRect !== undefined &&
          calendarRect !== undefined &&
          panelRect.right <= calendarRect.left,
      }
    })
    const layouts = await readCalendarLayouts(page)

    expect(preselectionVisible.panelExists).toBe(true)
    expect(preselectionVisible.internalVisible).toBe(false)
    expect(preselectionVisible.panelIsOnTheLeft).toBe(true)
    expect(layouts).toHaveLength(1)
    expectCalendarNotShrunk(layouts[0])

    await page.$eval('mds-input-date-range-preselection', element => {
      const button = element.shadowRoot?.querySelector('.action') as HTMLElement | null
      button?.click()
    })
    await page.waitForChanges()

    const selectedRange = await page.$eval('mds-input-date-range', element => {
      const startInput = element.querySelector('mds-input-date[slot="start"]')
      const endInput = element.querySelector('mds-input-date[slot="end"]')

      return {
        startDate: startInput?.getAttribute('value') ?? '',
        endDate: endInput?.getAttribute('value') ?? '',
      }
    })

    expect(selectedRange).toEqual({
      startDate: '2026-06-02',
      endDate: '2026-06-08',
    })
  })

  it('renders dual calendar preselection outside the first calendar without shrinking the calendars', async () => {
    const page = await newE2EPage()
    await page.setContent(`
      <mds-input-date-range dual-calendar="true">
        <mds-input-date slot="start"></mds-input-date>
        <mds-input-date slot="end"></mds-input-date>
        <mds-input-date-range-preselection start="2026-06-02" end="2026-06-08">
          Questa settimana
        </mds-input-date-range-preselection>
      </mds-input-date-range>
    `)
    await page.waitForChanges()

    await openCalendarDropdown(page)

    const layout = await page.$eval('mds-input-date-range', element => {
      const panel = element.shadowRoot?.querySelector('.calendar-preselection-panel')
      const calendars = Array.from(element.shadowRoot?.querySelectorAll('mds-calendar') ?? [])
      const firstCalendarPreselection = calendars[0]?.shadowRoot?.querySelector('.calendar-preselection')

      return {
        panelExists: panel !== null,
        firstCalendarShowsPreselection:
          firstCalendarPreselection?.classList.contains('calendar-preselection--has-preselection') ?? false,
      }
    })
    const layouts = await readCalendarLayouts(page)

    expect(layout.panelExists).toBe(true)
    expect(layout.firstCalendarShowsPreselection).toBe(false)
    expect(layouts).toHaveLength(2)
    layouts.forEach(expectCalendarNotShrunk)
  })

  it('keeps the visible months anchored when the first selection starts in the last visible calendar', async () => {
    const page = await newE2EPage()
    await page.setContent(`
      <mds-input-date-range dual-calendar="true">
        <mds-input-date slot="start"></mds-input-date>
        <mds-input-date slot="end"></mds-input-date>
      </mds-input-date-range>
    `)
    await page.waitForChanges()

    await page.$eval('mds-input-date-range', element => {
      const calendars = Array.from(element.shadowRoot?.querySelectorAll('mds-calendar') ?? [])
      calendars[0]?.dispatchEvent(
        new CustomEvent('mdsCalendarNavigate', {
          bubbles: true,
          composed: true,
          detail: { currentDate: '2026-06-01' },
        }),
      )
    })
    await page.waitForChanges()

    const initialViewDates = await page.$eval('mds-input-date-range', element => {
      return Array.from(element.shadowRoot?.querySelectorAll('mds-calendar') ?? []).map(calendar =>
        calendar.getAttribute('view-date'),
      )
    })

    expect(initialViewDates).toEqual(['2026-06-01', '2026-07-01'])

    await page.$eval('mds-input-date-range', element => {
      const calendars = Array.from(element.shadowRoot?.querySelectorAll('mds-calendar') ?? [])
      calendars[1]?.dispatchEvent(
        new CustomEvent('mdsCalendarChange', {
          bubbles: true,
          composed: true,
          detail: { startDate: '2026-07-24' },
        }),
      )
    })
    await page.waitForChanges()

    const updatedViewDates = await page.$eval('mds-input-date-range', element => {
      return Array.from(element.shadowRoot?.querySelectorAll('mds-calendar') ?? []).map(calendar =>
        calendar.getAttribute('view-date'),
      )
    })

    expect(updatedViewDates).toEqual(['2026-06-01', '2026-07-01'])
  })

  it('treats the first click in the last visible calendar as the end date when hovering left', async () => {
    const page = await newE2EPage()
    await page.setContent(`
      <mds-input-date-range dual-calendar="true">
        <mds-input-date slot="start"></mds-input-date>
        <mds-input-date slot="end"></mds-input-date>
      </mds-input-date-range>
    `)
    await page.waitForChanges()

    await page.$eval('mds-input-date-range', element => {
      const calendars = Array.from(element.shadowRoot?.querySelectorAll('mds-calendar') ?? [])

      calendars[0]?.dispatchEvent(
        new CustomEvent('mdsCalendarNavigate', {
          bubbles: true,
          composed: true,
          detail: { currentDate: '2026-06-01' },
        }),
      )

      calendars[1]?.dispatchEvent(
        new CustomEvent('mdsCalendarChange', {
          bubbles: true,
          composed: true,
          detail: { startDate: '2026-07-24' },
        }),
      )
    })
    await page.waitForChanges()

    await page.$eval('mds-input-date-range', element => {
      const calendars = Array.from(element.shadowRoot?.querySelectorAll('mds-calendar') ?? [])
      calendars[0]?.dispatchEvent(
        new CustomEvent('mdsCalendarHover', {
          bubbles: true,
          composed: true,
          detail: { hoverDate: '2026-06-02' },
        }),
      )
    })
    await page.waitForChanges()

    const selection = await page.$eval('mds-input-date-range', element => {
      const calendars = Array.from(element.shadowRoot?.querySelectorAll('mds-calendar') ?? [])
      const [firstCalendar, secondCalendar] = calendars
      const startCell = firstCalendar?.shadowRoot?.querySelector(
        'mds-calendar-cell[date="2026-06-02"]',
      )
      const endCell = secondCalendar?.shadowRoot?.querySelector(
        'mds-calendar-cell[date="2026-07-24"]',
      )

      return {
        startSelection: startCell?.getAttribute('selection'),
        startPreview: startCell?.hasAttribute('preview'),
        endSelection: endCell?.getAttribute('selection'),
        endPreview: endCell?.hasAttribute('preview'),
      }
    })

    expect(selection).toEqual({
      startSelection: 'start',
      startPreview: true,
      endSelection: 'end',
      endPreview: true,
    })
  })

  it('does not emit selected range when a preselection contains invalid dates', async () => {
    const page = await newE2EPage()
    await page.setContent(`
      <mds-input-date-range>
        <mds-input-date slot="start"></mds-input-date>
        <mds-input-date slot="end"></mds-input-date>
        <mds-input-date-range-preselection start="invalid-date" end="2026-06-08">
          Intervallo non valido
        </mds-input-date-range-preselection>
      </mds-input-date-range>
    `)
    await page.waitForChanges()

    await page.$eval('mds-input-date-range', element => {
      const dateRangeEvents: DateRangeEvents = { valueChange: [] }
      window.__dateRangeEvents = dateRangeEvents

      element.addEventListener('mdsInputDateRangeValueChange', event => {
        dateRangeEvents.valueChange.push((event as CustomEvent<DateRangeDetail>).detail)
      })
    })

    await openCalendarDropdown(page)

    await page.$eval('mds-input-date-range-preselection', element => {
      const button = element.shadowRoot?.querySelector('.action') as HTMLElement | null
      button?.click()
    })
    await page.waitForChanges()

    const emittedEvents = await page.evaluate(() => {
      return window.__dateRangeEvents ?? { valueChange: [] }
    })

    expect(emittedEvents).toEqual({
      valueChange: [],
    })
  })

  it('does not emit value change when the calendar change contains invalid dates', async () => {
    const page = await newE2EPage()
    await page.setContent(`
      <mds-input-date-range>
        <mds-input-date slot="start"></mds-input-date>
        <mds-input-date slot="end"></mds-input-date>
      </mds-input-date-range>
    `)
    await page.waitForChanges()

    await page.$eval('mds-input-date-range', element => {
      const dateRangeEvents: DateRangeEvents = { valueChange: [] }
      window.__dateRangeEvents = dateRangeEvents

      element.addEventListener('mdsInputDateRangeValueChange', event => {
        dateRangeEvents.valueChange.push((event as CustomEvent<DateRangeDetail>).detail)
      })
    })

    await openCalendarDropdown(page)

    await page.$eval('mds-input-date-range', element => {
      const calendar = element.shadowRoot?.querySelector('mds-calendar')

      calendar?.dispatchEvent(
        new CustomEvent('mdsCalendarChange', {
          bubbles: true,
          composed: true,
          detail: { startDate: 'invalid-date', endDate: '2026-06-08' },
        }),
      )
    })
    await page.waitForChanges()

    const emittedEvents = await page.evaluate(() => {
      return window.__dateRangeEvents ?? { valueChange: [] }
    })
    expect(emittedEvents).toEqual({ valueChange: [] })
  })

  it('does not emit value change on focusout when the range is invalid', async () => {
    const page = await newE2EPage()
    await page.setContent(`
      <mds-input-date-range start-date="invalid-date" end-date="2026-06-08">
        <mds-input-date slot="start"></mds-input-date>
        <mds-input-date slot="end"></mds-input-date>
      </mds-input-date-range>
    `)
    await page.waitForChanges()

    await page.$eval('mds-input-date-range', element => {
      const dateRangeEvents: DateRangeEvents = { valueChange: [] }
      window.__dateRangeEvents = dateRangeEvents

      element.addEventListener('mdsInputDateRangeValueChange', event => {
        dateRangeEvents.valueChange.push((event as CustomEvent<DateRangeDetail>).detail)
      })

      element.dispatchEvent(
        new FocusEvent('focusout', {
          bubbles: true,
          composed: true,
          relatedTarget: document.body,
        }),
      )
    })
    await page.waitForChanges()

    const emittedEvents = await page.evaluate(() => {
      return window.__dateRangeEvents ?? { valueChange: [] }
    })

    expect(emittedEvents).toEqual({
      valueChange: [],
    })
  })

  it('emits mdsInputDateRangeValueChange only once for the same range after selection and focusout', async () => {
    const page = await newE2EPage()
    await page.setContent(`
      <mds-input-date-range>
        <mds-input-date slot="start"></mds-input-date>
        <mds-input-date slot="end"></mds-input-date>
        <mds-input-date-range-preselection start="2026-06-02" end="2026-06-08">
          Questa settimana
        </mds-input-date-range-preselection>
      </mds-input-date-range>
    `)
    await page.waitForChanges()

    await page.$eval('mds-input-date-range', element => {
      const dateRangeEvents: DateRangeEvents = { valueChange: [] }
      window.__dateRangeEvents = dateRangeEvents

      element.addEventListener('mdsInputDateRangeValueChange', event => {
        dateRangeEvents.valueChange.push((event as CustomEvent<DateRangeDetail>).detail)
      })
    })

    await openCalendarDropdown(page)

    await page.$eval('mds-input-date-range-preselection', element => {
      const button = element.shadowRoot?.querySelector('.action') as HTMLElement | null
      button?.click()
    })
    await page.waitForChanges()

    await page.$eval('mds-input-date-range', element => {
      element.dispatchEvent(
        new FocusEvent('focusout', {
          bubbles: true,
          composed: true,
          relatedTarget: document.body,
        }),
      )
    })
    await page.waitForChanges()

    const emittedEvents = await page.evaluate(() => {
      return window.__dateRangeEvents ?? { valueChange: [] }
    })

    expect(emittedEvents.valueChange).toEqual([
      {
        startDate: '2026-06-02',
        endDate: '2026-06-08',
      },
    ])
  })
})
