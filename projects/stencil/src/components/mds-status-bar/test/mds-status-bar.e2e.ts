import { render } from '@stencil/vitest';
import { userEvent } from 'vitest/browser';

describe('mds-status-bar', () => {
  it('renders', async () => {
    const { root } = await render('<mds-status-bar></mds-status-bar>');

    expect(root).toHaveAttribute('hydrated');
  });

  // the inner modal got hideBackdrop after its own load: a bar visible at load opened a modal
  // dialog, the page went inert and Esc closed the bar without updating visible (#820)
  describe('visible at load', () => {
    const stage = () =>
      render(
        `<div>
           <button id="page">Page</button>
           <mds-status-bar visible description="Cookie"><button>OK</button></mds-status-bar>
         </div>`,
      );

    it('leaves the page usable', async () => {
      const { root } = await stage();
      const bar = root.querySelector('mds-status-bar')!;
      const dialog = bar
        .shadowRoot!.querySelector('mds-modal')!
        .shadowRoot!.querySelector('dialog')!;
      const page = root.querySelector<HTMLButtonElement>('#page')!;

      expect(dialog.open).toBe(true);
      expect(dialog.matches(':modal')).toBe(false);

      page.focus();
      expect(document.activeElement).toBe(page);
    });

    it('stays visible on Esc', async () => {
      const { root, waitForChanges } = await stage();
      const bar = root.querySelector('mds-status-bar')!;

      root.querySelector<HTMLButtonElement>('mds-status-bar button')!.focus();
      await userEvent.keyboard('{Escape}');
      await waitForChanges();

      expect(bar).toHaveAttribute('visible');
    });

    it('follows its modal when the modal closes itself', async () => {
      const { root, waitForChanges } = await stage();
      const bar = root.querySelector('mds-status-bar')!;
      const modal = bar.shadowRoot!.querySelector('mds-modal')!;

      modal.opened = false;
      await waitForChanges();

      expect(bar).not.toHaveAttribute('visible');
    });
  });
});
