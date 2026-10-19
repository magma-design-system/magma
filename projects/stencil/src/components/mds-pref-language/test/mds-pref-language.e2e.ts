import { render, vi } from '@stencil/vitest';
import { mockIconFetch } from '@test/fetch';

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

    it('tells on the tab whether the menu of the languages is open', async () => {
      const { root, waitForChanges } = await setup();
      const item = root.shadowRoot!.querySelector('mds-tab-item')!;
      // the caller is the tab item, whose host the dropdown leaves alone: the state has to
      // travel to the inner button, the one carrying role="tab"
      const tab = (): Element => item.shadowRoot!.querySelector('mds-button')!;

      expect(tab()).toEqualAttribute('aria-expanded', 'false');

      item.click();
      await waitForChanges();

      expect(tab()).toEqualAttribute('aria-expanded', 'true');
    });
  });

  // #826: the items got their listener once, on load: an item added later did nothing when picked
  describe('an item added after load', () => {
    afterEach(() => {
      localStorage.removeItem('mdsPrefLanguage');
    });

    it('applies its language when picked, and is marked as the selected one', async () => {
      const { root, waitForChanges } = await render(`
        <mds-pref-language set="it">
          <mds-pref-language-item code="it"></mds-pref-language-item>
        </mds-pref-language>
      `);
      const languageChange = vi.fn();
      root.addEventListener('mdsPrefLanguageChange', languageChange);

      const english = document.createElement('mds-pref-language-item');
      english.setAttribute('code', 'en');
      root.appendChild(english);
      await waitForChanges();
      english.click();
      await waitForChanges();

      expect(languageChange).toHaveBeenCalledTimes(1);
      expect(document.documentElement.getAttribute('lang')).toBe('en');
      expect(english.selected).toBe(true);
      expect(root.querySelector<HTMLMdsPrefLanguageItemElement>('[code="it"]')!.selected).toBe(
        false,
      );
    });
  });

  // #825: the check took only `xx` and `xx-XX`, so picking Cebuano, Hawaiian or Hmong threw
  // after the selection had changed, and an invalid code threw instead of being ignored
  describe('the language code', () => {
    const STORAGE_KEY = 'mdsPrefLanguage';
    let pageLanguage: string | null;

    beforeEach(() => {
      pageLanguage = document.documentElement.getAttribute('lang');
      localStorage.removeItem(STORAGE_KEY);
      mockIconFetch();
      vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      localStorage.removeItem(STORAGE_KEY);
      if (pageLanguage === null) document.documentElement.removeAttribute('lang');
      else document.documentElement.setAttribute('lang', pageLanguage);
    });

    it('of three letters is picked like the others', async () => {
      const consoleError = vi.spyOn(console, 'error');
      const { root, waitForChanges } = await render(`
        <mds-pref-language set="it">
          <mds-pref-language-item code="it"></mds-pref-language-item>
          <mds-pref-language-item code="haw"></mds-pref-language-item>
        </mds-pref-language>
      `);

      root.querySelector<HTMLElement>('mds-pref-language-item[code="haw"]')!.click();
      await waitForChanges();

      expect(consoleError).not.toHaveBeenCalled();
      expect(root.set).toBe('haw');
      expect(document.documentElement.getAttribute('lang')).toBe('haw');
      expect(localStorage.getItem(STORAGE_KEY)).toBe('haw');
    });

    it('that is no language tag is ignored on load', async () => {
      const consoleError = vi.spyOn(console, 'error');

      const { root } = await render('<mds-pref-language set="Italian"></mds-pref-language>');

      expect(consoleError).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('"Italian"'));
      expect(root.set).not.toBe('Italian');
      expect(document.documentElement.getAttribute('lang')).not.toBe('Italian');
      expect(localStorage.getItem(STORAGE_KEY)).not.toBe('Italian');
    });

    it('that is no language tag is ignored after load, the applied language stays', async () => {
      const { root, waitForChanges } = await render(
        '<mds-pref-language set="it"></mds-pref-language>',
      );
      const change = vi.fn();
      root.addEventListener('mdsPrefChange', change);

      root.set = 'Italian';
      await waitForChanges();

      expect(root.set).toBe('it');
      expect(document.documentElement.getAttribute('lang')).toBe('it');
      expect(localStorage.getItem(STORAGE_KEY)).toBe('it');
      expect(change).not.toHaveBeenCalled();
    });

    it('left in the storage by an earlier version is dropped', async () => {
      localStorage.setItem(STORAGE_KEY, 'not a language');
      document.documentElement.setAttribute('lang', 'el');

      const { root } = await render('<mds-pref-language></mds-pref-language>');

      expect(root.set).toBe('el');
      expect(localStorage.getItem(STORAGE_KEY)).toBe('el');
    });
  });
});

// a language set from code changed the page, not the selected item of the list (#823)
describe('mds-pref-language set from code', () => {
  it('selects the item of the language', async () => {
    const { root, waitForChanges } = await render(`
      <mds-pref-language set="it">
        <mds-pref-language-item code="it"></mds-pref-language-item>
        <mds-pref-language-item code="en"></mds-pref-language-item>
      </mds-pref-language>`);
    const item = (code: string) =>
      root.querySelector<HTMLMdsPrefLanguageItemElement>(`mds-pref-language-item[code="${code}"]`)!;

    (root as HTMLMdsPrefLanguageElement).set = 'en';
    await waitForChanges();

    expect(item('en').selected).toBe(true);
    expect(item('it').selected).toBe(false);
  });
});
