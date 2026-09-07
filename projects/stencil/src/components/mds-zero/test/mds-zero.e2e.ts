import { render } from '@stencil/vitest';

describe('mds-zero', () => {
  it('renders', async () => {
    const { root } = await render('<mds-zero></mds-zero>');

    expect(root).toHaveAttribute('hydrated');
  });
});
