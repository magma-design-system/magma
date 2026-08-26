import { newE2EPage, E2EPage } from '@stencil/core/testing';
import { mockIconResponse } from '@test/mock';

/**
 * A paginator narrow enough for the pages strip to overflow, with the instant
 * scroll behaviour so that every scroll is applied synchronously.
 */
const NARROW_PAGINATOR =
  '<mds-paginator pages="32" style="width: 320px; --mds-paginator-scroll-behavior: auto"></mds-paginator>';

/** Strip items start from page 2, so page `n` is the `n - 1`th child of `.pages` */
const stripItemSelector = (page: number): string =>
  `.pages mds-paginator-item:nth-child(${page - 1})`;

/**
 * Scrolls the strip just enough to reveal the item (nearest edge, the way a user
 * would scroll before clicking it) and returns the viewport coordinates of its center.
 */
const revealStripItem = (page: E2EPage, selector: string): Promise<{ x: number; y: number }> =>
  page.evaluate((itemSelector: string) => {
    const item = document
      .querySelector('mds-paginator')
      ?.shadowRoot?.querySelector<HTMLElement>(itemSelector);
    if (!item) throw new Error(`Item ${itemSelector} not found`);
    item.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    const rect = item.getBoundingClientRect();
    return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
  }, selector);

const stripGeometry = (
  page: E2EPage,
): Promise<{ scrollLeft: number; focusedPage: string | null; focusedItemOffset: number | null }> =>
  page.evaluate(() => {
    const root = document.querySelector('mds-paginator')?.shadowRoot;
    const strip = root?.querySelector<HTMLElement>('.pages');
    const focused = root?.activeElement as HTMLElement | null;
    if (!strip) throw new Error('Strip not found');
    const stripRect = strip.getBoundingClientRect();
    const focusedRect = focused?.getBoundingClientRect();
    return {
      scrollLeft: strip.scrollLeft,
      focusedPage: focused?.textContent?.trim() ?? null,
      focusedItemOffset: focusedRect
        ? focusedRect.x + focusedRect.width / 2 - (stripRect.x + stripRect.width / 2)
        : null,
    };
  });

describe('mds-paginator', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    mockIconResponse(page);
    await page.setContent('<mds-paginator></mds-paginator>');

    const element = await page.find('mds-paginator');
    expect(element).toHaveAttribute('hydrated');
    expect(true).toBe(true);
  });

  it('selects the clicked page even when the item is at the edge of the strip', async () => {
    const page = await newE2EPage();
    mockIconResponse(page);
    await page.setContent(NARROW_PAGINATOR);
    const changeSpy = await page.spyOnEvent('mdsPaginatorChange');
    await page.waitForChanges();

    const { x, y } = await revealStripItem(page, stripItemSelector(9));
    await page.mouse.click(x, y);
    await page.waitForChanges();

    const paginator = await page.find('mds-paginator');
    const item = await page.find(`mds-paginator >>> ${stripItemSelector(9)}`);
    expect(await paginator.getProperty('currentPage')).toBe(9);
    expect(item).toHaveAttribute('selected');
    expect(changeSpy.lastEvent.detail.page).toBe(9);
  });

  it('keeps centering the strip on the item focused from the keyboard', async () => {
    const page = await newE2EPage();
    mockIconResponse(page);
    await page.setContent(NARROW_PAGINATOR);
    await page.waitForChanges();

    // prev arrow, page 1, then pages 2..7 inside the strip
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press('Tab');
    }
    await page.waitForChanges();

    const { scrollLeft, focusedPage, focusedItemOffset } = await stripGeometry(page);
    const paginator = await page.find('mds-paginator');
    expect(focusedPage).toBe('7');
    expect(scrollLeft).toBeGreaterThan(0);
    expect(Math.abs(focusedItemOffset ?? Infinity)).toBeLessThan(2);
    expect(await paginator.getProperty('currentPage')).toBe(1);
  });
});
