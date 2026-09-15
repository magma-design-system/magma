import { render } from '@stencil/vitest';
import { describeConditionalSlot } from '@test/slot';

describe('mds-author', () => {
  it('renders', async () => {
    const { root } = await render('<mds-author></mds-author>');

    expect(root).toHaveAttribute('hydrated');
  });

  describeConditionalSlot({
    html: '<mds-author>Name</mds-author>',
    slot: 'avatar',
    region: '.avatar',
    childTag: 'span',
  });
});
