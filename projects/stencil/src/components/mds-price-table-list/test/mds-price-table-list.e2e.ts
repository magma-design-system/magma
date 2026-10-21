import { render, vi } from '@stencil/vitest';

describe('mds-price-table-list', () => {
  it('renders', async () => {
    const { root } = await render('<mds-price-table-list></mds-price-table-list>');

    expect(root).toHaveAttribute('hydrated');
  });

  // #826: the items were looked for once, on load, so a list filled later never showed them
  it('shows the items rendered after load, and hides the region once they are gone', async () => {
    const { root } = await render(
      '<mds-price-table-list><span slot="header">Base</span></mds-price-table-list>',
    );
    const separator = (): Element | null => root.shadowRoot!.querySelector('.separator');
    expect(separator()).toBeNull();

    const item = document.createElement('mds-price-table-list-item');
    item.textContent = 'Ten users';
    root.appendChild(item);
    // the item names its own slot when it renders: until then the list counts it by its tag
    await item.componentOnReady();
    await vi.waitFor(() => expect(separator()).not.toBeNull());
    expect(
      root.shadowRoot!.querySelector<HTMLSlotElement>('slot[name="item"]')!.assignedElements(),
    ).toEqual([item]);

    item.remove();
    await vi.waitFor(() => expect(separator()).toBeNull());
  });

  // every card added a main landmark, nested inside the page's own (#821)
  it('adds no landmark to the page', async () => {
    const { root } = await render(
      '<mds-price-table-list><mds-price-table-list-item>Unlimited users</mds-price-table-list-item></mds-price-table-list>',
    );

    expect(root.shadowRoot!.querySelector('main')).toBeNull();
    expect(root.shadowRoot!.querySelector('[part="content"]')).not.toBeNull();
  });
});
