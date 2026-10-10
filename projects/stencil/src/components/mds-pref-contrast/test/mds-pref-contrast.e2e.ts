import { render, vi } from '@stencil/vitest';

describe('mds-pref-contrast', () => {
  it('renders', async () => {
    const { root } = await render('<mds-pref-contrast></mds-pref-contrast>');

    expect(root).toHaveAttribute('hydrated');
  });

  // #789: a second instance used to revert the other's pick on its next render
  it('keeps the contrast picked in a second instance, without applying it again', async () => {
    const { root, waitForChanges } = await render(`
      <div>
        <mds-pref-contrast class="controller"></mds-pref-contrast>
        <mds-pref-contrast class="settings"></mds-pref-contrast>
      </div>
    `);
    const controller = root.querySelector<HTMLMdsPrefContrastElement>('.controller')!;
    const settings = root.querySelector<HTMLMdsPrefContrastElement>('.settings')!;
    const controllerChange = vi.fn();
    controller.addEventListener('mdsPrefChange', controllerChange);

    settings.shadowRoot!.querySelector<HTMLElement>('.item--more')!.click();
    await waitForChanges();
    // any re-render of the controller, then the settings page goes away
    controller.size = 'sm';
    await waitForChanges();
    settings.remove();
    await waitForChanges();

    expect(document.documentElement).toHaveClass('pref-contrast-more');
    expect(localStorage.getItem('mdsPrefContrast')).toBe('more');
    expect(controller.mode).toBe('more');
    expect(controllerChange).not.toHaveBeenCalled();
  });
});
