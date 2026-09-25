import { render } from '@stencil/vitest';
import globals from '../../../styles/dist/css/globals.css?raw';

/**
 * The global tokens of projects/styles/css/globals.css (z-index, blur, durations,
 * preferences) must do two things: fall back to their own default when the
 * consumer has not loaded the stylesheet, and let a value the consumer declares on
 * `:root` reach every component, shadow trees included.
 */
describe('global tokens', () => {
  let sheet: HTMLStyleElement | undefined;

  const loadGlobals = (): void => {
    sheet = document.createElement('style');
    sheet.textContent = globals;
    document.head.append(sheet);
  };

  afterEach(() => {
    sheet?.remove();
    sheet = undefined;
    const html = document.documentElement;
    ['--magma-modal-z-index', '--magma-pref-theme-scheme', '--magma-pref-theme-name'].forEach(
      (name) => html.style.removeProperty(name),
    );
  });

  describe('without the stylesheet', () => {
    it('falls back to the default the stylesheet declares', async () => {
      const { root } = await render('<mds-push-notification></mds-push-notification>');

      // notification 2000, not the 3000 the component used to hard code
      expect(getComputedStyle(root).zIndex).toBe('2000');
    });

    it('gives a token that used to be bare its default', async () => {
      const { root } = await render('<mds-modal></mds-modal>');

      expect(getComputedStyle(root).getPropertyValue('--mds-modal-z-index').trim()).toBe('3000');
    });
  });

  describe('with the stylesheet', () => {
    it('lets a value declared on :root reach the component', async () => {
      loadGlobals();
      document.documentElement.style.setProperty('--magma-modal-z-index', '9999');
      const { root } = await render('<mds-modal></mds-modal>');

      expect(getComputedStyle(root).getPropertyValue('--mds-modal-z-index').trim()).toBe('9999');
    });

    it('lets a preference written on <html> be read inside a shadow tree', async () => {
      loadGlobals();
      const html = document.documentElement;
      html.style.setProperty('--magma-pref-theme-scheme', 'dark');
      // written as a bare name by mds-pref-theme-variant, never as a quoted string
      html.style.setProperty('--magma-pref-theme-name', 'business');
      const { root } = await render('<mds-modal></mds-modal>');
      const inner = root.shadowRoot?.firstElementChild as Element;

      expect(getComputedStyle(inner).getPropertyValue('--magma-pref-theme-scheme').trim()).toBe(
        'dark',
      );
      expect(getComputedStyle(inner).getPropertyValue('--magma-pref-theme-name').trim()).toBe(
        'business',
      );
    });
  });
});
