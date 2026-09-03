import { render, vi } from '@stencil/vitest';

describe('mds-pref-language', () => {
  it('renders', async () => {
    const { root } = await render('<mds-pref-language></mds-pref-language>');

    expect(root).toHaveAttribute('hydrated');
  });

  describe('language selection', () => {
    // the listeners are attached before render() to catch anything emitted while loading
    const prefChange = vi.fn();
    const languageChange = vi.fn();

    beforeEach(() => {
      document.addEventListener('mdsPrefChange', prefChange);
      document.addEventListener('mdsPrefLanguageChange', languageChange);
    });

    afterEach(() => {
      document.removeEventListener('mdsPrefChange', prefChange);
      document.removeEventListener('mdsPrefLanguageChange', languageChange);
    });

    const setup = () =>
      render(`
        <mds-pref-language set="it">
          <mds-pref-language-item code="it"></mds-pref-language-item>
          <mds-pref-language-item code="en"></mds-pref-language-item>
        </mds-pref-language>
      `);

    it('applies the initial language without emitting mdsPrefChange', async () => {
      const { root } = await setup();

      expect(prefChange).not.toHaveBeenCalled();
      expect(document.documentElement.getAttribute('lang')).toBe('it');
      expect(localStorage.getItem('mdsPrefLanguage')).toBe('it');

      const tabItem = root.shadowRoot!.querySelector('mds-tab-item');
      expect(tabItem?.getAttribute('label')).toBe('Italiano');
    });

    it('emits once and updates the language when a language is selected', async () => {
      const { root, waitForChanges } = await setup();

      const itemEn = root.querySelector<HTMLElement>('mds-pref-language-item[code="en"]')!;
      itemEn.click();
      await waitForChanges();

      expect(languageChange).toHaveBeenCalledTimes(1);
      expect(prefChange).toHaveBeenCalledTimes(1);
      expect(document.documentElement.getAttribute('lang')).toBe('en');
      expect(root.shadowRoot!.querySelector('mds-tab-item')?.getAttribute('label')).toBe('English');

      // selecting the same language again must not emit another mdsPrefChange
      itemEn.click();
      await waitForChanges();
      expect(prefChange).toHaveBeenCalledTimes(1);
    });
  });
});
