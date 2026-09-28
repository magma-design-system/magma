import base from '../../../styles/dist/css/base.css?raw';

/**
 * `color-scheme` decides the browser's own UI (scrollbars, form controls,
 * autofill), so it has to follow the palette: the mode the user picked, unless the
 * theme only exists in one scheme.
 */
describe('color-scheme', () => {
  const html = document.documentElement;
  let sheet: HTMLStyleElement;

  const schemeWith = (...classes: string[]): string => {
    html.classList.add(...classes);
    return getComputedStyle(html).colorScheme;
  };

  beforeEach(() => {
    sheet = document.createElement('style');
    sheet.textContent = base;
    document.head.append(sheet);
    html.setAttribute('data-magma-pref', '');
  });

  afterEach(() => {
    sheet.remove();
    html.removeAttribute('data-magma-pref');
  });

  it('follows the OS when no controller is mounted', () => {
    html.removeAttribute('data-magma-pref');

    expect(schemeWith()).toBe('light dark');
  });

  it('is dark in dark mode, even with no named theme', () => {
    expect(schemeWith('pref-mode-dark')).toBe('dark');
  });

  it('stays light in light mode on a theme that has both schemes', () => {
    expect(schemeWith('pref-mode-light', 'pref-theme-scheme-all')).toBe('light');
  });

  it('follows the OS in system mode', () => {
    expect(schemeWith('pref-mode-system')).toBe('light dark');
  });

  it('lets a single-scheme theme override the mode', () => {
    expect(schemeWith('pref-mode-light', 'pref-theme-scheme-dark')).toBe('dark only');
  });
});
