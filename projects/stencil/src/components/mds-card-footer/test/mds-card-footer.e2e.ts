import { render } from '@stencil/vitest';

describe('mds-card-footer', () => {
  it('renders', async () => {
    const { root } = await render('<mds-card-footer></mds-card-footer>');

    expect(root).toHaveAttribute('hydrated');
  });
});
