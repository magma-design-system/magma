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
    expect(Math.round(parseFloat(tip.style.transformOrigin))).toBe(
      Math.round(arrow.offsetLeft + arrow.offsetWidth / 2),
    );
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
});
