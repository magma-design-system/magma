import { render } from '@stencil/vitest';

describe('mds-price-table-list', () => {
  it('renders', async () => {
    const { root } = await render('<mds-price-table-list></mds-price-table-list>');

    expect(root).toHaveAttribute('hydrated');
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
