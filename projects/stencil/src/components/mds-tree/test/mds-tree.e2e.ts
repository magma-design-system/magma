import { render, vi } from '@stencil/vitest';
import { mockIconFetch } from '@test/fetch';

describe('mds-tree', () => {
  it('renders', async () => {
    const { root } = await render('<mds-tree></mds-tree>');

    expect(root).toHaveAttribute('hydrated');
  });

  it('stacks the items it was given, and only those', async () => {
    // the stacking order used to read assignedNodes(), which counts the whitespace between
    // the items: a tree written across more than one line threw on the first text node,
    // and every tree a consumer writes is written across more than one line
    const { root, waitForChanges } = await render(`
      <mds-tree>
        <mds-tree-item id="first" label="First"></mds-tree-item>
        <mds-tree-item id="second" label="Second"></mds-tree-item>
        <mds-tree-item id="third" label="Third"></mds-tree-item>
      </mds-tree>`);
    await waitForChanges();

    const zIndex = (id: string) => root.querySelector(`#${id}`)!.getAttribute('style');

    expect(zIndex('first')).toContain('z-index: 3');
    expect(zIndex('second')).toContain('z-index: 2');
    expect(zIndex('third')).toContain('z-index: 1');
  });

  // #826: the tree read its items once, on load, and did not hand them the `expanded` of load
  describe('the items', () => {
    beforeEach(mockIconFetch);

    const BRANCH = `
      <mds-tree-item label="Parent">
        <mds-tree-item label="Child"></mds-tree-item>
      </mds-tree-item>`;

    it('open on load in an expanded tree', async () => {
      const { root } = await render(`<mds-tree expanded>${BRANCH}</mds-tree>`);
      const parent = root.querySelector('mds-tree-item')!;

      expect(parent.expanded).toBe(true);
      expect(parent.shadowRoot!.querySelector('.children')).toHaveClass('children--expanded');
    });

    it('that arrive later take the props of the tree', async () => {
      const { root } = await render(
        '<mds-tree toggle="folder" appearance="none" truncate="all" expanded><mds-tree-item label="Parent"></mds-tree-item></mds-tree>',
      );
      const child = document.createElement('mds-tree-item');
      child.label = 'Child';
      root.querySelector('mds-tree-item')!.appendChild(child);
      const sibling = document.createElement('mds-tree-item');
      sibling.label = 'Sibling';
      root.appendChild(sibling);

      await vi.waitFor(() => {
        [child, sibling].forEach((item) => {
          expect(item).toEqualAttribute('toggle', 'folder');
          expect(item).toEqualAttribute('appearance', 'none');
          expect(item).toEqualAttribute('truncate', 'all');
          expect(item.expanded).toBe(true);
        });
        expect(sibling).toEqualAttribute('depth', '0');
        expect(child).not.toHaveAttribute('depth');
      });
    });

    it('already there keep the state the user gave them when others arrive', async () => {
      const { root, waitForChanges } = await render(`<mds-tree expanded>${BRANCH}</mds-tree>`);
      const parent = root.querySelector('mds-tree-item')!;
      parent.expanded = false;
      await waitForChanges();

      root.appendChild(document.createElement('mds-tree-item'));
      await new Promise((resolve) => setTimeout(resolve));
      await waitForChanges();

      expect(parent.expanded).toBe(false);
    });
  });
});
