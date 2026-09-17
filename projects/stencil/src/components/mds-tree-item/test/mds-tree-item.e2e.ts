import { render } from '@stencil/vitest';
import { describeConditionalSlot } from '@test/slot';

describe('mds-tree-item', () => {
  it('renders', async () => {
    const { root } = await render('<mds-tree-item></mds-tree-item>');

    expect(root).toHaveAttribute('hydrated');
  });

  describe('the branch that connects an item to the one above', () => {
    /** A tree deep enough that the middle item has both a branch and an icon of its own. */
    const TREE = `
      <mds-tree toggle="folder" toggle-position="left">
        <mds-tree-item id="root" label="Root">
          <mds-tree-item id="middle" label="Middle">
            <mds-tree-item id="leaf" label="Leaf"></mds-tree-item>
          </mds-tree-item>
        </mds-tree-item>
      </mds-tree>`;

    const icon = (item: Element): DOMRect =>
      item.shadowRoot!.querySelector('.toggle-icon mds-button')!.getBoundingClientRect();

    it('starts on the icon above and ends on its own, so both ends are covered', async () => {
      // it used to count the corner radius into the travel as well, and the radius is
      // drawn INSIDE the box: the line came 16px out of the top of the icon above
      const { root, waitForChanges } = await render(TREE);
      root.querySelectorAll('mds-tree-item').forEach((item) => {
        (item as HTMLMdsTreeItemElement).expanded = true;
      });
      await waitForChanges();
      await new Promise((resolve) => setTimeout(resolve, 400));

      const above = root.querySelector('#root')!;
      const item = root.querySelector('#middle')!;
      const branchEl = item.shadowRoot!.querySelector('.tree-branch')!;
      const branch = branchEl.getBoundingClientRect();
      const border = parseFloat(getComputedStyle(branchEl).borderBottomWidth);

      const centre = (box: DOMRect) => Math.round(box.top + box.height / 2);
      expect(Math.round(branch.top)).toBe(centre(icon(above)));
      expect(Math.round(branch.bottom - border / 2)).toBe(centre(icon(item)));
    });
  });

  describeConditionalSlot({
    html: '<mds-tree-item label="Item"></mds-tree-item>',
    slot: 'action',
    region: '.actions-container',
  });
});
