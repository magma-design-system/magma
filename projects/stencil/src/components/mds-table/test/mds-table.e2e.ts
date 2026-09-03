import { render } from '@stencil/vitest';

describe('mds-table', () => {
  it('renders', async () => {
    const { root } = await render('<mds-table></mds-table>');

    expect(root).toHaveAttribute('hydrated');
  });
});
