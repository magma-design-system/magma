import { render } from '@stencil/vitest';

describe('mds-list-item', () => {
  it('renders', async () => {
    const { root } = await render('<mds-list-item></mds-list-item>');

    expect(root).toHaveAttribute('hydrated');
  });
});
