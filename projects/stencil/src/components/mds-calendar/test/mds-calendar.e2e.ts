import { newE2EPage } from '@stencil/core/testing'

describe('mds-calendar', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-calendar></mds-calendar>')

    const element = await page.find('mds-calendar')
    expect(element).toHaveAttribute('hydrated')
  })

  it('renders and selects adjacent month days', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-calendar view-date="2026-08-01"></mds-calendar>')
    await page.waitForChanges()

    const calendarCells = await page.findAll('mds-calendar >>> mds-calendar-cell')
    const otherMonthCell = await page.find(
      'mds-calendar >>> mds-calendar-cell[month="other"]',
    )

    expect(calendarCells.length).toBeGreaterThan(31)
    expect(otherMonthCell).not.toBeNull()
    expect(otherMonthCell.getAttribute('month')).toBe('other')

    await otherMonthCell.click()
    await page.waitForChanges()

    expect(otherMonthCell.getAttribute('selection')).toBe('single')
  })

  it('updates the visible range when end date is set after the start date', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-calendar view-date="2026-06-01" start-date="2026-06-02"></mds-calendar>')
    await page.waitForChanges()

    await page.$eval('mds-calendar', element => {
      element.setAttribute('end-date', '2026-07-24')
    })
    await page.waitForChanges()

    const juneLastDay = await page.find('mds-calendar >>> mds-calendar-cell[date="2026-06-30"]')
    const julyVisibleDay = await page.find('mds-calendar >>> mds-calendar-cell[date="2026-07-05"]')

    expect(juneLastDay.getAttribute('selection')).toBe('middle')
    expect(julyVisibleDay.getAttribute('selection')).toBe('middle')
  })

  it('previews the full visible range when hovering into the next month', async () => {
    const page = await newE2EPage()
    await page.setContent(
      '<mds-calendar view-date="2026-06-01" start-date="2026-06-02" hover-date="2026-07-24"></mds-calendar>',
    )
    await page.waitForChanges()

    const juneLastDay = await page.find('mds-calendar >>> mds-calendar-cell[date="2026-06-30"]')
    const julyVisibleDay = await page.find('mds-calendar >>> mds-calendar-cell[date="2026-07-05"]')

    expect(juneLastDay).toHaveAttribute('preview')
    expect(juneLastDay.getAttribute('selection')).toBe('middle')
    expect(julyVisibleDay).toHaveAttribute('preview')
    expect(julyVisibleDay.getAttribute('selection')).toBe('middle')
  })

  it('switches to month selection when clicking the month action by default', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-calendar view-date="2026-06-01"></mds-calendar>')
    await page.waitForChanges()

    const actionMonth = await page.find('mds-calendar >>> .action-month')
    await actionMonth.click()
    await page.waitForChanges()

    const monthSelection = await page.find('mds-calendar >>> .month-selection')

    expect(monthSelection).not.toBeNull()
  })

  it('switches to year selection when clicking the year action by default', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-calendar view-date="2026-06-01"></mds-calendar>')
    await page.waitForChanges()

    const actionYear = await page.find('mds-calendar >>> .action-year')
    await actionYear.click()
    await page.waitForChanges()

    const yearSelection = await page.find('mds-calendar >>> .year-selection')

    expect(yearSelection).not.toBeNull()
  })

  it('does not switch view when month or year selection is disabled', async () => {
    const page = await newE2EPage()
    await page.setContent(
      '<mds-calendar view-date="2026-06-01" disable-month-year-selection="true"></mds-calendar>',
    )
    await page.waitForChanges()

    const actionMonth = await page.find('mds-calendar >>> .action-month')
    const actionYear = await page.find('mds-calendar >>> .action-year')

    await actionMonth.click()
    await actionYear.click()
    await page.waitForChanges()

    const monthView = await page.find('mds-calendar >>> .month-view')
    const monthSelection = await page.find('mds-calendar >>> .month-selection')
    const yearSelection = await page.find('mds-calendar >>> .year-selection')

    expect(monthView).not.toBeNull()
    expect(monthSelection).toBeNull()
    expect(yearSelection).toBeNull()
  })
})

describe('mds-calendar sizing', () => {
  it('renders at its max-width when the container is wider', async () => {
    const page = await newE2EPage()
    await page.setViewport({ width: 1280, height: 800 })
    await page.setContent('<div style="width: 800px;"><mds-calendar view-date="2026-08-01"></mds-calendar></div>')
    await page.waitForChanges()

    const width = await page.$eval('mds-calendar', element => (element as HTMLElement).offsetWidth)

    expect(width).toBe(380)
  })

  it('does not let the week-day header inflate its intrinsic width beyond max-width', async () => {
    const page = await newE2EPage()
    await page.setViewport({ width: 1280, height: 800 })
    // `min-width: max-content` is what mds-input-date used to apply: it must not blow the calendar
    // past its own max-width, otherwise the used min-width wins over max-width.
    await page.setContent(`
      <div style="display: inline-block;">
        <mds-calendar view-date="2026-08-01" style="min-width: max-content;"></mds-calendar>
      </div>
    `)
    await page.waitForChanges()

    const width = await page.$eval('mds-calendar', element => (element as HTMLElement).offsetWidth)

    expect(width).toBeLessThanOrEqual(380)
  })

  it('sizes the week-day header cells from the grid track', async () => {
    const page = await newE2EPage()
    await page.setViewport({ width: 1280, height: 800 })
    await page.setContent('<div style="width: 800px;"><mds-calendar view-date="2026-08-01"></mds-calendar></div>')
    await page.waitForChanges()

    const metrics = await page.$eval('mds-calendar', element => {
      const header = element.shadowRoot?.querySelector('.week-day-name') as HTMLElement
      const cell = element.shadowRoot?.querySelector('mds-calendar-cell') as HTMLElement
      return {
        headerHeight: header.offsetHeight,
        headerWidth: header.offsetWidth,
        cellWidth: cell.offsetWidth,
      }
    })

    expect(metrics.headerHeight).toBe(48)
    expect(metrics.headerWidth).toBe(metrics.cellWidth)
    expect(metrics.cellWidth).toBe(48)
  })
})
