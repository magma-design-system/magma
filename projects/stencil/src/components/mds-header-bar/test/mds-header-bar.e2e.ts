import { render } from '@stencil/vitest';
import { describeConditionalSlot } from '@test/slot';

describe('mds-header-bar', () => {
  it('renders', async () => {
    const { root } = await render('<mds-header-bar><span>Logo</span></mds-header-bar>');

    expect(root).toHaveAttribute('hydrated');
  });

  describeConditionalSlot({
    html: '<mds-header-bar><span>Logo</span></mds-header-bar>',
    slot: 'nav',
    region: '.nav',
  });
});
