import { render } from '@stencil/vitest';

describe('mds-input-select', () => {
  it('renders', async () => {
    const { root } = await render('<mds-input-select></mds-input-select>');

    expect(root).toHaveAttribute('hydrated');
  });
});
