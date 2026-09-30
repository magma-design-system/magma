import { render } from '@stencil/vitest';

describe('mds-benchmark-bar', () => {
  it('renders', async () => {
    const { root } = await render('<mds-benchmark-bar></mds-benchmark-bar>');

    expect(root).toHaveAttribute('hydrated');
  });
});
