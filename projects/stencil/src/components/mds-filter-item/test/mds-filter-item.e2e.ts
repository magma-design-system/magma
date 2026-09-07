import { render } from '@stencil/vitest';

describe('mds-filter-item', () => {
  it('renders', async () => {
    const { root } = await render('<mds-filter-item></mds-filter-item>');

    expect(root).toHaveAttribute('hydrated');
  });
});
