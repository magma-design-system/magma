import { render } from '@stencil/vitest';

describe('mds-pref-theme-variant-item', () => {
  it('renders', async () => {
    const { root } = await render('<mds-pref-theme-variant-item></mds-pref-theme-variant-item>');

    expect(root).toHaveAttribute('hydrated');
  });
});
