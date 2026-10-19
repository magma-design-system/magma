import { render, vi } from '@stencil/vitest';

describe('mds-header', () => {
  it('renders', async () => {
    const { root } = await render('<mds-header></mds-header>');

    expect(root).toHaveAttribute('hydrated');
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
    const header = (style: string) =>
      render(
        `<mds-header menu="all" style="${style}"><mds-header-bar></mds-header-bar></mds-header>`,
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
