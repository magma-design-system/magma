import { render, vi } from '@stencil/vitest';
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
});
