import { render } from '@stencil/vitest';

describe('mds-pref-theme-variant', () => {
  it('renders', async () => {
    const { root } = await render('<mds-pref-theme-variant></mds-pref-theme-variant>');

    expect(root).toHaveAttribute('hydrated');
  });
});
