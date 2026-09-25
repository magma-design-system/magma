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
});
