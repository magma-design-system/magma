import { render } from '@stencil/vitest';

describe('mds-tab', () => {
  it('renders', async () => {
    const { root } = await render('<mds-tab></mds-tab>');

    expect(root).toHaveAttribute('hydrated');
  });
});
