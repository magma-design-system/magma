import { render } from '@stencil/vitest';

describe('mds-horizontal-scroll', () => {
  it('renders', async () => {
    const { root } = await render('<mds-horizontal-scroll></mds-horizontal-scroll>');

    expect(root).toHaveAttribute('hydrated');
  });
});
