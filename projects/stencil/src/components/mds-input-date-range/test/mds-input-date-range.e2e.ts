import { newE2EPage } from '@stencil/core/testing'

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

    const openCalendar = await page.find('mds-input-date-range >>> .action-open-calendar')
    await openCalendar.click()
    await page.waitForChanges()

    const calendarWidth = await page.$eval('mds-input-date-range', element => {
      const calendar = element.shadowRoot?.querySelector('mds-calendar')
      return calendar?.getBoundingClientRect().width ?? 0
    })

    expect(calendarWidth).toBeGreaterThan(250)
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
      const firstCalendar = calendars[0]
      const secondCalendar = calendars[1]
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
})
