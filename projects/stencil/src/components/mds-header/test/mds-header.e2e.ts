import { render } from '@stencil/vitest';

describe('mds-header', () => {
  it('renders', async () => {
    const { root } = await render('<mds-header></mds-header>');

    expect(root).toHaveAttribute('hydrated');
  });
});
