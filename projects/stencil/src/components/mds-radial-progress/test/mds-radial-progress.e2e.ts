import { render, vi } from '@stencil/vitest';

/**
 * A manual clock for every animation frame callback, the tween and the Stencil render queue
 * (taskQueue 'async') alike: they run only when frame(time) runs them, with that time.
 */
const frameClock = () => {
  let lastId = 0;
  const callbacks = new Map<number, FrameRequestCallback>();
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    callbacks.set(++lastId, callback);
    return lastId;
  });
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
    callbacks.delete(id);
  });
  return {
    frame: async (time: number) => {
      const due = [...callbacks.values()];
      callbacks.clear();
      due.forEach((callback) => callback(time));
      await new Promise((resolve) => setTimeout(resolve));
    },
    pending: () => callbacks.size > 0,
  };
};

/** Sets progress at 1000 ms by performance.now(), the time the tween starts from. */
const changeAt1000 = (root: HTMLMdsRadialProgressElement, progress: number) => {
  const now = vi.spyOn(performance, 'now').mockReturnValue(1000);
  root.progress = progress;
  now.mockRestore();
};

describe('mds-radial-progress', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders', async () => {
    const { root } = await render('<mds-radial-progress></mds-radial-progress>');

    expect(root).toHaveAttribute('hydrated');
  });

  it('exposes the progress value to assistive technology', async () => {
    const { root } = await render('<mds-radial-progress progress="0.65"></mds-radial-progress>');

    expect(root).toEqualAttributes({
      role: 'progressbar',
      'aria-valuemin': '0',
      'aria-valuemax': '100',
      'aria-valuenow': '65',
    });
  });

  it('never steps back past the current value when the first frame began before the change', async () => {
    const { root } = await render<HTMLMdsRadialProgressElement>(
      '<mds-radial-progress progress="0.5"></mds-radial-progress>',
    );
    const clock = frameClock();

    // The inline value the component writes.
    const ring = () => root.style.getPropertyValue('--mds-radial-progress');
    const drawn = [ring()];
    const frame = async (time: number) => {
      await clock.frame(time);
      if (drawn.at(-1) !== ring()) drawn.push(ring());
    };

    // progress changes at 1000 ms inside a frame that began at 990 ms, as in a scroll handler.
    changeAt1000(root, 0.6);
    for (const time of [990, 1100, 1250, 1500]) await frame(time);
    for (let i = 0; i < 5 && clock.pending(); i++) await frame(1500);

    // 0.5 + 0.1 * easeOutExpo(t) over 500 ms: t = 0 at 990 ms (it was -0.02, drawn as 48.51%),
    // then 0.2, 0.5 and 1.
    expect(drawn).toEqual(['50.00%', '57.50%', '59.69%', '60.00%']);
  });

  it('draws the ring where the tween is in every frame, with no CSS transition behind it', async () => {
    // globals.css registered --mds-radial-progress as a <length-percentage> until #1177, which
    // let a transition interpolate it: register it as a page with that globals.css does.
    try {
      CSS.registerProperty({
        name: '--mds-radial-progress',
        syntax: '<length-percentage>',
        inherits: true,
        initialValue: '0%',
      });
    } catch (error) {
      // registered by an earlier run on this page: the registry lasts as long as the document
      if (!(error instanceof DOMException && error.name === 'InvalidModificationError'))
        throw error;
    }
    const { root } = await render<HTMLMdsRadialProgressElement>(
      '<mds-radial-progress progress="0.5"></mds-radial-progress>',
    );
    const clock = frameClock();

    const read = (style: CSSStyleDeclaration) =>
      parseFloat(style.getPropertyValue('--mds-radial-progress'));
    const tween: number[] = [];
    const ring: number[] = [];
    const frame = async (time: number) => {
      await clock.frame(time);
      tween.push(read(root.style));
      ring.push(read(getComputedStyle(root)));
    };

    changeAt1000(root, 0.6);
    for (const time of [1016, 1100, 1250, 1500]) await frame(time);
    for (let i = 0; i < 5 && clock.pending(); i++) await frame(1500);

    // The ring drawn is the value the tween wrote in that frame, not a transition chasing it,
    // and it reaches 60 with the last frame of the tween, the number in the middle showing 60.
    expect(ring).toEqual(tween);
    expect(ring.at(-1)).toBe(60);
    expect(root.shadowRoot!.querySelector('.value')!.textContent).toBe('60');
  });
});
