import { render } from '@stencil/vitest';

describe('mds-input-switch', () => {
  it('renders', async () => {
    const { root } = await render('<mds-input-switch></mds-input-switch>');

    expect(root).toHaveAttribute('hydrated');
  });
});
