import { render } from '@stencil/vitest';
import { onTestFinished } from 'vitest';
import { mockIconFetch } from '@test/fetch';

// the cells fade their colours: read them once the transition is over
const settled = async (element: Element): Promise<void> => {
  await Promise.all(
    element
      .getAnimations()
      .filter((animation) => animation instanceof CSSTransition)
      .map((animation) => animation.finished),
  );
};

describe('mds-table-cell', () => {
  beforeEach(mockIconFetch);

  it('renders', async () => {
    const { root } = await render('<mds-table-cell></mds-table-cell>');

    expect(root).toHaveAttribute('hydrated');
  });

  // #824: the -alt pair was read only under [selected], which nothing ever set on a cell
  it('paints the cells of the sorted column with the -alt colours', async () => {
    // the cells are in the light DOM, and declare their properties on their own host: set them
    // on the cells
    const sheet = document.createElement('style');
    sheet.textContent =
      '.sorted-table mds-table-cell { --mds-table-cell-background-alt: rgb(1 2 3); --mds-table-cell-color-alt: rgb(4 5 6); }';
    document.head.append(sheet);
    onTestFinished(() => sheet.remove());

    const { root, waitForChanges } = await render(`
      <mds-table class="sorted-table">
        <mds-table-header>
          <mds-table-header-cell sortable label="Number"></mds-table-header-cell>
          <mds-table-header-cell sortable label="Name"></mds-table-header-cell>
        </mds-table-header>
        <mds-table-body>
          <mds-table-row><mds-table-cell>2</mds-table-cell><mds-table-cell>Bea</mds-table-cell></mds-table-row>
          <mds-table-row><mds-table-cell>1</mds-table-cell><mds-table-cell>Ada</mds-table-cell></mds-table-row>
        </mds-table-body>
      </mds-table>
    `);
    root.querySelector('mds-table-header-cell')!.direction = 'ascending';
    await waitForChanges();

    const [number, name] = Array.from(root.querySelectorAll('mds-table-row')[0].children);
    await settled(number);
    await settled(name);

    expect(number).toHaveAttribute('sorted');
    expect(getComputedStyle(number).backgroundColor).toBe('rgb(1, 2, 3)');
    expect(getComputedStyle(number).color).toBe('rgb(4, 5, 6)');
    expect(getComputedStyle(name).backgroundColor).not.toBe('rgb(1, 2, 3)');
  });
});
