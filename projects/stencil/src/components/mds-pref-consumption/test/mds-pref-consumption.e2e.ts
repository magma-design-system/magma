import { render, vi } from '@stencil/vitest';

describe('mds-pref-consumption', () => {
  it('renders', async () => {
    const { root } = await render('<mds-pref-consumption></mds-pref-consumption>');

    expect(root).toHaveAttribute('hydrated');
  });

  // #789: a second instance used to revert the other's pick on its next render
  it('keeps the consumption picked in a second instance, without applying it again', async () => {
    const { root, waitForChanges } = await render(`
      <div>
        <mds-pref-consumption class="controller"></mds-pref-consumption>
        <mds-pref-consumption class="settings"></mds-pref-consumption>
      </div>
    `);
    const controller = root.querySelector<HTMLMdsPrefConsumptionElement>('.controller')!;
    const settings = root.querySelector<HTMLMdsPrefConsumptionElement>('.settings')!;
    const controllerChange = vi.fn();
    controller.addEventListener('mdsPrefChange', controllerChange);

    settings.shadowRoot!.querySelector<HTMLElement>('.item--low')!.click();
    await waitForChanges();
    // any re-render of the controller, then the settings page goes away
    controller.size = 'sm';
    await waitForChanges();
    settings.remove();
    await waitForChanges();

    expect(document.documentElement).toHaveClass('pref-consumption-low');
    expect(localStorage.getItem('mdsPrefConsumption')).toBe('low');
    expect(controller.mode).toBe('low');
    expect(controllerChange).not.toHaveBeenCalled();
  });
});
