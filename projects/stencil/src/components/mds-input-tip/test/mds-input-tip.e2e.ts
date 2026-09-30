import { render } from '@stencil/vitest';

describe('mds-input-tip', () => {
  it('renders', async () => {
    const { root } = await render('<mds-input-tip></mds-input-tip>');

    expect(root).toHaveAttribute('hydrated');
  });
});
