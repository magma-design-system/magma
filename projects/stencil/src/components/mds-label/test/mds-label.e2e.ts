import { render } from '@stencil/vitest';

describe('mds-label', () => {
  it('renders', async () => {
    const { root } = await render('<mds-label></mds-label>');

    expect(root).toHaveAttribute('hydrated');
  });
});
