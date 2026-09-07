import { render } from '@stencil/vitest';

describe('mds-input-tip-item', () => {
  it('renders', async () => {
    const { root } = await render('<mds-input-tip-item></mds-input-tip-item>');

    expect(root).toHaveAttribute('hydrated');
  });
});
