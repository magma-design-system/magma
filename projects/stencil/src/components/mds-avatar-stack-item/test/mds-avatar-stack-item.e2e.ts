import { render } from '@stencil/vitest';

describe('mds-avatar-stack-item', () => {
  it('renders', async () => {
    const { root } = await render('<mds-avatar-stack-item></mds-avatar-stack-item>');

    expect(root).toHaveAttribute('hydrated');
  });
});
