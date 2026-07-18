import { Component, Host, h } from '@stencil/core';
import { newSpecPage } from '@stencil/core/testing';
import { Locale } from '@common/locale';
import { preferenceStore } from '@common/preference';

@Component({ tag: 'test-locale-label' })
class TestLocaleLabel {
  private readonly t: Locale = new Locale({
    en: { label: 'Hello' },
    it: { label: 'Ciao' },
  });

  render() {
    return <span>{this.t.get('label')}</span>;
  }
}

@Component({ tag: 'test-shadow-wrapper', shadow: true })
class TestShadowWrapper {
  render() {
    return <test-locale-label></test-locale-label>;
  }
}

@Component({ tag: 'test-pref-host' })
class TestPrefHost {
  render() {
    return <Host pref-theme={preferenceStore.state.theme}></Host>;
  }
}

const resetStore = (): void => {
  preferenceStore.state.language = 'en';
  preferenceStore.state.animation = undefined;
  preferenceStore.state.consumption = undefined;
  preferenceStore.state.contrast = undefined;
  preferenceStore.state.theme = undefined;
  preferenceStore.state['theme-scheme'] = undefined;
};

describe('preferenceStore', () => {
  afterEach(resetStore);

  describe('language', () => {
    it('renders the rollback language when no language is published', async () => {
      const page = await newSpecPage({
        components: [TestLocaleLabel],
        html: '<test-locale-label></test-locale-label>',
      });
      const root = page.root as HTMLElement;
      expect(root.textContent).toBe('Hello');
    });

    it('re-renders subscribed components when the language changes', async () => {
      const page = await newSpecPage({
        components: [TestLocaleLabel],
        html: '<test-locale-label></test-locale-label>',
      });
      const root = page.root as HTMLElement;
      expect(root.textContent).toBe('Hello');

      preferenceStore.state.language = 'it';
      await page.waitForChanges();
      expect(root.textContent).toBe('Ciao');
    });

    it('updates components nested inside another component shadow DOM', async () => {
      const page = await newSpecPage({
        components: [TestShadowWrapper, TestLocaleLabel],
        html: '<test-shadow-wrapper></test-shadow-wrapper>',
      });
      const root = page.root as HTMLElement;
      const nested = root.shadowRoot?.querySelector('test-locale-label') as HTMLElement;
      expect(nested.textContent).toBe('Hello');

      preferenceStore.state.language = 'it';
      await page.waitForChanges();
      expect(nested.textContent).toBe('Ciao');
    });

    it('falls back to the rollback language for unsupported languages', async () => {
      const page = await newSpecPage({
        components: [TestLocaleLabel],
        html: '<test-locale-label></test-locale-label>',
      });
      const root = page.root as HTMLElement;

      preferenceStore.state.language = 'fr';
      await page.waitForChanges();
      expect(root.textContent).toBe('Hello');
    });
  });

  describe('preferences', () => {
    it('reflects preference values on subscribed host attributes', async () => {
      const page = await newSpecPage({
        components: [TestPrefHost],
        html: '<test-pref-host></test-pref-host>',
      });
      const root = page.root as HTMLElement;
      expect(root.getAttribute('pref-theme')).toBeNull();

      preferenceStore.state.theme = 'dark';
      await page.waitForChanges();
      expect(root.getAttribute('pref-theme')).toBe('dark');
    });
  });
});
