import { render } from '@stencil/vitest';

describe('mds-mention', () => {
  it('renders', async () => {
    const { root } = await render('<mds-mention></mds-mention>');

    expect(root).toHaveAttribute('hydrated');
  });
});
