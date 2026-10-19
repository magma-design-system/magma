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

  // the video followed only the OS media query, ignoring the Magma preference (#821)
  describe('with the animation preference', () => {
    afterEach(() => {
      document.documentElement.classList.remove(
        'pref-animation-reduce',
        'pref-animation-no-preference',
      );
    });

    const video = (root: HTMLElement) => root.shadowRoot!.querySelector('video')!;

    it.each([
      ['reduce', 'none'],
      ['no-preference', 'block'],
    ])('with %s, displays the video as %s', async (choice, display) => {
      document.documentElement.classList.add(`pref-animation-${choice}`);
      await new Promise((resolve) => setTimeout(resolve, 50));
      const { root } = await render('<mds-video-wall></mds-video-wall>');

      expect(root).toEqualAttribute('pref-animation', choice);
      expect(getComputedStyle(video(root)).display).toBe(display);
    });
  });
});
