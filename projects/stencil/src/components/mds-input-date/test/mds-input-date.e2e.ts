import { E2EPage, newE2EPage } from '@stencil/core/testing'

type DropdownMetrics = {
  calendarWidth: number
  dropdownLeft: number
  dropdownRight: number
  hostLeft: number
  hostRight: number
  tracks: number[]
  transform: string
}

const readDropdownMetrics = (page: E2EPage): Promise<DropdownMetrics> =>
  page.evaluate(() => {
    const host = document.querySelector('mds-input-date') as HTMLElement
    const dropdown = host.shadowRoot?.querySelector('mds-dropdown') as HTMLElement
    const calendar = dropdown.querySelector('mds-calendar') as HTMLElement
    const cells = calendar.shadowRoot?.querySelector('.month-view__cells') as HTMLElement
    return {
      calendarWidth: calendar.offsetWidth,
      dropdownLeft: dropdown.getBoundingClientRect().left,
      dropdownRight: dropdown.getBoundingClientRect().right,
      hostLeft: host.getBoundingClientRect().left,
      hostRight: host.getBoundingClientRect().right,
      tracks: getComputedStyle(cells).gridTemplateColumns.split(' ').map(parseFloat),
      transform: getComputedStyle(dropdown).transform,
    }
  })

// The dropdown animates in (scale transform) and floating-ui positions it asynchronously:
// wait until the opening transition has settled before measuring the geometry.
const waitForDropdownSettled = (page: E2EPage): Promise<unknown> =>
  page.waitForFunction(
    () => {
      const dropdown = document.querySelector('mds-input-date')?.shadowRoot?.querySelector('mds-dropdown')
      if (!dropdown || !dropdown.hasAttribute('visible')) return false
      const { transform } = getComputedStyle(dropdown)
      return transform === 'none' || transform === 'matrix(1, 0, 0, 1, 0, 0)'
    },
    { timeout: 5000 },
  )

const openCalendarDropdown = async (page: E2EPage): Promise<void> => {
  const openCalendar = await page.find('mds-input-date >>> #calendar-dropdown')
  await openCalendar.click()
  await page.waitForChanges()
  await waitForDropdownSettled(page)
}

const setupFieldInNarrowColumn = async (): Promise<E2EPage> => {
  const page = await newE2EPage()
  await page.setViewport({ width: 1280, height: 800 })
  await page.setContent(`
    <div style="width: 420px; margin: 40px auto;">
      <mds-input-date name="d"></mds-input-date>
    </div>
  `)
  await page.waitForChanges()
  return page
}

describe('mds-input-date', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-input-date></mds-input-date>')

    const element = await page.find('mds-input-date')
    expect(element).toHaveAttribute('hydrated')
  })

  describe('calendar dropdown sizing', () => {
    it('keeps the calendar within mds-calendar max-width with evenly sized day cells', async () => {
      const page = await setupFieldInNarrowColumn()
      await openCalendarDropdown(page)

      const { calendarWidth, tracks } = await readDropdownMetrics(page)

      // mds-calendar caps itself at 380px: 380 - 2 * 16px padding - 6 * 2px gaps = 7 * 48px tracks
      expect(calendarWidth).toBeLessThanOrEqual(380)
      expect(calendarWidth).toBeGreaterThanOrEqual(344)
      expect(tracks).toHaveLength(7)
      tracks.forEach(track => {
        expect(track).toBeGreaterThanOrEqual(40)
        expect(track).toBeLessThanOrEqual(50)
      })
    })

    it('anchors the dropdown to the end of the field (placement bottom-end)', async () => {
      const page = await setupFieldInNarrowColumn()
      await openCalendarDropdown(page)

      // floating-ui repositions on its own autoUpdate ticks: give it a moment to converge.
      await page
        .waitForFunction(
          () => {
            const host = document.querySelector('mds-input-date') as HTMLElement
            const dropdown = host.shadowRoot?.querySelector('mds-dropdown') as HTMLElement
            return dropdown.getBoundingClientRect().left >= host.getBoundingClientRect().left
          },
          { timeout: 3000 },
        )
        .catch(() => undefined)

      const { dropdownLeft, dropdownRight, hostLeft, hostRight } = await readDropdownMetrics(page)

      // The dropdown must stay within the field on the left, and end at the field's right edge.
      // The `arrow` middleware may push it past the field by at most `arrow-padding` (24px) so that
      // the arrow tip keeps pointing at the center of the 48px calendar button.
      expect(dropdownLeft).toBeGreaterThanOrEqual(hostLeft)
      expect(dropdownRight).toBeGreaterThanOrEqual(hostRight - 1)
      expect(dropdownRight).toBeLessThanOrEqual(hostRight + 24)
    })

    it('keeps the same calendar width after closing and reopening the dropdown', async () => {
      const page = await setupFieldInNarrowColumn()
      await openCalendarDropdown(page)
      const first = await readDropdownMetrics(page)

      await page.$eval('mds-input-date', element => {
        const dropdown = element.shadowRoot?.querySelector('mds-dropdown') as HTMLMdsDropdownElement
        dropdown.visible = false
      })
      await page.waitForChanges()
      await openCalendarDropdown(page)
      const second = await readDropdownMetrics(page)

      expect(second.calendarWidth).toBe(first.calendarWidth)
      expect(second.calendarWidth).toBeLessThanOrEqual(380)
    })
  })
})
