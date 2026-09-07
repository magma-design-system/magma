import { render } from '@stencil/vitest';

describe('mds-status-bar', () => {
  it('renders', async () => {
    const { root } = await render('<mds-status-bar></mds-status-bar>');

    expect(root).toHaveAttribute('hydrated');
  });
});
