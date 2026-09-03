import { render } from '@stencil/vitest';

describe('mds-breadcrumb-item', () => {
  it('renders', async () => {
    const { root } = await render('<mds-breadcrumb-item></mds-breadcrumb-item>');

    expect(root).toHaveAttribute('hydrated');
  });
});
