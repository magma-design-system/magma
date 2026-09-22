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

    it('keeps display in the transition list once it is placed, so the outro can play', async () => {
      const { root } = await stage(
        '<mds-dropdown id="panel" target="#caller" placement="bottom" disable-auto-placement visible>Panel</mds-dropdown>',
      );
      const panel = root.querySelector('#panel') as HTMLElement;

      await vi.waitFor(() => {
        expect(panel).toHaveAttribute('data-floating-placed');
      });

      // the panel is display:none when closed and the sheet holds it visible for the
      // outro with transition-behavior: allow-discrete - drop `display` from the list
      // and the panel is gone on the frame the attribute goes, with no fade at all
      expect(getComputedStyle(panel).transitionProperty).toContain('display');
    });

    it('pivots on the side that faces the caller when the placement is left', async () => {
      const { root } = await stage(
        '<mds-dropdown id="panel" target="#caller" placement="left" disable-auto-placement visible>Panel</mds-dropdown>',
      );
      const panel = root.querySelector('#panel') as HTMLElement;

      await vi.waitFor(() => {
        expect(panel.style.transformOrigin).not.toBe('');
      });

      const arrow = panel.shadowRoot!.querySelector('.arrow') as HTMLElement;
      const [x, y] = panel.style.transformOrigin.split(' ');

      // a panel to the left of its caller has to unfurl from its own right edge,
      // the side the arrow is on, at the height the arrow sits at
      expect(x).toBe('right');
      expect(Math.round(parseFloat(y))).toBe(Math.round(arrow.offsetTop + arrow.offsetHeight / 2));
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

  describe('aria wiring', () => {
    it('names the popup on the caller with an IDREF, and the caller back on the popup', async () => {
      const { root } = await stage('<mds-dropdown id="panel" target="#caller">Menu</mds-dropdown>');
      const panel = root.querySelector('#panel') as HTMLElement;
      const caller = root.querySelector('#caller') as HTMLElement;

      // the wiring waits for the caller: an mds-button writes its own role at load
      await vi.waitFor(() => {
        expect(caller).toHaveAttribute('aria-controls');
      });

      // it used to write the selector of the caller, `#caller`, which names no element at all,
      // and to point the caller at itself instead of at the panel it opens
      expect(caller).toEqualAttribute('aria-controls', 'panel');
      expect(caller).toEqualAttribute('aria-haspopup', 'menu');
      expect(panel).toEqualAttribute('role', 'menu');
      expect(panel).toEqualAttribute('aria-labelledby', 'caller');
    });

    it('gives an id to a caller and a popup that have none', async () => {
      const { root } = await render(
        '<button id="caller">Open</button><mds-dropdown target="#caller">Menu</mds-dropdown>',
      );
      const panel = root.parentElement!.querySelector('mds-dropdown') as HTMLElement;
      const caller = root.parentElement!.querySelector('#caller') as HTMLElement;

      await vi.waitFor(() => {
        expect(caller).toHaveAttribute('aria-controls');
      });

      expect(panel.id).not.toBe('');
      expect(caller.getAttribute('aria-controls')).toBe(panel.id);
    });

    it('follows the state of the popup on the caller', async () => {
      const { root } = await stage('<mds-dropdown id="panel" target="#caller">Menu</mds-dropdown>');
      const panel = root.querySelector('#panel') as HTMLMdsDropdownElement;
      const caller = root.querySelector('#caller') as HTMLElement;

      await vi.waitFor(() => {
        expect(caller).toEqualAttribute('aria-expanded', 'false');
      });

      panel.visible = true;

      await vi.waitFor(() => {
        expect(caller).toEqualAttribute('aria-expanded', 'true');
      });
    });

    it('leaves an mds-tab-item caller unwired, its tab being the inner button', async () => {
      const { root } = await render(
        `<div>
           <mds-tab><mds-tab-item id="caller" label="Tab"></mds-tab-item></mds-tab>
           <mds-dropdown id="panel" target="#caller">Menu</mds-dropdown>
         </div>`,
      );
      const panel = root.querySelector('#panel') as HTMLElement;
      const caller = root.querySelector('#caller') as HTMLElement;

      expect(panel).toEqualAttribute('role', 'menu');
      // the host of the item is generic, the tab being its inner button: the attributes it
      // accepts none of are left off it
      expect(caller).not.toHaveAttribute('aria-haspopup');
      expect(caller).not.toHaveAttribute('aria-controls');
      expect(caller).not.toHaveAttribute('aria-expanded');
    });
  });

  describe('entries of the menu', () => {
    it('names as entries the elements the slot receives', async () => {
      const { root } = await stage(
        `<mds-dropdown id="panel" target="#caller">
           <mds-button label="One"></mds-button>
           <a id="link" href="#">Two</a>
         </mds-dropdown>`,
      );
      const panel = root.querySelector('#panel') as HTMLElement;

      await vi.waitFor(() => {
        expect(panel.querySelector('mds-button')).toHaveAttribute('role');
      });

      // a menu accepts none of its children as anything but an entry
      expect(panel.querySelector('mds-button')).toEqualAttribute('role', 'menuitem');
      expect(panel.querySelector('#link')).toEqualAttribute('role', 'menuitem');
    });

    it('leaves the contents of a panel that declares another role alone', async () => {
      const { root } = await stage(
        `<mds-dropdown id="panel" target="#caller" role="group">
           <mds-button label="One"></mds-button>
         </mds-dropdown>`,
      );
      const panel = root.querySelector('#panel') as HTMLElement;
      const caller = root.querySelector('#caller') as HTMLElement;

      await vi.waitFor(() => {
        expect(caller).toHaveAttribute('aria-controls');
      });

      expect(panel).toEqualAttribute('role', 'group');
      expect(panel.querySelector('mds-button')).not.toEqualAttribute('role', 'menuitem');
      // `group` is not a popup aria-haspopup knows how to name
      expect(caller).not.toHaveAttribute('aria-haspopup');
    });
  });
});
