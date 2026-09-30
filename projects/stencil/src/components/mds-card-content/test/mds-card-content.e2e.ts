import { render } from '@stencil/vitest';

describe('mds-card-content', () => {
  it('renders', async () => {
    const { root } = await render('<mds-card-content></mds-card-content>');

    expect(root).toHaveAttribute('hydrated');
  });
});
