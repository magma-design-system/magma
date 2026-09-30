import { render } from '@stencil/vitest';

describe('mds-pref-animation', () => {
  it('renders', async () => {
    const { root } = await render('<mds-pref-animation></mds-pref-animation>');

    expect(root).toHaveAttribute('hydrated');
  });
});
