import { render } from '@stencil/vitest';

describe('mds-tab-item', () => {
  it('renders', async () => {
    const { root } = await render('<mds-tab-item></mds-tab-item>');

    expect(root).toHaveAttribute('hydrated');
  });
});
