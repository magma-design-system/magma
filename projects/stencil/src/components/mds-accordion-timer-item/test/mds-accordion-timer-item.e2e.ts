import { render } from '@stencil/vitest';

describe('mds-accordion-timer-item', () => {
  it('renders', async () => {
    const { root } = await render('<mds-accordion-timer-item></mds-accordion-timer-item>');

    expect(root).toHaveAttribute('hydrated');
  });
});
