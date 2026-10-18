import { render, vi } from '@stencil/vitest';
import { mockIconFetch } from '@test/fetch';

const table = (attributes = '') =>
  render(`
    <mds-table ${attributes}>
      <mds-table-header>
        <mds-table-header-cell sortable label="Number" sort-key="number"></mds-table-header-cell>
        <mds-table-header-cell sortable label="Name"></mds-table-header-cell>
      </mds-table-header>
      <mds-table-body>
        <mds-table-row><mds-table-cell>2</mds-table-cell><mds-table-cell>Bea</mds-table-cell></mds-table-row>
        <mds-table-row><mds-table-cell>3</mds-table-cell><mds-table-cell>Ada</mds-table-cell></mds-table-row>
        <mds-table-row><mds-table-cell>1</mds-table-cell><mds-table-cell>Cid</mds-table-cell></mds-table-row>
      </mds-table-body>
    </mds-table>
  `).then((rendered) => {
    const [number, name] = Array.from(
      rendered.root.querySelectorAll<HTMLMdsTableHeaderCellElement>('mds-table-header-cell'),
    );
    const click = async (cell: HTMLMdsTableHeaderCellElement) => {
      cell.shadowRoot!.querySelector<HTMLElement>('.action')!.click();
      await rendered.waitForChanges();
    };
    // the first column, row by row
    const order = () =>
      Array.from(rendered.root.querySelectorAll('mds-table-row'), (row) =>
        row.querySelector('mds-table-cell')!.textContent!.trim(),
      );
    return { ...rendered, number, name, click, order };
  });

describe('mds-table-header-cell', () => {
  beforeEach(mockIconFetch);

  it('renders', async () => {
    const { root } = await render('<mds-table-header-cell></mds-table-header-cell>');

    expect(root).toHaveAttribute('hydrated');
  });

  it('sorts a cell on its text once its value attribute is removed', async () => {
    const { root, waitForChanges } = await render(`
      <mds-table>
        <mds-table-header>
          <mds-table-header-cell sortable label="Numbers"></mds-table-header-cell>
        </mds-table-header>
        <mds-table-body>
          <mds-table-row><mds-table-cell value="30">30</mds-table-cell></mds-table-row>
          <mds-table-row><mds-table-cell>10</mds-table-cell></mds-table-row>
          <mds-table-row><mds-table-cell>20</mds-table-cell></mds-table-row>
        </mds-table-body>
      </mds-table>
    `);
    // a removed attribute leaves null, the value Angular and Vue bind for a missing one
    root.querySelector('mds-table-cell[value]')!.removeAttribute('value');
    await waitForChanges();

    const headerCell = root.querySelector('mds-table-header-cell')!;
    headerCell.shadowRoot!.querySelector<HTMLElement>('.action')!.click();
    await waitForChanges();

    const texts = Array.from(root.querySelectorAll('mds-table-cell'), (cell) =>
      cell.textContent!.trim(),
    );
    expect(headerCell).toEqualAttribute('direction', 'ascending');
    expect(texts).toEqual(['10', '20', '30']);
  });

  // #943: a table with pages needs the order from the back end, so the click has to say it
  describe('mdsTableHeaderCellSort', () => {
    it('tells the column and the direction at every step of the cycle', async () => {
      const { number, name, click, spyOnEvent } = await table();
      const sort = spyOnEvent('mdsTableHeaderCellSort');

      await click(number);
      expect(sort.lastEvent?.detail).toEqual({
        direction: 'ascending',
        index: 0,
        sortKey: 'number',
      });
      await click(number);
      expect(sort.lastEvent?.detail).toEqual({
        direction: 'descending',
        index: 0,
        sortKey: 'number',
      });
      await click(number);
      expect(sort.lastEvent?.detail).toEqual({ direction: 'none', index: 0, sortKey: 'number' });
      await click(name);
      expect(sort.lastEvent?.detail).toEqual({
        direction: 'ascending',
        index: 1,
        sortKey: undefined,
      });
      expect(sort).toHaveReceivedEventTimes(4);
    });

    it('is not emitted for a direction the application sets', async () => {
      const { number, spyOnEvent, waitForChanges } = await table();
      const sort = spyOnEvent('mdsTableHeaderCellSort');

      number.direction = 'descending';
      await waitForChanges();

      expect(sort).not.toHaveReceivedEvent();
    });
  });

  describe('sorting="external"', () => {
    it('leaves the rows where they are, and shows the direction asked', async () => {
      const { number, click, order } = await table('sorting="external"');

      await click(number);

      expect(order()).toEqual(['2', '3', '1']);
      expect(number).toEqualAttributes({ direction: 'ascending', 'aria-sort': 'ascending' });
    });

    it('shows a direction set by the application without sorting', async () => {
      const { number, name, waitForChanges, order } = await table('sorting="external"');
      name.direction = 'ascending';
      await waitForChanges();

      number.direction = 'descending';
      await waitForChanges();

      expect(order()).toEqual(['2', '3', '1']);
      expect(number).toEqualAttribute('aria-sort', 'descending');
      // one sorted column at a time
      expect(name).toEqualAttribute('direction', 'none');
    });

    it('marks the rows the application renders after the sort', async () => {
      const { root, number, click } = await table('sorting="external"');
      await click(number);

      const body = root.querySelector('mds-table-body')!;
      body.innerHTML =
        '<mds-table-row><mds-table-cell>7</mds-table-cell><mds-table-cell>Eva</mds-table-cell></mds-table-row>';

      const row = body.querySelector('mds-table-row')!;
      await vi.waitFor(() => {
        expect(row).toHaveAttribute('sorted');
        expect(row.querySelector('mds-table-cell')).toHaveAttribute('sorted');
      });
    });
  });

  // #823: a direction set from outside changed the icon and aria-sort, and sorted nothing
  describe('direction set by the application', () => {
    it('sorts the rows like a click', async () => {
      const { number, name, waitForChanges, order } = await table();
      name.direction = 'ascending';
      await waitForChanges();
      expect(order()).toEqual(['3', '2', '1']);

      number.direction = 'descending';
      await waitForChanges();

      expect(order()).toEqual(['3', '2', '1']);
      expect(name).toEqualAttribute('direction', 'none');
      number.direction = 'ascending';
      await waitForChanges();
      expect(order()).toEqual(['1', '2', '3']);
    });

    it('brings back the original order and clears the marks with none', async () => {
      const { root, number, waitForChanges, order } = await table();
      number.direction = 'ascending';
      await waitForChanges();
      expect(order()).toEqual(['1', '2', '3']);

      number.direction = 'none';
      await waitForChanges();

      expect(order()).toEqual(['2', '3', '1']);
      expect(root.querySelectorAll('[sorted]')).toHaveLength(0);
    });

    it('goes on with the cycle from there on a click', async () => {
      const { number, click, waitForChanges } = await table();
      number.direction = 'descending';
      await waitForChanges();

      await click(number);

      expect(number).toEqualAttribute('direction', 'none');
    });

    it('sorts at load when it is in the markup', async () => {
      const { root, waitForChanges } = await render(`
        <mds-table>
          <mds-table-header>
            <mds-table-header-cell sortable label="Number" direction="descending"></mds-table-header-cell>
          </mds-table-header>
          <mds-table-body>
            <mds-table-row><mds-table-cell>2</mds-table-cell></mds-table-row>
            <mds-table-row><mds-table-cell>3</mds-table-cell></mds-table-row>
            <mds-table-row><mds-table-cell>1</mds-table-cell></mds-table-row>
          </mds-table-body>
        </mds-table>
      `);
      await waitForChanges();

      const texts = Array.from(root.querySelectorAll('mds-table-cell'), (cell) =>
        cell.textContent!.trim(),
      );
      expect(texts).toEqual(['3', '2', '1']);
    });
  });

  describe('the original order', () => {
    it('comes back after a sort that moved from one column to another', async () => {
      const { number, name, click, order } = await table();

      await click(number);
      await click(name);
      expect(order()).toEqual(['3', '2', '1']);
      await click(name);
      await click(name);

      expect(order()).toEqual(['2', '3', '1']);
    });

    // the rows were kept from the first load, and none put back the ones the application removed
    it('leaves out the rows removed while sorted', async () => {
      const { root, number, click, order } = await table();
      await click(number);
      root.querySelector('mds-table-row')!.remove();

      await click(number);
      await click(number);

      expect(order()).toEqual(['2', '3']);
    });
  });

  // #825: a sortable cell outside an mds-table-header read the children of a header that is not
  // there and threw; the sorter written since asks for the header and the table at every step
  it('sorts nothing and throws nothing outside a table header', async () => {
    const consoleError = vi.spyOn(console, 'error');
    const { root, waitForChanges } = await render(
      '<mds-table-header-cell sortable label="Alone"></mds-table-header-cell>',
    );
    const sort = vi.fn();
    root.addEventListener('mdsTableHeaderCellSort', sort);

    root.shadowRoot!.querySelector<HTMLElement>('.action')!.click();
    await waitForChanges();

    expect(consoleError).not.toHaveBeenCalled();
    expect(root).toEqualAttribute('direction', 'ascending');
    expect(sort).toHaveBeenCalledTimes(1);
  });
});
