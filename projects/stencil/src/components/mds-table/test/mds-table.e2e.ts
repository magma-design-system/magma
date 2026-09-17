import { render } from '@stencil/vitest';

/** A selectable table with something in the batch-action slot: the counter only exists there. */
const TABLE = `
<mds-table selectable>
  <mds-table-header>
    <mds-table-header-cell label="Name"></mds-table-header-cell>
  </mds-table-header>
  <mds-table-body>
    <mds-table-row value="uno"><mds-table-cell value="Uno">Uno</mds-table-cell></mds-table-row>
    <mds-table-row value="due"><mds-table-cell value="Due">Due</mds-table-cell></mds-table-row>
    <mds-table-row value="tre"><mds-table-cell value="Tre">Tre</mds-table-cell></mds-table-row>
  </mds-table-body>
  <mds-button slot="batch-action" label="Remove"></mds-button>
</mds-table>`;

/** What the badge PAINTS, which is the point: its own copy of the number, not the light DOM. */
const counter = (root: HTMLElement): string =>
  root.shadowRoot!.querySelector('mds-badge')!.shadowRoot!.textContent!.trim();

const toggleRow = (root: HTMLElement, index: number): void => {
  const row = root.querySelectorAll('mds-table-row')[index];
  const input = row
    .shadowRoot!.querySelector('mds-input-switch')!
    .shadowRoot!.querySelector('input');
  input!.click();
};

describe('mds-table', () => {
  it('renders', async () => {
    const { root } = await render('<mds-table></mds-table>');

    expect(root).toHaveAttribute('hydrated');
  });

  describe('the batch actions counter', () => {
    it('counts every selected row', async () => {
      // it used to arrive through the badge's deprecated slot, which is read once and
      // copied: the number moved in the light DOM and the badge kept painting 0
      const { root, waitForChanges } = await render(TABLE);

      expect(counter(root)).toBe('0');

      toggleRow(root, 0);
      await waitForChanges();
      expect(counter(root)).toBe('1');

      toggleRow(root, 2);
      await waitForChanges();
      expect(counter(root)).toBe('2');
    });

    it('counts back down when a row is unselected', async () => {
      const { root, waitForChanges } = await render(TABLE);

      toggleRow(root, 0);
      toggleRow(root, 1);
      await waitForChanges();
      expect(counter(root)).toBe('2');

      toggleRow(root, 1);
      await waitForChanges();
      expect(counter(root)).toBe('1');
    });

    it('follows selectAll() as well as the checkboxes', async () => {
      const { root, waitForChanges } = await render(TABLE);

      await (root as HTMLMdsTableElement).selectAll();
      await waitForChanges();
      expect(counter(root)).toBe('3');

      await (root as HTMLMdsTableElement).selectAll(false);
      await waitForChanges();
      expect(counter(root)).toBe('0');
    });
  });
});
