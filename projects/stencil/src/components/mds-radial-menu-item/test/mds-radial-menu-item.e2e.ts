import { render } from '@stencil/vitest';

describe('mds-radial-menu-item', () => {
  it('renders', async () => {
    const { root } = await render('<mds-radial-menu-item></mds-radial-menu-item>');

    expect(root).toHaveAttribute('hydrated');
  });
});
