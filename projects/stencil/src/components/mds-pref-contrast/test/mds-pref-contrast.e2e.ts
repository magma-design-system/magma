import { render } from '@stencil/vitest';

describe('mds-pref-contrast', () => {
  it('renders', async () => {
    const { root } = await render('<mds-pref-contrast></mds-pref-contrast>');

    expect(root).toHaveAttribute('hydrated');
  });
});
