import { render } from '@stencil/vitest';

describe('mds-table-header-cell', () => {
  it('renders', async () => {
    const { root } = await render('<mds-table-header-cell></mds-table-header-cell>');

    expect(root).toHaveAttribute('hydrated');
  });
});
