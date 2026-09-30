import { render } from '@stencil/vitest';

describe('mds-card-media', () => {
  it('renders', async () => {
    const { root } = await render('<mds-card-media></mds-card-media>');

    expect(root).toHaveAttribute('hydrated');
  });
});
