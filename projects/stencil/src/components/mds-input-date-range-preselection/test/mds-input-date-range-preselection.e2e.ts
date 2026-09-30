import { render } from '@stencil/vitest';

describe('mds-input-date-range-preselection', () => {
  it('renders', async () => {
    const { root } = await render(
      '<mds-input-date-range-preselection></mds-input-date-range-preselection>',
    );

    expect(root).toHaveAttribute('hydrated');
  });
});
