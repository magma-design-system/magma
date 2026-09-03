import { render } from '@stencil/vitest';

describe('mds-input-otp', () => {
  it('renders', async () => {
    const { root } = await render('<mds-input-otp></mds-input-otp>');

    expect(root).toHaveAttribute('hydrated');
  });
});
