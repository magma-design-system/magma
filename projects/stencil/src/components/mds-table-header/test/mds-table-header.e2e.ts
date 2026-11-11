import { render } from '@stencil/vitest';

/** The select-all switch the header owns; it only exists when the header is selectable. */
const checkbox = (root: HTMLElement): HTMLMdsInputSwitchElement =>
  root.shadowRoot!.querySelector('.checkbox') as HTMLMdsInputSwitchElement;

describe('mds-table-header', () => {
  it('renders', async () => {
    const { root } = await render('<mds-table-header></mds-table-header>');

    expect(root).toHaveAttribute('hydrated');
  });

  describe('setSelection()', () => {
    it('ticks the switch when every row is selected', async () => {
      // the reference to the switch was resolved only on the indeterminate branch, so
      // this call - the one selectAll() makes - threw before it could tick anything
      const { root, waitForChanges } = await render(
        '<mds-table-header selectable></mds-table-header>',
      );

      await (root as HTMLMdsTableHeaderElement).setSelection(3, 3);
      await waitForChanges();

      expect(checkbox(root).checked).toBe(true);
      expect(checkbox(root).indeterminate).toBeFalsy();
    });

    it('goes indeterminate for a partial selection', async () => {
      const { root, waitForChanges } = await render(
        '<mds-table-header selectable></mds-table-header>',
      );

      await (root as HTMLMdsTableHeaderElement).setSelection(1, 3);
      await waitForChanges();

      expect(checkbox(root).checked).toBeFalsy();
      expect(checkbox(root).indeterminate).toBe(true);
    });

    it('unticks the switch when the last row is unselected', async () => {
      const { root, waitForChanges } = await render(
        '<mds-table-header selectable></mds-table-header>',
      );

      await (root as HTMLMdsTableHeaderElement).setSelection(2, 3);
      await waitForChanges();
      await (root as HTMLMdsTableHeaderElement).setSelection(0, 3);
      await waitForChanges();

      expect(checkbox(root).checked).toBeFalsy();
      expect(checkbox(root).indeterminate).toBeFalsy();
    });

    it('reads an empty table as nothing selected, not as all of it', async () => {
      const { root, waitForChanges } = await render(
        '<mds-table-header selectable></mds-table-header>',
      );

      await (root as HTMLMdsTableHeaderElement).setSelection(0, 0);
      await waitForChanges();

      expect(checkbox(root).checked).toBeFalsy();
    });

    it('does nothing at all on a header with no switch to tick', async () => {
      const { root } = await render('<mds-table-header></mds-table-header>');

      await expect((root as HTMLMdsTableHeaderElement).setSelection(1, 3)).resolves.toBeUndefined();
    });

    // the table counts the rows selected in its markup on load, a frame before the header it
    // makes selectable draws its switch: that count was lost (#1230)
    it('keeps a count made before the switch exists', async () => {
      const { root, waitForChanges } = await render<HTMLMdsTableHeaderElement>(
        '<mds-table-header></mds-table-header>',
      );

      await root.setSelection(3, 3);
      root.selectable = true;
      await waitForChanges();

      expect(checkbox(root).checked).toBe(true);
      expect(checkbox(root).indeterminate).toBeFalsy();
    });

    it('keeps a partial count made before the switch exists', async () => {
      const { root, waitForChanges } = await render<HTMLMdsTableHeaderElement>(
        '<mds-table-header></mds-table-header>',
      );

      await root.setSelection(1, 3);
      root.selectable = true;
      await waitForChanges();

      expect(checkbox(root).checked).toBeFalsy();
      expect(checkbox(root).indeterminate).toBe(true);
    });

    it('names the switch after what a click on it does', async () => {
      // the name followed only clicks on the switch itself: every row ticked one by one left a
      // ticked switch called "Select all rows"
      const { root, waitForChanges } = await render<HTMLMdsTableHeaderElement>(
        '<mds-table-header selectable></mds-table-header>',
      );

      await root.setSelection(3, 3);
      await waitForChanges();
      expect(checkbox(root)).toHaveAttribute('title', 'Deselect all rows');

      await root.setSelection(1, 3);
      await waitForChanges();
      expect(checkbox(root)).toHaveAttribute('title', 'Select all rows');
    });
  });
});
