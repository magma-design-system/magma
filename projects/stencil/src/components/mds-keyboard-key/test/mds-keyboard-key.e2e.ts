import { render } from '@stencil/vitest';

describe('mds-keyboard-key', () => {
  it('renders', async () => {
    const { root } = await render('<mds-keyboard-key></mds-keyboard-key>');

    expect(root).toHaveAttribute('hydrated');
  });
});
