import { render } from '@stencil/vitest';

/** Where the arrow sits inside the panel, in layout coordinates - the space
 * transform-origin is resolved in, so it stays comparable while the panel
 * animates. */
const arrowCentre = (dropdown: HTMLElement): number => {
  const arrow = dropdown.shadowRoot!.querySelector('.arrow') as HTMLElement;
  return arrow.offsetLeft + arrow.offsetWidth / 2;
};

const stage = (markup: string) =>
  render(
    `<div style="position: relative; height: 300px">
       <mds-button id="caller" label="Open"></mds-button>
       ${markup}
     </div>`,
  );

describe('mds-dropdown', () => {
  it('renders', async () => {
    const { root } = await render('<mds-dropdown></mds-dropdown>');

    expect(root).toHaveAttribute('hydrated');
  });

  describe('opening pivot', () => {
    it('places a dropdown that is visible from the markup', async () => {
      const { root } = await stage(
        '<mds-dropdown id="panel" target="#caller" placement="bottom" disable-auto-placement visible>Panel</mds-dropdown>',
      );
      const panel = root.querySelector('#panel') as HTMLElement;

      // the visible watcher does not fire for the initial value: without the call
      // at load the panel is never positioned and sits at the page corner
      await vi.waitFor(() => {
        expect(panel.style.left).not.toBe('');
      });

      expect(panel).toHaveAttribute('data-floating-placed');
      expect(panel.style.top).not.toBe('');
    });

    it('pivots the opening on the arrow, not on the middle of the panel', async () => {
      const { root } = await stage(
        '<mds-dropdown id="panel" target="#caller" placement="bottom" disable-auto-placement visible>A panel wide enough for the arrow to sit off centre</mds-dropdown>',
      );
      const panel = root.querySelector('#panel') as HTMLElement;

      await vi.waitFor(() => {
        expect(panel.style.transformOrigin).not.toBe('');
      });

      const [x, y] = panel.style.transformOrigin.split(' ');

      // the arrow middleware parks the arrow wherever it has to point at the
      // caller, so the pivot has to read it instead of assuming the centre
      expect(Math.round(parseFloat(x))).toBe(Math.round(arrowCentre(panel)));
      expect(y).toBe('top');
    });
  });
});
