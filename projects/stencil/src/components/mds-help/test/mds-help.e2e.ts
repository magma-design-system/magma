import { render } from '@stencil/vitest';
import { mockIconFetch } from '@test/fetch';

describe('mds-help', () => {
  it('renders without icon', async () => {
    const { root } = await render('<mds-help icon=""></mds-help>');

    expect(root).toHaveAttribute('hydrated');
  });

  it('renders with icon', async () => {
    mockIconFetch();
    const { root } = await render('<mds-help></mds-help>');

    expect(root).toHaveAttribute('hydrated');
  });
});
