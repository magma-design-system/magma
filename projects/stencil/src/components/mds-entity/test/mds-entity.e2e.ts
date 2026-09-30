import { render } from '@stencil/vitest';
import { describeConditionalSlot } from '@test/slot';

describe('mds-entity', () => {
  it('renders', async () => {
    const { root } = await render('<mds-entity>Name</mds-entity>');

    expect(root).toHaveAttribute('hydrated');
  });

  describeConditionalSlot({
    html: '<mds-entity>Name</mds-entity>',
    slot: 'detail',
    region: '.details',
    childTag: 'span',
  });

  describeConditionalSlot({
    html: '<mds-entity>Name</mds-entity>',
    slot: 'action',
    region: '.actions',
  });
});
