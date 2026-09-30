import { render } from '@stencil/vitest';

describe('mds-price-table-features-cell', () => {
  it('renders', async () => {
    const { root } = await render(
      '<mds-price-table-features-cell></mds-price-table-features-cell>',
    );

    expect(root).toHaveAttribute('hydrated');
  });
});
