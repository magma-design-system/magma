import { render, vi } from '@stencil/vitest';
import { mockIconFetch } from '@test/fetch';
import { itAnnouncesEachPickOnce } from '@test/pref';

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

  // #825: a mode outside the union was written to the storage and then threw, on that load and on
  // every following one
  describe('an invalid mode', () => {
    const STORAGE_KEY = 'mdsPrefConsumption';

    const reset = (): void => {
      localStorage.removeItem(STORAGE_KEY);
      [...document.documentElement.classList]
        .filter((name) => name.startsWith('pref-consumption-'))
        .forEach((name) => document.documentElement.classList.remove(name));
    };

    beforeEach(() => {
      reset();
      mockIconFetch();
      vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      reset();
    });

    it('is ignored on load, and never stored', async () => {
      const consoleError = vi.spyOn(console, 'error');

      await render('<mds-pref-consumption mode="eco"></mds-pref-consumption>');

      expect(consoleError).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('"eco"'));
      expect(document.documentElement).toHaveClass('pref-consumption-high');
      expect(localStorage.getItem(STORAGE_KEY)).toBe('high');
    });

    it('left in the storage by an earlier page is dropped', async () => {
      localStorage.setItem(STORAGE_KEY, 'undefined');
      const consoleError = vi.spyOn(console, 'error');

      await render('<mds-pref-consumption></mds-pref-consumption>');

      expect(consoleError).not.toHaveBeenCalled();
      expect(document.documentElement).toHaveClass('pref-consumption-high');
      expect(localStorage.getItem(STORAGE_KEY)).toBe('high');
    });

    it('set after load, or the attribute removed, leaves the applied mode in place', async () => {
      const { root, waitForChanges } = await render<HTMLMdsPrefConsumptionElement>(
        '<mds-pref-consumption mode="low"></mds-pref-consumption>',
      );
      const consoleError = vi.spyOn(console, 'error');
      const change = vi.fn();
      root.addEventListener('mdsPrefChange', change);

      root.setAttribute('mode', 'eco');
      await waitForChanges();
      root.removeAttribute('mode');
      await waitForChanges();

      expect(consoleError).not.toHaveBeenCalled();
      // the removed attribute is no invalid value: only the first write warns
      const warnings = vi
        .mocked(console.warn)
        .mock.calls.filter(([message]) => String(message).startsWith('mds-pref-consumption:'));
      expect(warnings).toHaveLength(1);
      expect(root.mode).toBe('low');
      expect(document.documentElement).toHaveClass('pref-consumption-low');
      expect(localStorage.getItem(STORAGE_KEY)).toBe('low');
      expect(change).not.toHaveBeenCalled();
    });
  });
});

describe('mds-pref-consumption mdsPrefChange', () => {
  itAnnouncesEachPickOnce('mds-pref-consumption', '.item--low', 'pref-consumption-low');
});
