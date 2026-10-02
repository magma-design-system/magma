import { render } from '@stencil/vitest';

describe('mds-tooltip', () => {
  it('renders', async () => {
    const { root } = await render('<mds-tooltip></mds-tooltip>');

    expect(root).toHaveAttribute('hydrated');
  });

  it('places a tooltip that is visible from the markup', async () => {
    const { root } = await render(
      `<div style="position: relative; height: 200px">
         <mds-button id="caller" label="Target"></mds-button>
         <mds-tooltip id="tip" target="#caller" placement="bottom" disable-auto-placement visible>Hint</mds-tooltip>
       </div>`,
    );
    const tip = root.querySelector('#tip') as HTMLElement;

    // the visible watcher does not fire for the initial value, so without the call
    // at load the tooltip is never positioned
    await vi.waitFor(() => {
      expect(tip.style.left).not.toBe('');
    });

    const arrow = tip.shadowRoot!.querySelector('.arrow') as HTMLElement;

    expect(tip.style.top).not.toBe('');
    // the pivot is written from the fractional arrow.x of floating-ui, while
    // offsetLeft and offsetWidth are rounded to whole pixels: the two can drift by
    // up to one pixel, so the comparison allows that rounding
    const pivot = parseFloat(tip.style.transformOrigin);
    const arrowCenter = arrow.offsetLeft + arrow.offsetWidth / 2;

    expect(Math.abs(pivot - arrowCenter)).toBeLessThanOrEqual(1);
  });

  it('describes its caller as a tooltip, not as a menu the caller controls', async () => {
    const { root } = await render(
      '<mds-tooltip target="#caller">Hint</mds-tooltip><button id="caller">Open</button>',
    );
    const caller = root.parentElement!.querySelector('#caller')!;

    // the text of the tooltip reaches a screen reader through the caller, or not at all
    await vi.waitFor(() => {
      expect(caller).toHaveAttribute('aria-describedby');
    });

    expect(root).toEqualAttribute('role', 'tooltip');
    expect(caller.getAttribute('aria-describedby')).toBe(root.id);
    expect(root.id).not.toBe('');
    expect(root).not.toHaveAttribute('aria-labelledby');
    expect(caller).not.toHaveAttribute('aria-haspopup');
    expect(caller).not.toHaveAttribute('aria-controls');
  });

  it('does not look for a caller once the target attribute is removed', async () => {
    const { root, waitForChanges } = await render(
      `<div style="position: relative; height: 200px">
         <mds-button id="caller" label="Target"></mds-button>
         <mds-tooltip id="tip" target="#caller">Hint</mds-tooltip>
       </div>`,
    );
    const warn = vi.spyOn(console, 'warn');

    root.querySelector('#tip')!.removeAttribute('target');
    await waitForChanges();

    expect(warn).not.toHaveBeenCalled();
  });

  describe('a target that names nothing', () => {
    const stage = () =>
      render(
        `<div style="position: relative; height: 200px">
           <mds-button id="caller" label="Target"></mds-button>
           <mds-tooltip id="tip" target="#nope">Hint</mds-tooltip>
         </div>`,
      );

    it('loads without throwing and leaves the page alone', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      // render throws what the lifecycle throws: the listeners used to be attached to a caller
      // that was never found
      const { root } = await stage();
      const tip = root.querySelector('#tip') as HTMLMdsTooltipElement;
      const caller = root.querySelector('#caller') as HTMLElement;

      expect(tip).toHaveAttribute('hydrated');
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('target not found: #nope'));
      expect(caller).not.toHaveAttribute('aria-describedby');
    });

    it('describes the caller once the target names an element', async () => {
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      const { root } = await stage();
      const tip = root.querySelector('#tip') as HTMLMdsTooltipElement;
      const caller = root.querySelector('#caller') as HTMLElement;

      tip.target = '#caller';

      await vi.waitFor(() => {
        expect(caller).toEqualAttribute('aria-describedby', 'tip');
      });
    });
  });
});
