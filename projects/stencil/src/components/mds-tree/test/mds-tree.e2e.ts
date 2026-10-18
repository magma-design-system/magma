import { render, vi } from '@stencil/vitest';
import { userEvent } from 'vitest/browser';
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

  // no tree semantics at all: no structure, no level, no expanded state, and a closed branch
  // only 0px tall, its items still in the tab order (#821)
  describe('for assistive technologies', () => {
    const TREE = `
      <div>
        <mds-tree label="Documenti" style="--mds-tree-item-transition-duration: 0s">
          <mds-tree-item id="root" label="Root">
            <mds-tree-item id="middle" label="Middle">
              <mds-tree-item id="leaf" label="Leaf"></mds-tree-item>
            </mds-tree-item>
          </mds-tree-item>
          <mds-tree-item id="alone" label="Alone"></mds-tree-item>
        </mds-tree>
        <button id="after">After</button>
      </div>`;

    const labelButton = (item: Element) =>
      item.shadowRoot!.querySelector<HTMLElement>('.label-action')!;
    const toggleButton = (item: Element) =>
      item.shadowRoot!.querySelector<HTMLElement>('.toggle-icon mds-button')!;
    const branch = (item: Element) => item.shadowRoot!.querySelector('.children')!;

    it('is a named list of items, and an item with children holds a list of them', async () => {
      const { root } = await render(TREE);
      const tree = root.querySelector('mds-tree')!;

      expect(tree).toEqualAttributes({ role: 'list', 'aria-label': 'Documenti' });
      expect(root.querySelector('#root')).toEqualAttribute('role', 'listitem');
      expect(branch(root.querySelector('#root')!)).toEqualAttribute('role', 'list');
      expect(branch(root.querySelector('#alone')!)).not.toHaveAttribute('role');
    });

    it('says on the buttons of a branch whether it is open, and nothing on a leaf', async () => {
      const { root, waitForChanges } = await render(TREE);
      const item = root.querySelector<HTMLMdsTreeItemElement>('#root')!;

      expect(labelButton(item)).toEqualAttribute('aria-expanded', 'false');
      expect(toggleButton(item)).toEqualAttribute('aria-expanded', 'false');
      expect(labelButton(root.querySelector('#alone')!)).not.toHaveAttribute('aria-expanded');

      labelButton(item).click();
      await waitForChanges();

      expect(labelButton(item)).toEqualAttribute('aria-expanded', 'true');
    });

    it('leaves the items of a closed branch out of the tab order', async () => {
      const { root } = await render(TREE);

      expect(getComputedStyle(labelButton(root.querySelector('#middle')!)).visibility).toBe(
        'hidden',
      );
      labelButton(root.querySelector('#root')!).focus();
      await userEvent.keyboard('{Tab}');

      // from the label of the root straight to the next item at the same level
      expect(document.activeElement).toBe(root.querySelector('#alone'));
    });

    it('keeps an open branch hidden inside a closed one', async () => {
      const { root, waitForChanges } = await render(TREE);
      const middle = root.querySelector<HTMLMdsTreeItemElement>('#middle')!;

      middle.expanded = true;
      await waitForChanges();

      expect(getComputedStyle(labelButton(root.querySelector('#leaf')!)).visibility).toBe('hidden');
    });
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
