import { render } from '@stencil/vitest';

describe('mds-notification', () => {
  it('renders', async () => {
    const { root } = await render(`<mds-notification target="#my-button"></mds-notification>
    <mds-button id="my-button">Incoming messages</mds-button>`);

    expect(root).toHaveAttribute('hydrated');
  });
});
