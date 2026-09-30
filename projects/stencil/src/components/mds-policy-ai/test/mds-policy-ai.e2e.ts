import { render } from '@stencil/vitest';

describe('mds-policy-ai', () => {
  it('renders', async () => {
    const { root } = await render('<mds-policy-ai></mds-policy-ai>');

    expect(root).toHaveAttribute('hydrated');
  });
});
