import { render, vi } from '@stencil/vitest';
import base from '../../../../../styles/dist/css/base.css?raw';
import typography from '../../../../../styles/dist/css/typography.css?raw';
import { page } from 'vitest/browser';

describe('mds-header', () => {
  it('renders', async () => {
    const { root } = await render('<mds-header></mds-header>');

    expect(root).toHaveAttribute('hydrated');
  });

  it('gives the bar no hamburger without a menu slot', async () => {
    const { root } = await render(
      '<mds-header menu="all"><mds-header-bar><span>Logo</span></mds-header-bar></mds-header>',
    );
    const bar = root.querySelector('mds-header-bar')!;

    await vi.waitFor(() => expect(bar.menu).toBe('none'));
    expect(bar.shadowRoot!.querySelector('.menu')).toBeNull();
  });

  it('relays menu to the bar when there is a menu slot', async () => {
    const { root, waitForChanges } = await render<HTMLMdsHeaderElement>(
      '<mds-header menu="all"><mds-header-bar><span>Logo</span></mds-header-bar><div slot="menu">Menu</div></mds-header>',
    );
    const bar = root.querySelector('mds-header-bar')!;
    await vi.waitFor(() => expect(bar.menu).toBe('all'));

    root.menu = 'desktop';
    await waitForChanges();

    expect(bar.menu).toBe('desktop');
  });

  it('relays nav and menu to the attributes of the bar, which its CSS reads', async () => {
    // the bar shows its regions per breakpoint with :host([nav]) and :host([menu]) (#1147)
    const { root, waitForChanges } = await render<HTMLMdsHeaderElement>(
      '<mds-header nav="all"><mds-header-bar><mds-button slot="nav" label="Accedi"></mds-button></mds-header-bar></mds-header>',
    );
    const bar = root.querySelector('mds-header-bar')!;
    await vi.waitFor(() => expect(bar).toHaveAttribute('nav', 'all'));
    expect(bar).toHaveAttribute('menu', 'none');

    root.nav = 'mobile';
    await waitForChanges();
    expect(bar).toHaveAttribute('nav', 'mobile');

    root.setAttribute('nav', 'none');
    await waitForChanges();
    expect(bar).toHaveAttribute('nav', 'none');
  });

  it('goes back to the plain appearance once appearance-set is removed', async () => {
    const consoleError = vi.spyOn(console, 'error');
    const { root, waitForChanges } = await render(
      '<mds-header appearance-set="stripe transparent 300"></mds-header>',
    );

    root.removeAttribute('appearance-set');
    await waitForChanges();

    expect(consoleError).not.toHaveBeenCalled();
  });

  it('stays visible on scroll once auto-hide is removed', async () => {
    const { root, waitForChanges } = await render<HTMLMdsHeaderElement>(
      '<mds-header auto-hide="10"></mds-header>',
    );

    root.removeAttribute('auto-hide');
    await waitForChanges();
    // the test page does not scroll: report a scrolled page and send the event it would
    vi.spyOn(window, 'scrollY', 'get').mockReturnValue(window.innerHeight);
    window.dispatchEvent(new Event('scroll'));
    await waitForChanges();

    expect(root.visibility).toBe('visible');
  });

  // #1189 widths/page: the content of the floating bar stands on the frame of the page, its
  // padding outside it, and moves with a theme that moves the page
  describe('inline, on the frame of the page', () => {
    // the bar slides to its width: wait for the end of the transition
    const expectFloatingContent = async (left: number, width: number): Promise<void> => {
      const { root } = await render(
        '<mds-header appearance="inline"><mds-header-bar><span>Logo</span></mds-header-bar></mds-header>',
      );
      const content = root.querySelector('mds-header-bar')!.shadowRoot!.querySelector('.content')!;
      await vi.waitFor(() => {
        const box = content.getBoundingClientRect();
        expect([box.left, box.width]).toEqual([left, width]);
      });
    };

    afterEach(async () => {
      document.documentElement.style.removeProperty('--magma-width-page');
      // the size of the browser project in vitest.config.mts
      await page.viewport(1280, 800);
    });

    it('starts its content where the content of a page-frame starts, on a wide window', async () => {
      await page.viewport(1440, 800);

      await expectFloatingContent(80, 1280);
    });

    it('follows a theme that moves the page', async () => {
      await page.viewport(1440, 800);
      document.documentElement.style.setProperty('--magma-width-page', '1024px');

      await expectFloatingContent(208, 1024);
    });
  });

  // #824: the icon colours of the header never reached the hamburger of its bar
  describe('custom properties', () => {
    // the hamburger fades its colours: read them once the transition is over
    const fillOf = async (button: Element): Promise<string> => {
      await Promise.all(
        button
          .getAnimations()
          .filter((animation) => animation instanceof CSSTransition)
          .map((animation) => animation.finished),
      );
      return getComputedStyle(button).fill;
    };
    const hamburgerOf = (root: HTMLElement): Element =>
      root.querySelector('mds-header-bar')!.shadowRoot!.querySelector('.menu')!;
    // a header without a menu slot gives its bar no hamburger
    const header = (style: string) =>
      render(
        `<mds-header menu="all" style="${style}"><mds-header-bar></mds-header-bar><div slot="menu">Menu</div></mds-header>`,
      );

    it('colours the hamburger of the bar with the icon colour of the header', async () => {
      const { root } = await header('--mds-header-icon-color: rgb(1 2 3)');

      expect(await fillOf(hamburgerOf(root))).toBe('rgb(1, 2, 3)');
    });

    it('colours it with the text colour of the header when no icon colour is set', async () => {
      const { root } = await header('--mds-header-color: rgb(4 5 6)');

      expect(getComputedStyle(root).color).toBe('rgb(4, 5, 6)');
      expect(await fillOf(hamburgerOf(root))).toBe('rgb(4, 5, 6)');
    });

    it('leaves the hamburger its own colour otherwise', async () => {
      const { root: bar } = await render('<mds-header-bar menu="all"></mds-header-bar>');
      const own = await fillOf(bar.shadowRoot!.querySelector('.menu')!);
      const { root } = await header('');

      expect(await fillOf(hamburgerOf(root))).toBe(own);
    });
  });
  // #1189 surfaces/band: the header stands in the flow and stays put while the page scrolls
  // (sticky), so the page starts under its bar with no number to keep in step with its height
  describe('in the flow of the page', () => {
    const BAR =
      '<mds-header-bar><span>Servizi demografici</span><mds-button slot="nav">Pratiche</mds-button></mds-header-bar>';
    // the header is the first child of the page, as in an application, and the page goes on
    // under it, tall enough to scroll
    const layout = async (attributes = '', bar = BAR) => {
      const { root, waitForChanges } = await render(
        `<div><mds-header ${attributes}>${bar}</mds-header><p>Pratiche</p><div style="height: 3000px"></div></div>`,
      );
      const header = root.querySelector<HTMLMdsHeaderElement>('mds-header')!;
      const headerBar = header.querySelector('mds-header-bar')!;
      await settled(headerBar);
      return { header, headerBar, text: root.querySelector('p')!, waitForChanges };
    };
    // the bar slides between its appearances and its visibilities
    const settled = (element: Element) =>
      Promise.all(element.getAnimations().map((animation) => animation.finished));
    const boxOf = (element: Element) => element.getBoundingClientRect();
    // what a click at the middle of the box would reach
    const hitAt = ({ left, top, width, height }: DOMRect) =>
      document.elementFromPoint(left + width / 2, top + height / 2);

    afterEach(async () => {
      window.scrollTo(0, 0);
      await page.viewport(1280, 800);
    });

    it('starts the page under its bar', async () => {
      const { header, headerBar, text } = await layout();

      expect(getComputedStyle(header).position).toBe('sticky');
      expect(boxOf(header).height).toBeCloseTo(boxOf(headerBar).height, 1);
      expect(boxOf(text).top).toBeGreaterThanOrEqual(boxOf(headerBar).bottom);
    });

    it('stays put while the page scrolls', async () => {
      const { header, headerBar, text } = await layout();

      window.scrollTo(0, 400);

      await vi.waitFor(() => expect(window.scrollY).toBe(400));
      expect(boxOf(header).top).toBe(0);
      expect(boxOf(headerBar).top).toBe(0);
      expect(boxOf(text).bottom).toBeLessThan(0);
    });

    it('keeps the room of its bar alone when the bar floats, its margin lower', async () => {
      const { header, headerBar } = await layout('appearance="inline"');

      expect(boxOf(header).height).toBeCloseTo(boxOf(headerBar).height, 1);
      expect(boxOf(headerBar).top - boxOf(header).top).toBe(24);
    });

    it('does not move the page when the appearance changes on scroll', async () => {
      const { header, headerBar, text, waitForChanges } = await layout();
      const top = boxOf(text).top;

      header.appearance = 'inline';
      await waitForChanges();
      await settled(headerBar);

      expect(boxOf(text).top).toBe(top);
    });

    it('takes the clicks on its bar', async () => {
      const { header, headerBar } = await layout();

      expect(header.contains(hitAt(boxOf(headerBar)))).toBe(true);
    });

    it('lets the clicks through where its bar was, once auto-hide hides it', async () => {
      const { header, headerBar } = await layout('auto-hide="100"');
      const box = boxOf(header);

      window.scrollTo(0, 600);
      await vi.waitFor(() => expect(header.visibility).toBe('hidden'));
      await settled(headerBar);

      expect(boxOf(header).top).toBe(0);
      expect(boxOf(headerBar).bottom).toBeLessThanOrEqual(0);
      expect(header.contains(hitAt(box))).toBe(false);
    });

    it('lets the clicks through around the floating bar', async () => {
      const { header } = await layout('appearance="inline" hide-backdrop');
      const { left, top } = boxOf(header);

      expect(header.contains(document.elementFromPoint(left + 4, top + 4))).toBe(false);
    });

    // the styles keep a field reached with Shift+Tab under the bar, rhythm/between-fields lower
    // (base.css), with no script that measures it: the bar is one row
    describe('the scroll padding of the page', () => {
      const html = document.documentElement;
      let sheet: HTMLStyleElement;
      const padding = () => parseFloat(getComputedStyle(html).scrollPaddingTop);

      beforeEach(() => {
        sheet = document.createElement('style');
        sheet.textContent = [typography, base].join('\n');
        document.head.append(sheet);
      });

      afterEach(() => sheet.remove());

      it.each([
        [1280, 'stripe'],
        [1280, 'inline'],
        [375, 'stripe'],
        [375, 'inline'],
      ])('at %ipx, %s, ends rhythm/between-fields under the bar', async (width, appearance) => {
        await page.viewport(width, 800);
        // on a phone the navigation folds into the hamburger of the menu
        const { headerBar } = await layout(
          `appearance="${appearance}"`,
          `${BAR}<div slot="menu">Pratiche</div>`,
        );

        expect(padding()).toBeCloseTo(boxOf(headerBar).bottom + 24, 0);
      });

      it('leaves the page alone without a header', async () => {
        await render('<p>Pratiche</p>');

        expect(getComputedStyle(html).scrollPaddingTop).toBe('auto');
      });
    });
  });
});
