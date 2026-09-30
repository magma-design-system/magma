import { render, vi } from '@stencil/vitest';
import { userEvent } from 'vitest/browser';
import { mockIconFetch } from '@test/fetch';

type RecordedChange = { page: number; caller: string | null };

type Paginator = { host: HTMLMdsPaginatorElement; waitForChanges: () => Promise<void> };

/**
 * A paginator narrow enough for the pages strip to overflow, with the instant
 * scroll behaviour so that every scroll is applied synchronously.
 */
const NARROW_PAGINATOR =
  '<mds-paginator pages="32" style="width: 320px; --mds-paginator-scroll-behavior: auto"></mds-paginator>';

const PREV_ARROW = '.item-icon:first-of-type';
const NEXT_ARROW = '.item-icon:last-of-type';
const FIRST_PAGE = '.item-first';
const LAST_PAGE = '.item-last';

/** Strip items start from page 2, so page `n` is the `n - 1`th child of `.pages` */
const stripItemSelector = (page: number): string =>
  `.pages mds-paginator-item:nth-child(${page - 1})`;

const getItem = (host: HTMLElement, selector: string): HTMLElement => {
  const item = host.shadowRoot!.querySelector<HTMLElement>(selector);
  if (!item) throw new Error(`Item ${selector} not found`);
  return item;
};

/**
 * Clicks an item of the paginator. With `reveal` the strip is first scrolled just
 * enough to show the item (nearest edge, the way a user would scroll before clicking it);
 * `force` clicks a disabled item as a pointer would, skipping the actionability checks.
 */
const clickItem = async (
  { host, waitForChanges }: Paginator,
  selector: string,
  { reveal = false, force = false } = {},
): Promise<void> => {
  const item = getItem(host, selector);
  if (reveal) item.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  await userEvent.click(item, { force });
  await waitForChanges();
};

const stripGeometry = (
  host: HTMLElement,
): { scrollLeft: number; focusedPage: string | null; focusedItemOffset: number | null } => {
  const root = host.shadowRoot!;
  const strip = root.querySelector<HTMLElement>('.pages');
  const focused = root.activeElement as HTMLElement | null;
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
};

const pressTab = async (times: number, waitForChanges: () => Promise<void>): Promise<void> => {
  for (let i = 0; i < times; i++) {
    await userEvent.tab();
  }
  await waitForChanges();
};

describe('mds-paginator', () => {
  beforeEach(mockIconFetch);

  it('renders', async () => {
    const { root } = await render('<mds-paginator></mds-paginator>');

    expect(root).toHaveAttribute('hydrated');
  });

  it('selects the clicked page even when the item is at the edge of the strip', async () => {
    const { root, spyOnEvent, waitForChanges } =
      await render<HTMLMdsPaginatorElement>(NARROW_PAGINATOR);
    const changeSpy = spyOnEvent('mdsPaginatorChange');

    await clickItem({ host: root, waitForChanges }, stripItemSelector(9), { reveal: true });

    expect(root.currentPage).toBe(9);
    expect(getItem(root, stripItemSelector(9))).toHaveAttribute('selected');
    expect(changeSpy.lastEvent?.detail.page).toBe(9);
  });

  it('keeps centering the strip on the item focused from the keyboard', async () => {
    const { root, waitForChanges } = await render<HTMLMdsPaginatorElement>(NARROW_PAGINATOR);

    // prev arrow, page 1, then pages 2..7 inside the strip
    await pressTab(8, waitForChanges);

    const { scrollLeft, focusedPage, focusedItemOffset } = stripGeometry(root);
    expect(focusedPage).toBe('7');
    expect(scrollLeft).toBeGreaterThan(0);
    expect(Math.abs(focusedItemOffset ?? Infinity)).toBeLessThan(2);
    expect(root.currentPage).toBe(1);
  });

  describe('mdsPaginatorChange', () => {
    /**
     * Records every `mdsPaginatorChange` from a listener attached before the component
     * is rendered: the initial sync is emitted 10ms after load, so a spy attached after
     * hydration would be too late. Each record keeps the page and the caller as `tag.class`.
     */
    let changes: RecordedChange[];
    const recordChange = (event: Event): void => {
      const { page, caller } = (event as CustomEvent).detail;
      changes.push({
        page,
        caller: caller ? `${caller.tagName.toLowerCase()}.${caller.className}` : null,
      });
    };

    beforeEach(() => {
      changes = [];
      document.addEventListener('mdsPaginatorChange', recordChange);
    });

    afterEach(() => {
      document.removeEventListener('mdsPaginatorChange', recordChange);
    });

    const newRecordedPaginator = async (html: string): Promise<Paginator> => {
      const { root, waitForChanges } = await render<HTMLMdsPaginatorElement>(html);
      await waitForChanges();
      return { host: root, waitForChanges };
    };

    const waitForRecordedChanges = (count: number): Promise<void> =>
      vi.waitFor(() => {
        if (changes.length < count) throw new Error(`waiting for ${count} changes`);
      });

    it('emits the initial page once on load, without a caller', async () => {
      const { waitForChanges } = await newRecordedPaginator(
        '<mds-paginator pages="10" current-page="4"></mds-paginator>',
      );
      await waitForRecordedChanges(1);
      await waitForChanges();

      expect(changes).toEqual([{ page: 4, caller: null }]);
    });

    it('does not emit on load when there are no pages', async () => {
      const { waitForChanges } = await newRecordedPaginator(
        '<mds-paginator pages="0"></mds-paginator>',
      );
      await new Promise((resolve) => setTimeout(resolve, 50));
      await waitForChanges();

      expect(changes).toEqual([]);
    });

    it('emits the target page with the pressed item as caller', async () => {
      const paginator = await newRecordedPaginator(
        '<mds-paginator pages="10" current-page="4"></mds-paginator>',
      );
      await waitForRecordedChanges(1);

      for (const selector of [NEXT_ARROW, PREV_ARROW, LAST_PAGE, FIRST_PAGE]) {
        await clickItem(paginator, selector);
      }

      expect(changes).toEqual([
        { page: 4, caller: null },
        { page: 5, caller: 'mds-paginator-item.item-icon' },
        { page: 4, caller: 'mds-paginator-item.item-icon' },
        { page: 10, caller: 'mds-paginator-item.item-last' },
        { page: 1, caller: 'mds-paginator-item.item-first' },
      ]);
      expect(paginator.host.currentPage).toBe(1);
    });

    it('does not emit when the disabled arrow or the selected page is clicked', async () => {
      const paginator = await newRecordedPaginator('<mds-paginator pages="10"></mds-paginator>');
      await waitForRecordedChanges(1);

      for (const selector of [PREV_ARROW, FIRST_PAGE]) {
        await clickItem(paginator, selector, { force: true });
      }

      expect(changes).toEqual([{ page: 1, caller: null }]);
      expect(paginator.host.currentPage).toBe(1);
    });

    it('does not emit when an item is focused from the keyboard, and emits it on Enter', async () => {
      const { host, waitForChanges } = await newRecordedPaginator(NARROW_PAGINATOR);
      await waitForRecordedChanges(1);

      // prev arrow, page 1, page 2, page 3
      await pressTab(4, waitForChanges);
      expect(changes).toEqual([{ page: 1, caller: null }]);

      await userEvent.keyboard('{Enter}');
      await waitForChanges();

      expect(changes).toEqual([
        { page: 1, caller: null },
        { page: 3, caller: 'mds-paginator-item.item' },
      ]);
      expect(host.currentPage).toBe(3);
    });
  });
});
