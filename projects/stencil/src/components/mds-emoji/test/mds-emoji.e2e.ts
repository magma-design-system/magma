import { render } from '@stencil/vitest';

describe('mds-emoji', () => {
  it('renders', async () => {
    const { root } = await render('<mds-emoji></mds-emoji>');

    expect(root).toHaveAttribute('hydrated');
  });

  it('keeps the tracking off once stopped, after an expression ends', async () => {
    const { root } = await render<HTMLMdsEmojiElement>(
      '<mds-emoji style="width: 100px; height: 100px"></mds-emoji>',
    );
    /** The pose of the head once it stops moving. */
    const settledPose = async (): Promise<string> => {
      let last = '';
      await vi.waitFor(
        () => {
          const now = getComputedStyle(root).transform;
          const settled = now === last;
          last = now;
          expect(settled).toBe(true);
        },
        { interval: 200, timeout: 4000 },
      );
      return last;
    };
    await root.startFollowMouse();
    await root.stopFollowMouse();
    // the expression pauses the tracking and, once it ends, resumes it only if it was on
    await root.smile();
    const before = await settledPose();

    const rect = root.getBoundingClientRect();
    window.dispatchEvent(
      new MouseEvent('mousemove', { clientX: rect.right + 300, clientY: rect.bottom + 300 }),
    );
    await new Promise((resolve) => setTimeout(resolve, 600));

    expect(await settledPose()).toBe(before);
  });
});
