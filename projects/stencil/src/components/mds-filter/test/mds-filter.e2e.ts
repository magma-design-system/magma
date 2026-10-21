import { render } from '@stencil/vitest';
import { useLanguage } from '@test/language';

const ITEMS = [
  'Tutti',
  'Notizie',
  'Comunicati',
  'Aggiornamenti',
  'Eventi',
  'Bandi di gara',
  'Delibere',
]
  .map((label, i) => `<mds-filter-item label="${label}" value="${i}"></mds-filter-item>`)
  .join('');

/** The strip is narrow enough to scroll, and the whole filter is pushed right so
 * the light-DOM offsetParent of the items and the strip itself disagree. */
const stage = (offset: number) =>
  render(
    `<div style="margin-left: ${offset}px; width: 320px">
       <mds-filter id="filter" label="Categoria">${ITEMS}</mds-filter>
     </div>`,
  );

const strip = (root: HTMLElement): HTMLElement =>
  (root.querySelector('#filter') as HTMLElement).shadowRoot!.querySelector('.items') as HTMLElement;

const item = (root: HTMLElement, index: number): HTMLElement =>
  (root.querySelector('#filter') as HTMLElement).querySelectorAll('mds-filter-item')[
    index
  ] as HTMLElement;

/** How far the centre of the item is from the centre of the strip. */
const offCentre = (root: HTMLElement, index: number): number => {
  const box = strip(root).getBoundingClientRect();
  const target = item(root, index).getBoundingClientRect();
  return Math.abs(target.left + target.width / 2 - (box.left + box.width / 2));
};

describe('mds-filter', () => {
  it('renders', async () => {
    const { root } = await render('<mds-filter></mds-filter>');

    expect(root).toHaveAttribute('hydrated');
  });

  describe('scrolling the selected item into view', () => {
    it('centres the clicked item', async () => {
      const { root, waitForChanges } = await stage(0);

      item(root, 3).click();
      await waitForChanges();

      await vi.waitFor(() => {
        expect(offCentre(root, 3)).toBeLessThan(24);
      });
    });

    it('centres it just the same when the filter sits far from the left edge', async () => {
      const { root, waitForChanges } = await stage(420);

      item(root, 3).click();
      await waitForChanges();

      // the old measure added the distance of the component from the page, so the
      // scroll ran to the end of the strip and left the item against the left edge
      await vi.waitFor(() => {
        expect(offCentre(root, 3)).toBeLessThan(24);
      });
    });
  });

  // #941: a menu bar of menu items announced a navigation menu, and the reset button was named
  // after the SVG source of its icon
  describe('for assistive technologies', () => {
    const resetButton = (root: HTMLElement): HTMLElement | null =>
      root.shadowRoot!.querySelector('.reset-button');

    it('is a group named by its label', async () => {
      const { root } = await render('<mds-filter label="Stato"></mds-filter>');

      expect(root).toEqualAttributes({ role: 'group', 'aria-label': 'Stato' });
    });

    it('renders no reset button without reset', async () => {
      const { root } = await render(
        '<mds-filter><mds-filter-item label="Nuove" value="new" selected></mds-filter-item></mds-filter>',
      );

      // it used to be scaled away but still in the tab order
      expect(resetButton(root)).toBeNull();
    });

    it('names the reset button, an action with no pressed state, hidden while nothing is selected', async () => {
      const { root, waitForChanges } = await render(
        '<mds-filter reset multiple><mds-filter-item label="Nuove" value="new"></mds-filter-item></mds-filter>',
      );
      const button = resetButton(root)!;

      expect(button).toEqualAttributes({
        role: 'button',
        'aria-label': 'Clear filters',
        'aria-hidden': 'true',
        tabindex: '-1',
      });
      expect(button).not.toHaveAttribute('aria-pressed');

      root.querySelector('mds-filter-item')!.click();
      await waitForChanges();

      expect(button).not.toHaveAttribute('aria-hidden');
      expect(button).toEqualAttribute('tabindex', '0');
      expect(button).not.toHaveAttribute('aria-pressed');
    });

    it('clears the selection from the reset button and tells the application', async () => {
      const { root, spyOnEvent, waitForChanges } = await render(
        `<mds-filter reset multiple>
           <mds-filter-item label="Nuove" value="new" selected></mds-filter-item>
           <mds-filter-item label="Chiuse" value="closed" selected></mds-filter-item>
         </mds-filter>`,
      );
      const change = spyOnEvent('mdsFilterChange');

      resetButton(root)!.click();
      await waitForChanges();

      const items = Array.from(root.querySelectorAll('mds-filter-item'));
      expect(items.map((item) => item.selected)).toEqual([false, false]);
      expect(change).toHaveReceivedEventTimes(1);
      expect(change.lastEvent?.detail.value).toBe('');
      expect(resetButton(root)).toEqualAttribute('aria-hidden', 'true');
    });

    describe('in another language', () => {
      useLanguage('it');

      it('names the reset button in the language of the page', async () => {
        const { root } = await render('<mds-filter reset></mds-filter>');

        expect(resetButton(root)).toEqualAttribute('aria-label', 'Rimuovi i filtri');
      });
    });
  });

  // #942: the application keeps the filters elsewhere (the address, a store, a "Clear filters"
  // button outside the bar) and sets them on the items; the bar used to change their look only
  describe('selection set by the application', () => {
    const VALUES = ['new', 'open', 'closed'];
    const bar = (attributes: string, selected: string[] = []) =>
      render(
        `<mds-filter ${attributes}>${VALUES.map(
          (value) =>
            `<mds-filter-item label="${value}" value="${value}"${selected.includes(value) ? ' selected' : ''}></mds-filter-item>`,
        ).join('')}</mds-filter>`,
      ).then((rendered) => ({
        ...rendered,
        items: () => Array.from(rendered.root.querySelectorAll('mds-filter-item')),
      }));
    const selectedValues = (items: HTMLMdsFilterItemElement[]) =>
      items.filter((item) => item.selected).map((item) => item.value);

    it('keeps one item selected in single mode, the last one set, and emits nothing', async () => {
      const { items, spyOnEvent } = await bar('', ['new']);
      const change = spyOnEvent('mdsFilterChange');

      items()[1].selected = true;
      items()[2].selected = true;

      await vi.waitFor(() => expect(selectedValues(items())).toEqual(['closed']));
      expect(change).not.toHaveReceivedEvent();
    });

    it('keeps every item set in multiple mode', async () => {
      const { items, spyOnEvent, waitForChanges } = await bar('multiple');
      const change = spyOnEvent('mdsFilterChange');

      items()[0].selected = true;
      items()[2].selected = true;
      await waitForChanges();

      expect(selectedValues(items())).toEqual(['new', 'closed']);
      expect(change).not.toHaveReceivedEvent();
    });

    it('shows the reset button for a selection set from outside, and hides it when cleared', async () => {
      const { root, items } = await bar('reset multiple');
      const button = root.shadowRoot!.querySelector('.reset-button')!;

      items()[1].selected = true;
      await vi.waitFor(() => expect(button).not.toHaveAttribute('aria-hidden'));

      items()[1].selected = false;
      await vi.waitFor(() => expect(button).toEqualAttribute('aria-hidden', 'true'));
    });

    it('takes in an item rendered later already selected', async () => {
      const { root, items } = await bar('', ['new']);

      root.insertAdjacentHTML(
        'beforeend',
        '<mds-filter-item label="archived" value="archived" selected></mds-filter-item>',
      );

      await vi.waitFor(() => expect(selectedValues(items())).toEqual(['archived']));
    });

    it('selects an item rendered later on a click, in single mode', async () => {
      const { root, items, spyOnEvent, waitForChanges } = await bar('', ['new']);
      root.insertAdjacentHTML(
        'beforeend',
        '<mds-filter-item label="archived" value="archived"></mds-filter-item>',
      );
      await waitForChanges();
      const change = spyOnEvent('mdsFilterChange');

      // it has no id from the filter, which the click used to look the item up by
      root.querySelector<HTMLElement>('mds-filter-item[value="archived"]')!.click();
      await waitForChanges();

      expect(selectedValues(items())).toEqual(['archived']);
      expect(change.lastEvent?.detail.value).toBe('archived');
    });

    it('keeps the last selected item of the markup in single mode, as a select does', async () => {
      const { items } = await bar('', ['new', 'closed']);

      expect(selectedValues(items())).toEqual(['closed']);
    });
  });

  // #827: the filter overwrote the ids of its items with `item-N`, and their events reported that
  // value instead of the one the author wrote
  describe('the ids of the items', () => {
    it('stay as the author wrote them, and the events report them', async () => {
      const { root, spyOnEvent, waitForChanges } = await render(`
        <mds-filter>
          <mds-filter-item id="filter-news" label="Notizie" value="news"></mds-filter-item>
          <mds-filter-item id="filter-events" label="Eventi" value="events"></mds-filter-item>
        </mds-filter>`);
      const [news, events] = Array.from(root.querySelectorAll('mds-filter-item'));
      const select = spyOnEvent('mdsFilterItemSelect');

      events.click();
      await waitForChanges();

      expect(news.id).toBe('filter-news');
      expect(events.id).toBe('filter-events');
      expect(select.lastEvent?.detail.id).toBe('filter-events');
      expect(events.selected).toBe(true);
    });

    it('are given to the items without one, by position, as before', async () => {
      const { root } = await render(`
        <mds-filter>
          <mds-filter-item id="filter-news" label="Notizie" value="news"></mds-filter-item>
          <mds-filter-item label="Eventi" value="events"></mds-filter-item>
        </mds-filter>`);

      expect(Array.from(root.querySelectorAll('mds-filter-item'), (item) => item.id)).toEqual([
        'filter-news',
        'item-1',
      ]);
    });
  });
});
