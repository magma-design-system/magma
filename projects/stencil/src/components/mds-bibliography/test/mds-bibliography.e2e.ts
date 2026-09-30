import { render } from '@stencil/vitest';

describe('mds-bibliography', () => {
  it('renders', async () => {
    const { root } = await render('<mds-bibliography></mds-bibliography>');

    expect(root).toHaveAttribute('hydrated');
  });
});
