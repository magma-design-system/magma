import { render } from '@stencil/vitest';

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

  // #988: the expanded colours of the toggle and its gap were documented and read by nothing
  describe('custom properties', () => {
    const tree = (attributes: string) =>
      render(`
        <mds-tree ${attributes}>
          <mds-tree-item id="open" label="Open" expanded>
            <mds-tree-item label="Leaf"></mds-tree-item>
          </mds-tree-item>
          <mds-tree-item id="closed" label="Closed">
            <mds-tree-item label="Leaf"></mds-tree-item>
          </mds-tree-item>
        </mds-tree>`);

    // the toggle fades its colours: read them once the transitions are over
    const toggleOf = async (root: HTMLElement, id: string): Promise<CSSStyleDeclaration> => {
      const button = root
        .querySelector(`#${id}`)!
        .shadowRoot!.querySelector('.toggle-icon mds-button')!;
      await Promise.all(
        button
          .getAnimations()
          .filter((animation) => animation instanceof CSSTransition)
          .map((animation) => animation.finished),
      );
      return getComputedStyle(button);
    };

    it('paints the chevron of an expanded item with the expanded colours', async () => {
      const { root } = await tree(
        'style="--mds-tree-toggle-icon-chevron-expanded-background: rgb(1 2 3); --mds-tree-toggle-icon-chevron-expanded-color: rgb(4 5 6)"',
      );
      await vi.waitFor(() => {
        expect(root.querySelector('#open')).toEqualAttribute('toggle', 'chevron');
      });

      const open = await toggleOf(root, 'open');
      const closed = await toggleOf(root, 'closed');

      expect(open.backgroundColor).toBe('rgb(1, 2, 3)');
      expect(open.color).toBe('rgb(4, 5, 6)');
      expect(closed.backgroundColor).not.toBe('rgb(1, 2, 3)');
      expect(closed.color).not.toBe('rgb(4, 5, 6)');
    });

    it('paints the folder of an expanded item with the expanded colour', async () => {
      const { root } = await tree(
        'toggle="folder" style="--mds-tree-toggle-icon-folder-expanded-color: rgb(7 8 9)"',
      );
      await vi.waitFor(() => {
        expect(root.querySelector('#open')).toEqualAttribute('toggle', 'folder');
      });

      expect((await toggleOf(root, 'open')).color).toBe('rgb(7, 8, 9)');
      expect((await toggleOf(root, 'closed')).color).not.toBe('rgb(7, 8, 9)');
    });

    describe('the gap between the toggle and the label', () => {
      const gapOf = (root: HTMLElement, id: string): number => {
        const shadow = root.querySelector(`#${id}`)!.shadowRoot!;
        const toggle = shadow.querySelector('.toggle-icon')!.getBoundingClientRect();
        const title = shadow.querySelector('.title')!.getBoundingClientRect();
        return Math.round(title.left - toggle.right);
      };

      it('is 4px by default', async () => {
        const { root } = await tree('');

        expect(gapOf(root, 'closed')).toBe(4);
      });

      it('is the one set on the tree', async () => {
        const { root } = await tree('style="--mds-tree-toggle-gap: 20px"');

        expect(gapOf(root, 'closed')).toBe(20);
      });

      it('is the one set on an item, for that item', async () => {
        const { root } = await tree('');
        root
          .querySelector<HTMLElement>('#closed')!
          .style.setProperty('--mds-tree-item-toggle-gap', '12px');

        expect(gapOf(root, 'closed')).toBe(12);
        expect(gapOf(root, 'open')).toBe(4);
      });
    });
  });
});
