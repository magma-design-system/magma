import { render, vi } from '@stencil/vitest';

describe('mds-pref-animation', () => {
  it('renders', async () => {
    const { root } = await render('<mds-pref-animation></mds-pref-animation>');

    expect(root).toHaveAttribute('hydrated');
  });

  // #789: a second instance used to revert the other's pick on its next render
  it('keeps the animation picked in a second instance, without applying it again', async () => {
    const { root, waitForChanges } = await render(`
      <div>
        <mds-pref-animation class="controller"></mds-pref-animation>
        <mds-pref-animation class="settings"></mds-pref-animation>
      </div>
    `);
    const controller = root.querySelector<HTMLMdsPrefAnimationElement>('.controller')!;
    const settings = root.querySelector<HTMLMdsPrefAnimationElement>('.settings')!;
    const controllerChange = vi.fn();
    controller.addEventListener('mdsPrefChange', controllerChange);

    settings.shadowRoot!.querySelector<HTMLElement>('.item--reduce')!.click();
    await waitForChanges();
    // any re-render of the controller, then the settings page goes away
    controller.size = 'sm';
    await waitForChanges();
    settings.remove();
    await waitForChanges();

    expect(document.documentElement).toHaveClass('pref-animation-reduce');
    expect(localStorage.getItem('mdsPrefAnimation')).toBe('reduce');
    expect(controller.mode).toBe('reduce');
    expect(controllerChange).not.toHaveBeenCalled();
  });
});
