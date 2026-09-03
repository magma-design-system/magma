import { render } from '@stencil/vitest';

describe('mds-radial-progress', () => {
  it('renders', async () => {
    const { root } = await render('<mds-radial-progress></mds-radial-progress>');

    expect(root).toHaveAttribute('hydrated');
  });
});
