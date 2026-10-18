import { render, vi } from '@stencil/vitest';
import { mockIconFetch } from '@test/fetch';
import { itAnnouncesEachPickOnce } from '@test/pref';

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

  // #825: a mode outside the union was written to the storage and then threw, on that load and on
  // every following one
  describe('an invalid mode', () => {
    const STORAGE_KEY = 'mdsPrefAnimation';

    const reset = (): void => {
      localStorage.removeItem(STORAGE_KEY);
      [...document.documentElement.classList]
        .filter((name) => name.startsWith('pref-animation-'))
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

      await render('<mds-pref-animation mode="slow"></mds-pref-animation>');

      expect(consoleError).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('"slow"'));
      expect(document.documentElement).toHaveClass('pref-animation-system');
      expect(localStorage.getItem(STORAGE_KEY)).toBe('system');
    });

    it('left in the storage by an earlier page is dropped', async () => {
      localStorage.setItem(STORAGE_KEY, 'undefined');
      const consoleError = vi.spyOn(console, 'error');

      await render('<mds-pref-animation></mds-pref-animation>');

      expect(consoleError).not.toHaveBeenCalled();
      expect(document.documentElement).toHaveClass('pref-animation-system');
      expect(localStorage.getItem(STORAGE_KEY)).toBe('system');
    });

    it('set after load, or the attribute removed, leaves the applied mode in place', async () => {
      const { root, waitForChanges } = await render(
        '<mds-pref-animation mode="reduce"></mds-pref-animation>',
      );
      const consoleError = vi.spyOn(console, 'error');
      const change = vi.fn();
      root.addEventListener('mdsPrefChange', change);

      root.setAttribute('mode', 'slow');
      await waitForChanges();
      root.removeAttribute('mode');
      await waitForChanges();

      expect(consoleError).not.toHaveBeenCalled();
      // the removed attribute is no invalid value: only the first write warns
      const warnings = vi
        .mocked(console.warn)
        .mock.calls.filter(([message]) => String(message).startsWith('mds-pref-animation:'));
      expect(warnings).toHaveLength(1);
      expect(root.mode).toBe('reduce');
      expect(document.documentElement).toHaveClass('pref-animation-reduce');
      expect(localStorage.getItem(STORAGE_KEY)).toBe('reduce');
      expect(change).not.toHaveBeenCalled();
    });
  });
});

describe('mds-pref-animation mdsPrefChange', () => {
  itAnnouncesEachPickOnce('mds-pref-animation', '.item--reduce', 'pref-animation-reduce');
});
