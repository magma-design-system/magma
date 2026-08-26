import { newE2EPage, E2EPage } from '@stencil/core/testing'
import { mockIconResponse } from '@test/mock'

type RecordedChange = { page: number, caller: string | null }

declare global {
  interface Window {
    mdsPaginatorChanges: RecordedChange[]
  }
}

/**
 * A paginator narrow enough for the pages strip to overflow, with the instant
 * scroll behaviour so that every scroll is applied synchronously.
 */
const NARROW_PAGINATOR = '<mds-paginator pages="32" style="width: 320px; --mds-paginator-scroll-behavior: auto"></mds-paginator>'

const PREV_ARROW = '.item-icon:first-of-type'
const NEXT_ARROW = '.item-icon:last-of-type'
const FIRST_PAGE = '.item-first'
const LAST_PAGE = '.item-last'

/** Strip items start from page 2, so page `n` is the `n - 1`th child of `.pages` */
const stripItemSelector = (page: number): string => `.pages mds-paginator-item:nth-child(${page - 1})`

/**
 * Returns the viewport coordinates of the center of an item of the paginator.
 * With `reveal` the strip is first scrolled just enough to show the item (nearest
 * edge, the way a user would scroll before clicking it).
 */
const itemCenter = (page: E2EPage, selector: string, reveal = false): Promise<{ x: number, y: number }> =>
  page.evaluate((itemSelector: string, revealItem: boolean) => {
    const item = document.querySelector('mds-paginator')?.shadowRoot?.querySelector<HTMLElement>(itemSelector)
    if (!item) throw new Error(`Item ${itemSelector} not found`)
    if (revealItem) item.scrollIntoView({ block: 'nearest', inline: 'nearest' })
    const rect = item.getBoundingClientRect()
    return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }
  }, selector, reveal)

const stripGeometry = (page: E2EPage): Promise<{ scrollLeft: number, focusedPage: string | null, focusedItemOffset: number | null }> =>
  page.evaluate(() => {
    const root = document.querySelector('mds-paginator')?.shadowRoot
    const strip = root?.querySelector<HTMLElement>('.pages')
    const focused = root?.activeElement as HTMLElement | null
    if (!strip) throw new Error('Strip not found')
    const stripRect = strip.getBoundingClientRect()
    const focusedRect = focused?.getBoundingClientRect()
    return {
      scrollLeft: strip.scrollLeft,
      focusedPage: focused?.textContent?.trim() ?? null,
      focusedItemOffset: focusedRect
        ? focusedRect.x + focusedRect.width / 2 - (stripRect.x + stripRect.width / 2)
        : null,
    }
  })

/**
 * Records every `mdsPaginatorChange` from inside the page, before the component is
 * even defined: the event spy of the test runner is attached after hydration (too
 * late for the initial sync, emitted 10ms after load) and it cannot serialize the
 * `caller` element. Each record keeps the page and the caller as `tag.class`.
 */
const recordChangeEvents = async (page: E2EPage): Promise<void> => {
  await page.evaluateOnNewDocument(() => {
    window.mdsPaginatorChanges = []
    document.addEventListener('mdsPaginatorChange', (ev: Event) => {
      const { page: selected, caller } = (ev as CustomEvent).detail
      window.mdsPaginatorChanges.push({
        page: selected,
        caller: caller ? `${caller.tagName.toLowerCase()}.${caller.className}` : null,
      })
    })
  })
}

const recordedChanges = (page: E2EPage): Promise<RecordedChange[]> =>
  page.evaluate(() => window.mdsPaginatorChanges)

const waitForRecordedChanges = (page: E2EPage, count: number): Promise<unknown> =>
  page.waitForFunction((expected: number) => window.mdsPaginatorChanges.length >= expected, {}, count)

const newRecordedPage = async (html: string): Promise<E2EPage> => {
  const page = await newE2EPage()
  mockIconResponse(page)
  await recordChangeEvents(page)
  await page.setContent(html)
  await page.waitForChanges()
  return page
}

describe('mds-paginator', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    mockIconResponse(page)
    await page.setContent('<mds-paginator></mds-paginator>')

    const element = await page.find('mds-paginator')
    expect(element).toHaveAttribute('hydrated')
    expect(true).toBe(true)
  })

  it('selects the clicked page even when the item is at the edge of the strip', async () => {
    const page = await newE2EPage()
    mockIconResponse(page)
    await page.setContent(NARROW_PAGINATOR)
    const changeSpy = await page.spyOnEvent('mdsPaginatorChange')
    await page.waitForChanges()

    const { x, y } = await itemCenter(page, stripItemSelector(9), true)
    await page.mouse.click(x, y)
    await page.waitForChanges()

    const paginator = await page.find('mds-paginator')
    const item = await page.find(`mds-paginator >>> ${stripItemSelector(9)}`)
    expect(await paginator.getProperty('currentPage')).toBe(9)
    expect(item).toHaveAttribute('selected')
    expect(changeSpy.lastEvent.detail.page).toBe(9)
  })

  it('keeps centering the strip on the item focused from the keyboard', async () => {
    const page = await newE2EPage()
    mockIconResponse(page)
    await page.setContent(NARROW_PAGINATOR)
    await page.waitForChanges()

    // prev arrow, page 1, then pages 2..7 inside the strip
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press('Tab')
    }
    await page.waitForChanges()

    const { scrollLeft, focusedPage, focusedItemOffset } = await stripGeometry(page)
    const paginator = await page.find('mds-paginator')
    expect(focusedPage).toBe('7')
    expect(scrollLeft).toBeGreaterThan(0)
    expect(Math.abs(focusedItemOffset ?? Infinity)).toBeLessThan(2)
    expect(await paginator.getProperty('currentPage')).toBe(1)
  })

  describe('mdsPaginatorChange', () => {
    it('emits the initial page once on load, without a caller', async () => {
      const page = await newRecordedPage('<mds-paginator pages="10" current-page="4"></mds-paginator>')
      await waitForRecordedChanges(page, 1)
      await page.waitForChanges()

      expect(await recordedChanges(page)).toEqual([{ page: 4, caller: null }])
    })

    it('does not emit on load when there are no pages', async () => {
      const page = await newRecordedPage('<mds-paginator pages="0"></mds-paginator>')
      await new Promise(resolve => setTimeout(resolve, 50))
      await page.waitForChanges()

      expect(await recordedChanges(page)).toEqual([])
    })

    it('emits the target page with the pressed item as caller', async () => {
      const page = await newRecordedPage('<mds-paginator pages="10" current-page="4"></mds-paginator>')
      await waitForRecordedChanges(page, 1)

      for (const selector of [NEXT_ARROW, PREV_ARROW, LAST_PAGE, FIRST_PAGE]) {
        const item = await page.find(`mds-paginator >>> ${selector}`)
        await item.click()
        await page.waitForChanges()
      }

      const paginator = await page.find('mds-paginator')
      expect(await recordedChanges(page)).toEqual([
        { page: 4, caller: null },
        { page: 5, caller: 'mds-paginator-item.item-icon' },
        { page: 4, caller: 'mds-paginator-item.item-icon' },
        { page: 10, caller: 'mds-paginator-item.item-last' },
        { page: 1, caller: 'mds-paginator-item.item-first' },
      ])
      expect(await paginator.getProperty('currentPage')).toBe(1)
    })

    it('does not emit when the disabled arrow or the selected page is clicked', async () => {
      const page = await newRecordedPage('<mds-paginator pages="10"></mds-paginator>')
      await waitForRecordedChanges(page, 1)

      for (const selector of [PREV_ARROW, FIRST_PAGE]) {
        const { x, y } = await itemCenter(page, selector)
        await page.mouse.click(x, y)
        await page.waitForChanges()
      }

      const paginator = await page.find('mds-paginator')
      expect(await recordedChanges(page)).toEqual([{ page: 1, caller: null }])
      expect(await paginator.getProperty('currentPage')).toBe(1)
    })

    it('does not emit when an item is focused from the keyboard, and emits it on Enter', async () => {
      const page = await newRecordedPage(NARROW_PAGINATOR)
      await waitForRecordedChanges(page, 1)

      // prev arrow, page 1, page 2, page 3
      for (let i = 0; i < 4; i++) {
        await page.keyboard.press('Tab')
      }
      await page.waitForChanges()
      expect(await recordedChanges(page)).toEqual([{ page: 1, caller: null }])

      await page.keyboard.press('Enter')
      await page.waitForChanges()

      const paginator = await page.find('mds-paginator')
      expect(await recordedChanges(page)).toEqual([
        { page: 1, caller: null },
        { page: 3, caller: 'mds-paginator-item.item' },
      ])
      expect(await paginator.getProperty('currentPage')).toBe(3)
    })
  })
})
