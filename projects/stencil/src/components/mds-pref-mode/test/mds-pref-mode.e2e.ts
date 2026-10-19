import { render, vi } from '@stencil/vitest';
import { itAnnouncesEachPickOnce } from '@test/pref';

describe('mds-pref-mode', () => {
  it('renders', async () => {
    const { root } = await render('<mds-pref-mode></mds-pref-mode>');

    expect(root).toHaveAttribute('hydrated');
  });

  it('writes the mode under the mode names, never the theme ones', async () => {
    localStorage.removeItem('mdsPrefTheme');
    await render('<mds-pref-mode mode="dark"></mds-pref-mode>');

    const html = document.documentElement;
    expect(html.style.getPropertyValue('--magma-pref-mode')).toBe('dark');
    expect(html).toHaveClass('pref-mode-dark');
    expect(localStorage.getItem('mdsPrefMode')).toBe('dark');
    // before #702 these three names were the mode's; now they are the theme's
    expect(html.style.getPropertyValue('--magma-pref-theme')).toBe('');
    expect([...html.classList].filter((name) => name.startsWith('pref-theme-'))).toEqual([]);
    expect(localStorage.getItem('mdsPrefTheme')).toBeNull();
    html.style.removeProperty('--magma-pref-mode');
  });

  it('locks only the dark item when locked-scheme is light', async () => {
    const { root } = await render(
      '<mds-pref-mode mode="light" locked-scheme="light"></mds-pref-mode>',
    );

    const shadow = root.shadowRoot!;
    expect(shadow.querySelector('.item--dark')).toHaveAttribute('disabled');
    expect(shadow.querySelector('.item--light')).not.toHaveAttribute('disabled');
    expect(shadow.querySelector('.item--system')).not.toHaveAttribute('disabled');
  });

  it('locks only the light item when locked-scheme is dark', async () => {
    const { root } = await render(
      '<mds-pref-mode mode="dark" locked-scheme="dark"></mds-pref-mode>',
    );

    const shadow = root.shadowRoot!;
    expect(shadow.querySelector('.item--light')).toHaveAttribute('disabled');
    expect(shadow.querySelector('.item--dark')).not.toHaveAttribute('disabled');
    expect(shadow.querySelector('.item--system')).not.toHaveAttribute('disabled');
  });

  it('locks nothing when locked-scheme is absent', async () => {
    const { root } = await render('<mds-pref-mode mode="light"></mds-pref-mode>');

    const shadow = root.shadowRoot!;
    expect(shadow.querySelector('.item--light')).not.toHaveAttribute('disabled');
    expect(shadow.querySelector('.item--system')).not.toHaveAttribute('disabled');
    expect(shadow.querySelector('.item--dark')).not.toHaveAttribute('disabled');
  });

  it('keeps the stored mode preference: a locked dark item stays selected and clicking it is a no-op', async () => {
    const { root, waitForChanges } = await render<HTMLMdsPrefModeElement>(
      '<mds-pref-mode mode="dark" locked-scheme="light"></mds-pref-mode>',
    );
    const dark = root.shadowRoot!.querySelector<HTMLElement>('.item--dark')!;

    // the stored preference (dark) is preserved and reflected as selected, but locked
    expect(root.mode).toBe('dark');
    expect(dark).toHaveAttribute('selected');
    expect(dark).toHaveAttribute('disabled');
    expect(localStorage.getItem('mdsPrefMode')).toBe('dark');

    // clicking the locked item must not change the mode nor the stored preference
    dark.click();
    await waitForChanges();

    expect(root.mode).toBe('dark');
    expect(localStorage.getItem('mdsPrefMode')).toBe('dark');
  });

  // #789: an app-wide controller next to a settings page used to revert the
  // settings pick on its next render, re-applying its own stale mode
  describe('with a second instance', () => {
    const markup = `
      <div>
        <mds-pref-mode class="controller"></mds-pref-mode>
        <mds-pref-mode class="settings" transition="none"></mds-pref-mode>
      </div>
    `;

    it('keeps the mode picked in the other instance, without applying it again', async () => {
      const { root, waitForChanges } = await render(markup);
      const controller = root.querySelector<HTMLMdsPrefModeElement>('.controller')!;
      const settings = root.querySelector<HTMLMdsPrefModeElement>('.settings')!;
      const controllerChange = vi.fn();
      controller.addEventListener('mdsPrefChange', controllerChange);

      settings.shadowRoot!.querySelector<HTMLElement>('.item--dark')!.click();
      await waitForChanges();
      // any re-render of the controller, then the settings page goes away
      controller.size = 'sm';
      await waitForChanges();
      settings.remove();
      await waitForChanges();

      expect(document.documentElement).toHaveClass('pref-mode-dark');
      expect(document.documentElement).not.toHaveClass('pref-mode-system');
      expect(localStorage.getItem('mdsPrefMode')).toBe('dark');
      expect(controller.mode).toBe('dark');
      expect(controller.shadowRoot!.querySelector('.item--dark')).toHaveAttribute('selected');
      expect(controllerChange).not.toHaveBeenCalled();
    });

    it('follows a mode written straight on <html>, without writing it back', async () => {
      const { root, waitForChanges } = await render('<mds-pref-mode mode="light"></mds-pref-mode>');
      const html = document.documentElement;

      html.classList.replace('pref-mode-light', 'pref-mode-dark');
      await waitForChanges();

      expect(root.mode).toBe('dark');
      expect(localStorage.getItem('mdsPrefMode')).toBe('light');
      html.style.removeProperty('--magma-pref-mode');
    });
  });
});

// #960: Safari, and every browser on iOS (their user agent carries Safari and no Chrome), was
// forced to light, with the items disabled and the stored choice overwritten
describe.each([
  [
    'Safari on macOS',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
  ],
  [
    'Chrome on iOS',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/124.0.6367.88 Mobile/15E148 Safari/604.1',
  ],
])('mds-pref-mode on %s', (_, userAgent) => {
  const html = document.documentElement;

  beforeEach(() => {
    Object.defineProperty(navigator, 'userAgent', { configurable: true, get: () => userAgent });
  });

  afterEach(() => {
    // the own property hid the getter of Navigator.prototype
    delete (navigator as { userAgent?: string }).userAgent;
    localStorage.removeItem('mdsPrefMode');
    html.classList.remove('pref-mode-light', 'pref-mode-dark', 'pref-mode-system');
    html.style.removeProperty('--magma-pref-mode');
  });

  it('applies the stored mode, keeps the storage and leaves the items enabled', async () => {
    localStorage.setItem('mdsPrefMode', 'dark');
    const { root } = await render('<mds-pref-mode></mds-pref-mode>');
    const shadow = root.shadowRoot!;

    expect(html).toHaveClass('pref-mode-dark');
    expect(html).not.toHaveClass('pref-mode-light');
    expect(localStorage.getItem('mdsPrefMode')).toBe('dark');
    expect(shadow.querySelector('.item--light')).not.toHaveAttribute('disabled');
    expect(shadow.querySelector('.item--system')).not.toHaveAttribute('disabled');
    expect(shadow.querySelector('.item--dark')).not.toHaveAttribute('disabled');
    expect(shadow.querySelector('.info')?.textContent).not.toContain('Safari');
  });

  it('applies the mode prop', async () => {
    const { root } = await render('<mds-pref-mode mode="dark"></mds-pref-mode>');

    expect(root.mode).toBe('dark');
    expect(html).toHaveClass('pref-mode-dark');
  });
});

describe('mds-pref-mode mdsPrefChange', () => {
  // without the overlay transition, which applies the mode once its animation is over
  itAnnouncesEachPickOnce('mds-pref-mode', '.item--dark', 'pref-mode-dark', 'transition="none"');
});
