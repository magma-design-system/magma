import { render } from '@stencil/vitest';
import { mockIconFetch } from '@test/fetch';

describe('mds-table-header-cell', () => {
  it('renders', async () => {
    const { root } = await render('<mds-table-header-cell></mds-table-header-cell>');

    expect(root).toHaveAttribute('hydrated');
  });

  it('sorts a cell on its text once its value attribute is removed', async () => {
    mockIconFetch();
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
});
