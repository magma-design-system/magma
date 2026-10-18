import { render, vi } from '@stencil/vitest';

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

  // the expressions animated whatever the animation preference, while blinking and following
  // the pointer already held back (#821)
  describe('expressions with reduced motion', () => {
    afterEach(() => {
      document.documentElement.classList.remove('pref-animation-reduce');
    });

    const stage = async () => {
      document.documentElement.classList.add('pref-animation-reduce');
      await new Promise((resolve) => setTimeout(resolve, 50));
      const { root } = await render<HTMLMdsEmojiElement>('<mds-emoji></mds-emoji>');
      const part = (id: string) => root.shadowRoot!.querySelector<SVGElement>(`[id='${id}']`)!;
      return { root, part };
    };

    const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    it('smiles without moving, then hands the face back', async () => {
      const { root, part } = await stage();

      const at = () => root.getBoundingClientRect().toJSON();
      const smiling = root.smile();
      await wait(100);
      const early = at();
      expect(part('mouth-smile').style.visibility).toBe('visible');
      expect(part('eyes-closed').style.visibility).toBe('visible');

      // the bounce would have lifted and squeezed the face by now
      await wait(300);
      expect(at()).toEqual(early);

      await smiling;
      await vi.waitFor(() => expect(part('mouth-default').style.visibility).toBe('visible'));
      expect(part('eyes-default').style.visibility).toBe('visible');
    });

    it('frowns for the length of the disagreement, then smiles again', async () => {
      const { root, part } = await stage();

      const disagreeing = root.disagree();
      await wait(100);
      expect(part('mouth-serious').style.visibility).toBe('visible');

      await disagreeing;
      await vi.waitFor(() => expect(part('mouth-default').style.visibility).toBe('visible'));
    });

    it('shows the thinking hand at once, already in place', async () => {
      const { root, part } = await stage();

      await root.startThinking(0.5);

      expect(part('hand-think').style.visibility).toBe('visible');
      expect(part('mouth-serious').style.visibility).toBe('visible');
    });
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
