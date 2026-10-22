import { render } from '@stencil/vitest';
import { page, userEvent } from 'vitest/browser';

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

  // #1019: show() moves the focus to the first focusable element of the bar too, and the browser
  // scrolled the dialog of the inner modal to bring it into view: the bar, still at
  // translate(0, 100%) below the page, scrolled up by its own height and never slid in
  it('slides in from below the page with a focusable element in it', async () => {
    const { root } = await render<HTMLMdsStatusBarElement>(
      '<mds-status-bar description="Cookie"><button>OK</button></mds-status-bar>',
    );
    const dialog = root
      .shadowRoot!.querySelector('mds-modal')!
      .shadowRoot!.querySelector('dialog')!;
    const area = root.shadowRoot!.querySelector<HTMLElement>('.status-bar-area')!;

    root.visible = true;
    // sampled on the first frame the dialog is open
    const start = await new Promise<{ top: number; scrollTop: number }>((resolve) => {
      const tick = (): void => {
        if (!dialog.open) {
          requestAnimationFrame(tick);
          return;
        }
        resolve({ top: area.getBoundingClientRect().top, scrollTop: dialog.scrollTop });
      };
      requestAnimationFrame(tick);
    });

    expect(start.scrollTop).toBe(0);
    expect(start.top).toBeGreaterThanOrEqual(innerHeight - 1);
  });

  // #1070: the mobile rule gives the bar the full width, and its padding came on top of it
  describe('at 480px and less', () => {
    afterEach(async () => {
      await page.viewport(1280, 800);
    });

    it('fills the width of its area and stays inside it', async () => {
      await page.viewport(375, 812);
      const { root } = await render<HTMLMdsStatusBarElement>(
        '<mds-status-bar visible description="Can we improve it?"><button>Submit</button></mds-status-bar>',
      );
      const area = root.shadowRoot!.querySelector<HTMLElement>('.status-bar-area')!;
      const bar = root.shadowRoot!.querySelector<HTMLElement>('.status-bar')!;
      const areaStyle = getComputedStyle(area);
      const areaBox = area.getBoundingClientRect();
      const barBox = bar.getBoundingClientRect();
      const contentWidth =
        areaBox.width - parseFloat(areaStyle.paddingLeft) - parseFloat(areaStyle.paddingRight);

      expect(parseFloat(areaStyle.paddingLeft)).toBeGreaterThan(0);
      expect(barBox.width).toBeCloseTo(contentWidth, 0);
      expect(barBox.right).toBeLessThanOrEqual(
        areaBox.right - parseFloat(areaStyle.paddingRight) + 0.5,
      );
    });
  });
});
