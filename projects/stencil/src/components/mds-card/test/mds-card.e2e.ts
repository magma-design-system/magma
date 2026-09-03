import { render } from '@stencil/vitest';

describe('mds-card', () => {
  it('renders', async () => {
    const { root } = await render('<mds-card></mds-card>');

    expect(root).toHaveAttribute('hydrated');
  });
});
