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
});
