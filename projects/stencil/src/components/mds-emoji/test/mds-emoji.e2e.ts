import { render, vi } from '@stencil/vitest';

describe('mds-emoji', () => {
  it('renders', async () => {
    const { root } = await render('<mds-emoji></mds-emoji>');

    expect(root).toHaveAttribute('hydrated');
  });

  it('keeps its svg flat, since Firefox paints nothing inside an svg that preserves 3D', async () => {
    const { root } = await render('<mds-emoji name="mia"></mds-emoji>');
    const svg = await vi.waitFor(() => {
      const el = root.shadowRoot?.querySelector('svg');
      expect(el).toBeTruthy();
      return el as SVGSVGElement;
    });

    expect(getComputedStyle(svg).transformStyle).toBe('flat');
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

  // #1140: blinking started in the frame of the load, while the first pose of the face moved
  // the origin of the eyes the blink had squashed, left them lower than the face draws them,
  // for good (48 viewBox units on simi, half a unit on mia)
  describe('the eyes, when blinking and tracking start in the frame of the load', () => {
    /**
     * How far the transform of a part moves its centre from where the face draws it, in viewBox
     * units. A blink may leave the hidden closed eyes scaled, around their centre: that moves
     * nothing.
     */
    const centreShift = (emoji: HTMLElement, id: string): number => {
      const part = emoji.shadowRoot!.querySelector(`[id='${id}']`) as SVGGraphicsElement;
      const box = part.getBBox();
      const centre = new DOMPoint(box.x + box.width / 2, box.y + box.height / 2);
      const moved = centre.matrixTransform(part.transform.baseVal.consolidate()?.matrix);
      return Math.hypot(moved.x - centre.x, moved.y - centre.y);
    };

    it.each(['simi', 'mia'])('of %s go back where the face draws them', async (name) => {
      const { root } = await render('<div></div>');
      const emoji = document.createElement('mds-emoji');
      emoji.setAttribute('name', name);
      emoji.style.width = '100px';
      root.appendChild(emoji);
      await emoji.componentOnReady();
      // the same frame, as a page that starts the face as soon as it is there
      void emoji.startBlinking();
      void emoji.startFollowMouse();
      await new Promise((resolve) => setTimeout(resolve, 600));

      await emoji.stopBlinking();
      await emoji.stopFollowMouse();

      for (const id of ['eyes-default', 'eyes-closed']) {
        await vi.waitFor(() => expect(centreShift(emoji, id)).toBeLessThan(0.05), {
          interval: 100,
          timeout: 3000,
        });
      }
    });
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
      const { root, waitForChanges } = await render<HTMLMdsEmojiElement>(
        '<mds-emoji name="simi"></mds-emoji>',
      );

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

  // A slotted emoji loads before its host renders the slot. Outside the flat tree its computed
  // style is empty: every duration fell back to 1000 seconds and the head took minutes to turn.
  // And GSAP, to read the transform of a host that is not drawn, appends it to <html> for a
  // moment: the emoji took it for a disconnect and dropped its pointer listener for good.
  it('follows the pointer at its own speed when it loads before the slot that shows it', async () => {
    const { root } = await render('<div></div>');
    const shadow = root.attachShadow({ mode: 'open' });
    const emoji = document.createElement('mds-emoji');
    emoji.style.cssText = 'width: 100px; height: 100px';
    root.appendChild(emoji);
    await vi.waitFor(() => expect(emoji).toHaveAttribute('hydrated'));

    shadow.innerHTML = '<slot></slot>';
    await emoji.startFollowMouse();
    const rect = emoji.getBoundingClientRect();
    window.dispatchEvent(
      new MouseEvent('mousemove', {
        clientX: rect.left + rect.width / 2 + 2000,
        clientY: rect.top + rect.height / 2,
      }),
    );
    // the head turns in 0.3s by default: long before a second it is all the way to the side
    await new Promise((resolve) => setTimeout(resolve, 800));

    const rotateY = Number(/rotateY\((-?[\d.]+)deg\)/.exec(emoji.style.transform)?.[1] ?? 0);
    expect(rotateY).toBeGreaterThan(8);
  });

  // the pointer listener was added once, on load, and a disconnect removed it for good
  it('follows the pointer again once it is taken out of the page and put back', async () => {
    const { root } = await render(
      '<div><mds-emoji style="width: 100px; height: 100px"></mds-emoji></div>',
    );
    const emoji = root.querySelector('mds-emoji')!;
    await vi.waitFor(() => expect(emoji).toHaveAttribute('hydrated'));

    emoji.remove();
    await new Promise((resolve) => setTimeout(resolve, 50));
    root.appendChild(emoji);
    await emoji.startFollowMouse();
    const rect = emoji.getBoundingClientRect();
    window.dispatchEvent(
      new MouseEvent('mousemove', {
        clientX: rect.left + rect.width / 2 + 2000,
        clientY: rect.top + rect.height / 2,
      }),
    );
    await new Promise((resolve) => setTimeout(resolve, 800));

    const rotateY = Number(/rotateY\((-?[\d.]+)deg\)/.exec(emoji.style.transform)?.[1] ?? 0);
    expect(rotateY).toBeGreaterThan(8);
  });
});
