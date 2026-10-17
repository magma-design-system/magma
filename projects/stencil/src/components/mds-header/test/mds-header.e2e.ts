import { render, vi } from '@stencil/vitest';

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
});
