import { render } from '@stencil/vitest';

describe('mds-price-table-features-row', () => {
  it('renders', async () => {
    const { root } = await render('<mds-price-table-features-row></mds-price-table-features-row>');

    expect(root).toHaveAttribute('hydrated');
  });
});
