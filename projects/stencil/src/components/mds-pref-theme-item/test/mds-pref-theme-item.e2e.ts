import { render } from '@stencil/vitest';

describe('mds-pref-theme-item', () => {
  it('renders', async () => {
    const { root } = await render('<mds-pref-theme-item></mds-pref-theme-item>');

    expect(root).toHaveAttribute('hydrated');
  });
});
