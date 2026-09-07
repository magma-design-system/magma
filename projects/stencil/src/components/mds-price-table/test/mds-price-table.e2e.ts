import { render } from '@stencil/vitest';

describe('mds-price-table', () => {
  it('renders', async () => {
    const { root } = await render('<mds-price-table></mds-price-table>');

    expect(root).toHaveAttribute('hydrated');
  });
});
