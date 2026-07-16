import { newSpecPage } from '@stencil/core/testing';
import { MdsPrefLanguage } from '../mds-pref-language';
import { MdsPrefLanguageItem } from '../../mds-pref-language-item/mds-pref-language-item';
import { preferenceStore } from '@common/preference';

describe('mds-pref-language', () => {
  let storage: Record<string, string>;

  beforeAll(() => {
    // The spec environment provides neither localStorage nor navigator.language
    Object.defineProperty(globalThis, 'navigator', {
      value: { language: 'en-US' },
      configurable: true,
      writable: true,
    });
  });

  beforeEach(() => {
    storage = {};
    Object.defineProperty(globalThis, 'localStorage', {
      value: {
        getItem: (key: string): string | null => storage[key] ?? null,
        setItem: (key: string, value: string): void => {
          storage[key] = value;
        },
      },
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    preferenceStore.state.language = 'en';
  });

  const setup = async () => {
    const page = await newSpecPage({
      components: [MdsPrefLanguage, MdsPrefLanguageItem],
      html: '<div></div>',
    });
    const prefChange = jest.fn();
    const languageChange = jest.fn();
    page.doc.addEventListener('mdsPrefChange', prefChange);
    page.doc.addEventListener('mdsPrefLanguageChange', languageChange);

    const host = page.doc.createElement('mds-pref-language');
    host.setAttribute('set', 'it');
    ['it', 'en'].forEach((code) => {
      const item = page.doc.createElement('mds-pref-language-item');
      item.setAttribute('code', code);
      host.appendChild(item);
    });
    page.body.appendChild(host);
    await page.waitForChanges();

    return { page, host, prefChange, languageChange };
  };

  it('applies the initial language without emitting mdsPrefChange', async () => {
    const { page, host, prefChange } = await setup();

    expect(prefChange).not.toHaveBeenCalled();
    expect(preferenceStore.state.language).toBe('it');
    expect(page.doc.documentElement.getAttribute('lang')).toBe('it');
    expect(storage.mdsPrefLanguage).toBe('it');

    const tabItem = host.shadowRoot?.querySelector('mds-tab-item');
    expect(tabItem?.getAttribute('label')).toBe('Italiano');
  });

  it('emits once and updates the store when a language is selected', async () => {
    const { page, host, prefChange, languageChange } = await setup();

    const itemEn = host.querySelector('mds-pref-language-item[code="en"]') as HTMLElement;
    itemEn.click();
    await page.waitForChanges();

    expect(languageChange).toHaveBeenCalledTimes(1);
    expect(prefChange).toHaveBeenCalledTimes(1);
    expect(preferenceStore.state.language).toBe('en');
    expect(page.doc.documentElement.getAttribute('lang')).toBe('en');
    const tabItem = host.shadowRoot?.querySelector('mds-tab-item');
    expect(tabItem?.getAttribute('label')).toBe('English');

    // selecting the same language again must not emit another mdsPrefChange
    itemEn.click();
    await page.waitForChanges();
    expect(prefChange).toHaveBeenCalledTimes(1);
  });
});
