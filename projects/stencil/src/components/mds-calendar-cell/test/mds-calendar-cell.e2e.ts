import { render } from '@stencil/vitest';

describe('mds-calendar-cell', () => {
  it('renders', async () => {
    const { root } = await render('<mds-calendar-cell></mds-calendar-cell>');

    expect(root).toHaveAttribute('hydrated');
  });
});
