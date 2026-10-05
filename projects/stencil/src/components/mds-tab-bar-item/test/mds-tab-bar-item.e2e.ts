import { render } from '@stencil/vitest';
import { itReadsTheSlottedLabelWhenLabelIsNull } from '@test/slot';

describe('mds-tab-bar-item', () => {
  it('renders', async () => {
    const { root } = await render('<mds-tab-bar-item></mds-tab-bar-item>');

    expect(root).toHaveAttribute('hydrated');
  });

  itReadsTheSlottedLabelWhenLabelIsNull('mds-tab-bar-item');
});
