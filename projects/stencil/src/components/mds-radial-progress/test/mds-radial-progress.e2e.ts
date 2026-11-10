import { render, vi } from '@stencil/vitest';

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

    // A manual clock for every animation frame callback, the tween and the Stencil render queue
    // (taskQueue 'async') alike: they run only when frame(time) runs them, with that time.
    let lastId = 0;
    const callbacks = new Map<number, FrameRequestCallback>();
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      callbacks.set(++lastId, callback);
      return lastId;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
      callbacks.delete(id);
    });

    // The inline value the component writes, not the computed one the CSS transition moves.
    const ring = () => root.style.getPropertyValue('--mds-radial-progress');
    const drawn = [ring()];
    const frame = async (time: number) => {
      const due = [...callbacks.values()];
      callbacks.clear();
      due.forEach((callback) => callback(time));
      await new Promise((resolve) => setTimeout(resolve));
      if (drawn.at(-1) !== ring()) drawn.push(ring());
    };

    // progress changes at 1000 ms inside a frame that began at 990 ms, as in a scroll handler.
    const now = vi.spyOn(performance, 'now').mockReturnValue(1000);
    root.progress = 0.6;
    now.mockRestore();

    for (const time of [990, 1100, 1250, 1500]) await frame(time);
    for (let i = 0; i < 5 && callbacks.size > 0; i++) await frame(1500);

    // 0.5 + 0.1 * easeOutExpo(t) over 500 ms: t = 0 at 990 ms (it was -0.02, drawn as 48.51%),
    // then 0.2, 0.5 and 1.
    expect(drawn).toEqual(['50.00%', '57.50%', '59.69%', '60.00%']);
  });
});
