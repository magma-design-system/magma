import { render } from '@stencil/vitest';

describe('mds-price-table-header', () => {
  it('renders', async () => {
    const { root } = await render('<mds-price-table-header></mds-price-table-header>');

    expect(root).toHaveAttribute('hydrated');
  });
});
