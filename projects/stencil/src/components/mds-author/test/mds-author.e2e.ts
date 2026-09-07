import { render } from '@stencil/vitest';

describe('mds-author', () => {
  it('renders', async () => {
    const { root } = await render('<mds-author></mds-author>');

    expect(root).toHaveAttribute('hydrated');
  });
});
