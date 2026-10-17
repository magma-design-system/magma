import { render } from '@stencil/vitest';
import { userEvent } from 'vitest/browser';
import { mockIconFetch } from '@test/fetch';

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

  // #923: on an icon-only button the text of the tooltip is the name of the button
  describe('naming its caller, with relation="label"', () => {
    it('labels the caller instead of describing it', async () => {
      const { root } = await render(
        '<mds-tooltip target="#caller" relation="label">Tokens</mds-tooltip><button id="caller"></button>',
      );
      const caller = root.parentElement!.querySelector('#caller')!;

      await vi.waitFor(() => {
        expect(caller).toHaveAttribute('aria-labelledby');
      });

      expect(caller.getAttribute('aria-labelledby')).toBe(root.id);
      expect(caller).not.toHaveAttribute('aria-describedby');
      expect(root).toEqualAttribute('role', 'tooltip');
    });

    it('leaves an icon-only mds-button with the tooltip as its only name', async () => {
      mockIconFetch();
      const { root } = await render(
        `<div>
           <mds-button id="caller" icon="mdi/alien"></mds-button>
           <mds-tooltip id="tip" target="#caller" relation="label">Tokens</mds-tooltip>
         </div>`,
      );
      const caller = root.querySelector('#caller')!;

      await vi.waitFor(() => {
        expect(caller).toEqualAttribute('aria-labelledby', 'tip');
      });

      // no native tooltip from the icon slug on top of the Magma one, no description repeating it
      await vi.waitFor(() => {
        expect(caller).not.toHaveAttribute('title');
      });
      expect(caller).not.toHaveAttribute('aria-label');
      expect(caller).not.toHaveAttribute('aria-describedby');
    });

    it('moves from describing to labelling the caller and back when relation changes', async () => {
      const { root } = await render(
        '<mds-tooltip target="#caller">Tokens</mds-tooltip><button id="caller"></button>',
      );
      const tip = root as HTMLMdsTooltipElement;
      const caller = root.parentElement!.querySelector('#caller')!;
      await vi.waitFor(() => {
        expect(caller).toHaveAttribute('aria-describedby');
      });

      tip.relation = 'label';
      await vi.waitFor(() => {
        expect(caller).toEqualAttribute('aria-labelledby', tip.id);
      });
      expect(caller).not.toHaveAttribute('aria-describedby');

      tip.relation = 'description';
      await vi.waitFor(() => {
        expect(caller).toEqualAttribute('aria-describedby', tip.id);
      });
      expect(caller).not.toHaveAttribute('aria-labelledby');
    });

    it('leaves alone a caller that is already labelled', async () => {
      const { root } = await render(
        '<mds-tooltip target="#caller" relation="label">Tokens</mds-tooltip><button id="caller" aria-labelledby="own"></button><span id="own">Own</span>',
      );
      const caller = root.parentElement!.querySelector('#caller')!;

      // the id goes on the tooltip right before the caller is written
      await vi.waitFor(() => {
        expect(root.id).not.toBe('');
      });

      expect(caller).toEqualAttribute('aria-labelledby', 'own');
    });
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
  // the tooltip opened on mouseenter only: keyboard users never saw it, and every new target
  // added two listeners that nothing removed (#820)
  describe('showing', () => {
    const stage = () =>
      render(
        `<div style="position: relative; height: 200px">
           <button id="first">First</button>
           <button id="second">Second</button>
           <mds-tooltip id="tip" target="#first">Hint</mds-tooltip>
         </div>`,
      );

    it('shows while the caller has the focus', async () => {
      const { root, waitForChanges } = await stage();
      const tip = root.querySelector('#tip') as HTMLMdsTooltipElement;
      await vi.waitFor(() =>
        expect(root.querySelector('#first')).toHaveAttribute('aria-describedby'),
      );

      await userEvent.keyboard('{Tab}');
      await waitForChanges();
      expect(document.activeElement).toBe(root.querySelector('#first'));
      expect(tip.visible).toBe(true);

      await userEvent.keyboard('{Tab}');
      await waitForChanges();
      expect(tip.visible).toBe(false);
    });

    it('shows while the pointer is over the caller, and stays while it keeps the focus', async () => {
      const { root, waitForChanges } = await stage();
      const tip = root.querySelector('#tip') as HTMLMdsTooltipElement;
      const first = root.querySelector('#first') as HTMLElement;
      await vi.waitFor(() => expect(first).toHaveAttribute('aria-describedby'));

      await userEvent.hover(first);
      await waitForChanges();
      expect(tip.visible).toBe(true);

      first.focus();
      await userEvent.unhover(first);
      await waitForChanges();
      expect(tip.visible).toBe(true);
    });

    it('hides on Escape until the caller is focused again', async () => {
      const { root, waitForChanges } = await stage();
      const tip = root.querySelector('#tip') as HTMLMdsTooltipElement;
      const first = root.querySelector('#first') as HTMLElement;
      await vi.waitFor(() => expect(first).toHaveAttribute('aria-describedby'));

      first.focus();
      await waitForChanges();
      expect(tip.visible).toBe(true);

      await userEvent.keyboard('{Escape}');
      await waitForChanges();
      expect(tip.visible).toBe(false);

      first.blur();
      first.focus();
      await waitForChanges();
      expect(tip.visible).toBe(true);
    });

    it('stops listening to the caller it leaves for a new target', async () => {
      const { root, waitForChanges } = await stage();
      const tip = root.querySelector('#tip') as HTMLMdsTooltipElement;
      const first = root.querySelector('#first') as HTMLElement;
      const second = root.querySelector('#second') as HTMLElement;
      await vi.waitFor(() => expect(first).toHaveAttribute('aria-describedby'));

      tip.target = '#second';
      await vi.waitFor(() => expect(second).toHaveAttribute('aria-describedby'));
      first.focus();
      await waitForChanges();
      expect(tip.visible).toBe(false);

      second.focus();
      await waitForChanges();
      expect(tip.visible).toBe(true);
    });
  });
});
