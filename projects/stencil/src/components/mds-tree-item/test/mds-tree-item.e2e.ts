import { render } from '@stencil/vitest';

describe('mds-tree-item', () => {
  it('renders', async () => {
    const { root } = await render('<mds-tree-item></mds-tree-item>');

    expect(root).toHaveAttribute('hydrated');
  });
});
