import { render, vi } from '@stencil/vitest';
import { mockIconFetch } from '@test/fetch';
import { describeConditionalSlot } from '@test/slot';

describe('mds-tree-item', () => {
  it('renders', async () => {
    const { root } = await render('<mds-tree-item></mds-tree-item>');

    expect(root).toHaveAttribute('hydrated');
  });

  describe('the branch that connects an item to the one above', () => {
    /** A tree deep enough that the middle item has both a branch and an icon of its own,
     * and wide enough that the second child hangs from a sibling rather than from it. */
    const TREE = `
      <mds-tree toggle="folder" toggle-position="left">
        <mds-tree-item id="root" label="Root">
          <mds-tree-item id="middle" label="Middle">
            <mds-tree-item id="leaf" label="Leaf"></mds-tree-item>
          </mds-tree-item>
          <mds-tree-item id="second" label="Second"></mds-tree-item>
          <mds-tree-item id="third" label="Third"></mds-tree-item>
        </mds-tree-item>
      </mds-tree>`;

    const icon = (item: Element): DOMRect =>
      item.shadowRoot!.querySelector('.toggle-icon mds-button')!.getBoundingClientRect();

    const branch = (item: Element): { box: DOMRect; border: number; radius: number } => {
      const element = item.shadowRoot!.querySelector('.tree-branch')!;
      const style = getComputedStyle(element);
      return {
        box: element.getBoundingClientRect(),
        border: parseFloat(style.borderBottomWidth),
        radius: parseFloat(style.borderBottomLeftRadius),
      };
    };

    const expandAll = async (root: HTMLElement, waitForChanges: () => Promise<void>) => {
      root.querySelectorAll('mds-tree-item').forEach((item) => {
        (item as HTMLMdsTreeItemElement).expanded = true;
      });
      await waitForChanges();
      await new Promise((resolve) => setTimeout(resolve, 400));
    };

    it('starts the first child on the icon above and ends it on its own', async () => {
      // it used to count the corner radius into the travel here as well, and the radius is
      // drawn INSIDE the box: the line came 16px out of the top of the icon above
      const { root, waitForChanges } = await render(TREE);
      await expandAll(root, waitForChanges);

      const above = root.querySelector('#root')!;
      const item = root.querySelector('#middle')!;
      const { box, border } = branch(item);

      const centre = (rect: DOMRect) => Math.round(rect.top + rect.height / 2);
      expect(Math.round(box.top)).toBe(centre(icon(above)));
      expect(Math.round(box.bottom - border / 2)).toBe(centre(icon(item)));
    });

    it('starts a later child where the elbow of the sibling above leaves the vertical', async () => {
      // an elbow curves away a radius before its own line, so a sibling that stopped on
      // that line left a gap: the vertical down the list came out as a ladder
      const { root, waitForChanges } = await render(TREE);
      await expandAll(root, waitForChanges);

      // two leaves in a row, so nothing sits between them but the line itself
      const above = branch(root.querySelector('#second')!);
      const item = branch(root.querySelector('#third')!);

      expect(Math.round(item.box.top)).toBeLessThanOrEqual(
        Math.round(above.box.bottom - above.radius),
      );
    });
  });

  describeConditionalSlot({
    html: '<mds-tree-item label="Item"></mds-tree-item>',
    slot: 'action',
    region: '.actions-container',
  });

  // #826: whether an item has children was read once, on load, and the folder icon followed only
  // a click, not the branch the tree opened
  describe('a branch', () => {
    beforeEach(mockIconFetch);

    it('loaded after the item gets the toggle and the lines of a branch', async () => {
      const { root } = await render('<mds-tree-item label="Parent"></mds-tree-item>');
      const header = root.shadowRoot!.querySelector('.header')!;
      expect(header).not.toHaveClass('header--has-children');

      root.appendChild(document.createElement('mds-tree-item'));

      await vi.waitFor(() => expect(header).toHaveClass('header--has-children'));
    });

    it('opened and closed by the tree shows the folder it is in', async () => {
      const { root, waitForChanges } = await render(`
        <mds-tree toggle="folder">
          <mds-tree-item label="Parent"><mds-tree-item label="Child"></mds-tree-item></mds-tree-item>
        </mds-tree>`);
      const parent = root.querySelector('mds-tree-item')!;
      const toggleIcon = (): string | undefined =>
        parent.shadowRoot!.querySelector<HTMLMdsButtonElement>('.toggle-icon mds-button')!.icon;
      const closed = toggleIcon();

      (root as HTMLMdsTreeElement).expanded = true;
      await waitForChanges();
      const open = toggleIcon();
      expect(open).not.toBe(closed);

      (root as HTMLMdsTreeElement).expanded = false;
      await waitForChanges();
      expect(toggleIcon()).toBe(closed);
    });
  });
});
