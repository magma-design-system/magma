import { render } from '@stencil/vitest';

describe('mds-banner', () => {
  it('renders', async () => {
    const { root } = await render('<mds-banner></mds-banner>');

    expect(root).toHaveAttribute('hydrated');
  });
});
