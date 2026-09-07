import { render } from '@stencil/vitest';

describe('mds-button-group', () => {
  it('renders', async () => {
    const { root } = await render('<mds-button-group></mds-button-group>');

    expect(root).toHaveAttribute('hydrated');
  });
});
