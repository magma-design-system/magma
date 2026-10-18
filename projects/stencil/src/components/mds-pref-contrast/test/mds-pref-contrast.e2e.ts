import { render, vi } from '@stencil/vitest';
import { mockIconFetch } from '@test/fetch';
import { itAnnouncesEachPickOnce } from '@test/pref';

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

  // #825: a mode outside the union was written to the storage and then threw, on that load and on
  // every following one
  describe('an invalid mode', () => {
    const STORAGE_KEY = 'mdsPrefContrast';

    const reset = (): void => {
      localStorage.removeItem(STORAGE_KEY);
      [...document.documentElement.classList]
        .filter((name) => name.startsWith('pref-contrast-'))
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

      await render('<mds-pref-contrast mode="maximum"></mds-pref-contrast>');

      expect(consoleError).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('"maximum"'));
      expect(document.documentElement).toHaveClass('pref-contrast-system');
      expect(localStorage.getItem(STORAGE_KEY)).toBe('system');
    });

    it('left in the storage by an earlier page is dropped', async () => {
      localStorage.setItem(STORAGE_KEY, 'undefined');
      const consoleError = vi.spyOn(console, 'error');

      await render('<mds-pref-contrast></mds-pref-contrast>');

      expect(consoleError).not.toHaveBeenCalled();
      expect(document.documentElement).toHaveClass('pref-contrast-system');
      expect(localStorage.getItem(STORAGE_KEY)).toBe('system');
    });

    it('set after load, or the attribute removed, leaves the applied mode in place', async () => {
      const { root, waitForChanges } = await render(
        '<mds-pref-contrast mode="more"></mds-pref-contrast>',
      );
      const consoleError = vi.spyOn(console, 'error');
      const change = vi.fn();
      root.addEventListener('mdsPrefChange', change);

      root.setAttribute('mode', 'maximum');
      await waitForChanges();
      root.removeAttribute('mode');
      await waitForChanges();

      expect(consoleError).not.toHaveBeenCalled();
      // the removed attribute is no invalid value: only the first write warns
      const warnings = vi
        .mocked(console.warn)
        .mock.calls.filter(([message]) => String(message).startsWith('mds-pref-contrast:'));
      expect(warnings).toHaveLength(1);
      expect(root.mode).toBe('more');
      expect(document.documentElement).toHaveClass('pref-contrast-more');
      expect(localStorage.getItem(STORAGE_KEY)).toBe('more');
      expect(change).not.toHaveBeenCalled();
    });
  });
});

describe('mds-pref-contrast mdsPrefChange', () => {
  itAnnouncesEachPickOnce('mds-pref-contrast', '.item--more', 'pref-contrast-more');
});
