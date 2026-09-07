import { render } from '@stencil/vitest';

describe('mds-card-header', () => {
  it('renders', async () => {
    const { root } = await render('<mds-card-header></mds-card-header>');

    expect(root).toHaveAttribute('hydrated');
  });
});
