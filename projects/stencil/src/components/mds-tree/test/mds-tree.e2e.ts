import { render } from '@stencil/vitest';
import { userEvent } from 'vitest/browser';

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
});
