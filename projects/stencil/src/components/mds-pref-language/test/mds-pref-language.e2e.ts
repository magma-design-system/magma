import { render } from '@stencil/vitest';

describe('mds-pref-language', () => {
  it('renders', async () => {
    const { root } = await render('<mds-pref-language></mds-pref-language>');

    expect(root).toHaveAttribute('hydrated');
  });
});
