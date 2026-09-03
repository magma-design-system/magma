import { render } from '@stencil/vitest';

describe('mds-accordion-timer', () => {
  it('renders', async () => {
    const { root } = await render('<mds-accordion-timer></mds-accordion-timer>');

    expect(root).toHaveAttribute('hydrated');
  });
});
