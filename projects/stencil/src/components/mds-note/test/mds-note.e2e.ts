import { render } from '@stencil/vitest';

describe('mds-note', () => {
  it('renders', async () => {
    const { root } = await render('<mds-note></mds-note>');

    expect(root).toHaveAttribute('hydrated');
  });
});
