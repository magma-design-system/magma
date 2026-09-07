import { render } from '@stencil/vitest';

describe('mds-price-table-list-item', () => {
  it('renders', async () => {
    const { root } = await render('<mds-price-table-list-item></mds-price-table-list-item>');

    expect(root).toHaveAttribute('hydrated');
  });
});
