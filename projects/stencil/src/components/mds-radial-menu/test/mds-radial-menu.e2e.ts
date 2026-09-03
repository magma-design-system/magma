import { render } from '@stencil/vitest';

describe('mds-radial-menu', () => {
  it('renders', async () => {
    const { root } = await render('<mds-radial-menu></mds-radial-menu>');

    expect(root).toHaveAttribute('hydrated');
  });
});
