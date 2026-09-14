import { render } from '@stencil/vitest';
import { describeConditionalSlot } from '@test/slot';

describe('mds-video-wall', () => {
  it('renders', async () => {
    const { root } = await render('<mds-video-wall></mds-video-wall>');

    expect(root).toHaveAttribute('hydrated');
  });

  describeConditionalSlot({
    html: '<mds-video-wall></mds-video-wall>',
    slot: 'content',
    region: '.content',
    childTag: 'div',
  });
});
