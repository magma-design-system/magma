import { render } from '@stencil/vitest';

describe('mds-button-dropdown', () => {
  it('renders', async () => {
    const { root } = await render('<mds-button-dropdown></mds-button-dropdown>');

    expect(root).toHaveAttribute('hydrated');
  });
});
