import { render, vi } from '@stencil/vitest';

describe('mds-emoji', () => {
  it('renders', async () => {
    const { root } = await render('<mds-emoji></mds-emoji>');

    expect(root).toHaveAttribute('hydrated');
  });

  // #800: the pose came from the pointer offset divided by half the size of the emoji, so a
  // small emoji was already turned all the way where a large one had barely moved
  it('turns the same way at any size, for the same pointer offset from its centre', async () => {
    const { root } = await render(
      `<div style="display: flex; gap: 200px; padding: 40px">
         <mds-emoji id="small" style="width: 40px; height: 40px"></mds-emoji>
         <mds-emoji id="large" style="width: 200px; height: 200px"></mds-emoji>
       </div>`,
    );
    const pose = async (id: string): Promise<string> => {
      const emoji = root.querySelector<HTMLMdsEmojiElement>(`#${id}`)!;
      await vi.waitFor(() => expect(emoji).toHaveAttribute('hydrated'));
      await emoji.startFollowMouse();
      const rect = emoji.getBoundingClientRect();
      // 60px right and 22px down of the centre: past half the small one, inside half the large one
      window.dispatchEvent(
        new MouseEvent('mousemove', {
          clientX: rect.left + rect.width / 2 + 60,
          clientY: rect.top + rect.height / 2 + 22,
        }),
      );
      let last = '';
      // the head eases there: read it once it stops moving
      await vi.waitFor(
        () => {
          const now = getComputedStyle(emoji).transform;
          const settled = now === last && now !== 'none';
          last = now;
          expect(settled).toBe(true);
        },
        { interval: 150, timeout: 3000 },
      );
      return last;
    };

    expect(await pose('small')).toBe(await pose('large'));
  });
});
