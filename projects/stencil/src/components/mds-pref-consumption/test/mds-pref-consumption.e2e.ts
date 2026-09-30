import { render } from '@stencil/vitest';

describe('mds-pref-consumption', () => {
  it('renders', async () => {
    const { root } = await render('<mds-pref-consumption></mds-pref-consumption>');

    expect(root).toHaveAttribute('hydrated');
  });
});
