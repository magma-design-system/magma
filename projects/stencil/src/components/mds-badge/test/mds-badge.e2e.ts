import { render } from '@stencil/vitest';

describe('mds-badge', () => {
  it('renders', async () => {
    const { root } = await render('<mds-badge></mds-badge>');

    expect(root).toHaveAttribute('hydrated');
  });
});
