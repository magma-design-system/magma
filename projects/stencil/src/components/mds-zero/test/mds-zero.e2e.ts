import { render } from '@stencil/vitest';
import { describeConditionalSlot } from '@test/slot';

describe('mds-zero', () => {
  it('renders', async () => {
    const { root } = await render('<mds-zero></mds-zero>');

    expect(root).toHaveAttribute('hydrated');
  });

  // with no action the footer takes no room, so the gap before it does not add to the inset
  describeConditionalSlot({
    html: '<mds-zero><mds-text slot="content">Nessuna richiesta</mds-text></mds-zero>',
    slot: 'action',
    region: '.actions',
  });
});
