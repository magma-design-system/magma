import { render } from '@stencil/vitest';

describe('mds-filter', () => {
  it('renders', async () => {
    const { root } = await render('<mds-filter></mds-filter>');

    expect(root).toHaveAttribute('hydrated');
  });
});
