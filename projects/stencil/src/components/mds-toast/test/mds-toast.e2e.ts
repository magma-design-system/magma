import { render } from '@stencil/vitest';
import { describeConditionalSlot } from '@test/slot';

describe('mds-toast', () => {
  it('renders', async () => {
    const { root } = await render('<mds-toast>Text</mds-toast>');

    expect(root).toHaveAttribute('hydrated');
  });

  describeConditionalSlot({
    html: '<mds-toast>Text</mds-toast>',
    slot: 'action',
    region: '.actions',
  });
});
