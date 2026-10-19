import { render } from '@stencil/vitest';

const table = (attributes: string, action: string = ''): string => `
<mds-table ${attributes}>
  <mds-table-header>
    <mds-table-header-cell label="Nome"></mds-table-header-cell>
    <mds-table-header-cell label="Totale"></mds-table-header-cell>
  </mds-table-header>
  <mds-table-body>
    <mds-table-row value="uno">
      <mds-table-cell>Uno</mds-table-cell>
      <mds-table-cell>10</mds-table-cell>
      ${action}
    </mds-table-row>
  </mds-table-body>
  <mds-table-footer>
    <mds-table-cell>Totale</mds-table-cell>
    <mds-table-cell>10</mds-table-cell>
  </mds-table-footer>
</mds-table>`;

/** The left edge of the first data cell, in the row and in the footer. */
const firstCellsLeft = (root: HTMLElement): number[] =>
  ['mds-table-row', 'mds-table-footer'].map((row) =>
    Math.round(root.querySelector(`${row} > mds-table-cell`)!.getBoundingClientRect().left),
  );

describe('mds-table-footer', () => {
  it('renders', async () => {
    const { root } = await render('<mds-table-footer></mds-table-footer>');

    expect(root).toHaveAttribute('hydrated');
  });

  it('lines its cells up with the rows of a selectable table', async () => {
    const { root } = await render(table('selectable'));
    const footer = root.querySelector('mds-table-footer')!;

    await vi.waitFor(() => expect(footer.shadowRoot!.querySelector('.selection')).not.toBeNull());
    const [rowLeft, footerLeft] = firstCellsLeft(root);
    expect(footerLeft).toBe(rowLeft);
  });

  it('follows the selectable prop of the table', async () => {
    const { root, waitForChanges } = await render<HTMLMdsTableElement>(table(''));
    const footer = root.querySelector('mds-table-footer')!;
    expect(footer.shadowRoot!.querySelector('.selection')).toBeNull();

    root.selectable = true;
    await waitForChanges();

    expect(footer.shadowRoot!.querySelector('.selection')).not.toBeNull();
  });

  it('adds the cell of the actions column when the rows have actions', async () => {
    const { root } = await render(
      table('', '<mds-button slot="action" label="Modifica"></mds-button>'),
    );

    expect(
      root.querySelector('mds-table-footer')!.shadowRoot!.querySelector('.actions'),
    ).not.toBeNull();
  });
});
