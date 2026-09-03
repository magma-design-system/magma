import { render } from '@stencil/vitest';

describe('mds-progress', () => {
  it('renders', async () => {
    const { root } = await render('<mds-progress></mds-progress>');

    expect(root).toHaveAttribute('hydrated');
  });
});
