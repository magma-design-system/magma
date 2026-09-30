import { render } from '@stencil/vitest';
import { describeConditionalSlot } from '@test/slot';

describe('mds-card-header', () => {
  it('renders', async () => {
    const { root } = await render('<mds-card-header></mds-card-header>');

    expect(root).toHaveAttribute('hydrated');
  });

  describeConditionalSlot({
    html: '<mds-card-header>Title</mds-card-header>',
    slot: 'action',
    region: '.actions',
  });
});
