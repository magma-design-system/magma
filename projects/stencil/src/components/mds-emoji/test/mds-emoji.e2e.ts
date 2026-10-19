import { render, vi } from '@stencil/vitest';

describe('mds-emoji', () => {
  it('renders', async () => {
    const { root } = await render('<mds-emoji></mds-emoji>');

    expect(root).toHaveAttribute('hydrated');
  });

  // #825: a name outside the dictionary threw a TypeError
  describe('an unknown name', () => {
    beforeEach(() => {
      vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    it('draws no face on load, and the pointer moves nothing', async () => {
      const consoleError = vi.spyOn(console, 'error');

      const { root } = await render('<mds-emoji name="nobody"></mds-emoji>');
      window.dispatchEvent(new MouseEvent('mousemove', { clientX: 10, clientY: 10 }));
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(consoleError).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('"nobody"'));
      expect(root.shadowRoot!.querySelector('svg')).toBeNull();
    });

    it('set after load leaves the face it shows', async () => {
      const consoleError = vi.spyOn(console, 'error');
      const { root, waitForChanges } = await render('<mds-emoji name="simi"></mds-emoji>');

      root.setAttribute('name', 'nobody');
      await waitForChanges();

      expect(consoleError).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('"nobody"'));
      expect(root).toEqualAttribute('name', 'simi');
      expect(root.name).toBe('simi');
      expect(root.shadowRoot!.querySelector('svg')).not.toBeNull();
    });
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
