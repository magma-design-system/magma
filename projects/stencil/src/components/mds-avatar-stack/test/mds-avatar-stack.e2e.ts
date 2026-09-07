import { render } from '@stencil/vitest';

describe('mds-avatar-stack', () => {
  it('renders', async () => {
    const { root } = await render('<mds-avatar-stack></mds-avatar-stack>');

    expect(root).toHaveAttribute('hydrated');
  });
});
