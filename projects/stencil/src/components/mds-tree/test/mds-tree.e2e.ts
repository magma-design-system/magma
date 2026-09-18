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
});
