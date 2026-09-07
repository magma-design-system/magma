import { render } from '@stencil/vitest';

describe('mds-price-table-features', () => {
  it('renders', async () => {
    const { root } = await render('<mds-price-table-features></mds-price-table-features>');

    expect(root).toHaveAttribute('hydrated');
  });
});
