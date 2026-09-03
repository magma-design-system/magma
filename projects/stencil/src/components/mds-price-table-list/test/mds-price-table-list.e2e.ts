import { render } from '@stencil/vitest';

describe('mds-price-table-list', () => {
  it('renders', async () => {
    const { root } = await render('<mds-price-table-list></mds-price-table-list>');

    expect(root).toHaveAttribute('hydrated');
  });
});
