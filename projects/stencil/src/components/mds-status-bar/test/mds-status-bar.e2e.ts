import { render } from '@stencil/vitest';
import base from '../../../../../styles/dist/css/base.css?raw';
import typography from '../../../../../styles/dist/css/typography.css?raw';
import { page, userEvent } from 'vitest/browser';

const ACTIONS = [
  '<mds-button variant="dark" tone="outline">Salva come bozza</mds-button>',
  '<mds-button variant="dark" tone="outline">Annulla</mds-button>',
  '<mds-button>Invia pratica</mds-button>',
];

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

  // #1202: mds-modal gives a slotted window the width of a dialog; the area of the bar is the
  // window of its inner modal, and it hugs the bar at the end of the screen all the same
  it('hugs its bar at the end of a wide screen', async () => {
    const { root } = await render<HTMLMdsStatusBarElement>(
      '<mds-status-bar visible description="Modifiche non salvate"><button>Annulla</button><button>Salva</button></mds-status-bar>',
    );
    const area = root.shadowRoot!.querySelector<HTMLElement>('.status-bar-area')!;
    const bar = root.shadowRoot!.querySelector<HTMLElement>('.status-bar')!;
    const areaStyle = getComputedStyle(area);
    const areaBox = area.getBoundingClientRect();
    const barBox = bar.getBoundingClientRect();

    expect(areaBox.width).toBeCloseTo(
      barBox.width + parseFloat(areaStyle.paddingLeft) + parseFloat(areaStyle.paddingRight),
      0,
    );
    expect(areaBox.right).toBeCloseTo(innerWidth - parseFloat(areaStyle.marginRight), 0);
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

    // actions/stacked (#1189): under 380px of the bar the row stacks on a line of its own, every
    // action at the full width, in the order of the row
    it('stacks its actions under the threshold of a row of actions, each at the full width', async () => {
      await page.viewport(375, 812);
      const { root } = await render<HTMLMdsStatusBarElement>(
        `<mds-status-bar visible description="Modifiche non salvate">${ACTIONS.join('')}</mds-status-bar>`,
      );
      const actions = root.shadowRoot!.querySelector<HTMLElement>('.actions')!;
      const boxes = Array.from(root.children).map((action) => action.getBoundingClientRect());

      expect(getComputedStyle(actions).flexDirection).toBe('column');
      expect(getComputedStyle(actions).rowGap).toBe('12px');
      for (const box of boxes)
        expect(box.width).toBeCloseTo(actions.getBoundingClientRect().width, 0);
      expect(boxes.map(({ top }) => top)).toEqual(
        [...boxes.map(({ top }) => top)].sort((a, b) => a - b),
      );
    });

    it('keeps them on one line from the threshold up', async () => {
      await page.viewport(480, 812);
      const { root } = await render<HTMLMdsStatusBarElement>(
        `<mds-status-bar visible>${ACTIONS.join('')}</mds-status-bar>`,
      );
      const tops = Array.from(root.children).map((action) => action.getBoundingClientRect().top);

      expect(new Set(tops).size).toBe(1);
    });
  });

  it('sets its actions rhythm/inline apart', async () => {
    const { root } = await render<HTMLMdsStatusBarElement>(
      `<mds-status-bar visible>${ACTIONS.join('')}</mds-status-bar>`,
    );

    expect(getComputedStyle(root.shadowRoot!.querySelector('.actions')!).columnGap).toBe('12px');
  });

  // #1203: while visible the bar reserves its room at the end of the page, a rule of the styles
  // (base.css): its tallest for its content plus rhythm/between-fields, no script that measures it
  describe('the room on the page', () => {
    const html = document.documentElement;
    let sheet: HTMLStyleElement;
    // the room is a box after the body: 0 while no visible bar asks for it
    const room = () => {
      const after = getComputedStyle(html, '::after');
      return after.content === 'none' ? 0 : parseFloat(after.height);
    };
    const areaOf = (root: HTMLElement) =>
      root.shadowRoot!.querySelector('.status-bar-area')!.getBoundingClientRect();

    beforeEach(() => {
      sheet = document.createElement('style');
      sheet.textContent = [typography, base].join('\n');
      document.head.append(sheet);
    });

    afterEach(async () => {
      sheet.remove();
      await page.viewport(1280, 800);
    });

    it.each([
      [1280, 1],
      [1280, 2],
      [1280, 3],
      [375, 1],
      [375, 2],
      [375, 3],
    ])('at %ipx with %i actions covers the bar and rhythm/between-fields', async (width, count) => {
      await page.viewport(width, 800);
      const { root } = await render<HTMLMdsStatusBarElement>(
        `<mds-status-bar visible description="Modifiche non salvate">${ACTIONS.slice(-count).join('')}</mds-status-bar>`,
      );
      const area = areaOf(root);

      expect(room()).toBeGreaterThanOrEqual(area.height + 24);
      // a bar shorter than its tallest leaves at most the line of its description empty
      expect(room() - area.height - 24).toBeLessThanOrEqual(36);
      expect(parseFloat(getComputedStyle(html).scrollPaddingBottom)).toBeCloseTo(room(), 1);
    });

    it('gives the room back when it hides or leaves the page', async () => {
      const { root, waitForChanges } = await render<HTMLMdsStatusBarElement>(
        `<mds-status-bar visible>${ACTIONS.join('')}</mds-status-bar>`,
      );

      expect(room()).toBeGreaterThan(0);
      root.visible = false;
      await waitForChanges();
      expect(room()).toBe(0);
      root.visible = true;
      await waitForChanges();
      expect(room()).toBeGreaterThan(0);
      root.remove();
      expect(room()).toBe(0);
    });

    it('keeps a field focused at the end of the page above the bar', async () => {
      await page.viewport(375, 640);
      const { root } = await render<HTMLElement>(
        `<div>
           <div style="height: 1600px"></div>
           <input id="last" aria-label="Note per l'ufficio">
           <mds-status-bar visible description="Modifiche non salvate">${ACTIONS.join('')}</mds-status-bar>
         </div>`,
      );
      const field = root.querySelector<HTMLInputElement>('#last')!;
      field.focus();
      const bar = root.querySelector<HTMLMdsStatusBarElement>('mds-status-bar')!;

      expect(field.getBoundingClientRect().bottom).toBeLessThanOrEqual(areaOf(bar).top);
    });
  });
});
