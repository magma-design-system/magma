import { render } from '@stencil/vitest';

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
});
