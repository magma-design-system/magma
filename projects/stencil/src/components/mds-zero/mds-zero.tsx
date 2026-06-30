import { Component, Host, State, h } from '@stencil/core';
import { subscribePreference } from '@common/preference';

/**
 * @slot default - Add `HTML elements` or `components` to this slot, it is **recommended** to use `mds-img` or `img` element.
 * @slot content - Put text elements here,
 * @slot action - Add `HTML elements` or `components`, it is **recommended** to use `mds-button` element.
 * @part contents - Selects the wrapper of the elements with attribute `slot="content"`.
 * @part actions - Selects the wrapper of the elements with attribute `slot="action"`.
 */

@Component({
  tag: 'mds-zero',
  styleUrl: 'mds-zero.css',
  shadow: true,
})
export class MdsZero {
  @State() prefAnimation?: string;
  private unsubscribePrefAnimation?: () => void;
  @State() prefContrast?: string;
  private unsubscribePrefContrast?: () => void;
  @State() prefTheme?: string;
  private unsubscribePrefTheme?: () => void;
  @State() prefThemeScheme?: string;
  private unsubscribePrefThemeScheme?: () => void;

  connectedCallback(): void {
    this.unsubscribePrefAnimation = subscribePreference('animation', (value) => {
      this.prefAnimation = value;
    });
    this.unsubscribePrefContrast = subscribePreference('contrast', (value) => {
      this.prefContrast = value;
    });
    this.unsubscribePrefTheme = subscribePreference('theme', (value) => {
      this.prefTheme = value;
    });
    this.unsubscribePrefThemeScheme = subscribePreference('theme-scheme', (value) => {
      this.prefThemeScheme = value;
    });
  }

  disconnectedCallback(): void {
    this.unsubscribePrefAnimation?.();
    this.unsubscribePrefContrast?.();
    this.unsubscribePrefTheme?.();
    this.unsubscribePrefThemeScheme?.();
  }

  render() {
    return (
      <Host
        pref-animation={this.prefAnimation}
        pref-contrast={this.prefContrast}
        pref-theme={this.prefTheme}
        pref-theme-scheme={this.prefThemeScheme}
      >
        <slot />
        <div class="contents" part="contents">
          <slot name="content" />
        </div>
        <footer class="actions" part="actions">
          <slot name="action" />
        </footer>
      </Host>
    );
  }
}
