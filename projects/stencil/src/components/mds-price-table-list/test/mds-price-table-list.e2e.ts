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
    await vi.waitFor(() => expect(separator()).not.toBeNull());
    expect(
      root.shadowRoot!.querySelector<HTMLSlotElement>('slot[name="item"]')!.assignedElements(),
    ).toEqual([item]);

    item.remove();
    await vi.waitFor(() => expect(separator()).toBeNull());
  });
});
