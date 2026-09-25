import { render } from '@stencil/vitest';

describe('mds-radial-progress', () => {
  it('renders', async () => {
    const { root } = await render('<mds-radial-progress></mds-radial-progress>');

    expect(root).toHaveAttribute('hydrated');
  });

  it('exposes the progress value to assistive technology', async () => {
    const { root } = await render('<mds-radial-progress progress="0.65"></mds-radial-progress>');

    expect(root).toEqualAttributes({
      role: 'progressbar',
      'aria-valuemin': '0',
      'aria-valuemax': '100',
      'aria-valuenow': '65',
    });
  });
});
