import { Component, Element, Host, h, Prop, State, Method } from '@stencil/core';
import { UsageType } from './meta/types';
import { Locale } from '@common/locale';
import { subscribePreference } from '@common/preference';
import localeEl from './meta/locale.el.json';
import localeEn from './meta/locale.en.json';
import localeEs from './meta/locale.es.json';
import localeIt from './meta/locale.it.json';

/**
 * @slot - Add `text string`, `HTML elements` or `components` to this slot.
 */

@Component({
  tag: 'mds-usage',
  styleUrl: 'mds-usage.css',
  shadow: true,
})
export class MdsUsage {
  @Element() element: HTMLMdsUsageElement;
  @State() prefAnimation?: string;
  private unsubscribePrefAnimation?: () => void;
  @State() prefContrast?: string;
  private unsubscribePrefContrast?: () => void;
  @State() prefTheme?: string;
  private unsubscribePrefTheme?: () => void;
  @State() prefThemeScheme?: string;
  private unsubscribePrefThemeScheme?: () => void;

  private readonly t: Locale = new Locale({
    el: localeEl,
    en: localeEn,
    es: localeEs,
    it: localeIt,
  });
  @State() language: string;
  /**
   * Updates the component's texts to the locale currently set on the host element.
   */
  @Method()
  async updateLang(): Promise<void> {
    this.language = this.t.lang(this.element);
  }

  /**
   * Specifies the delay when the tooltip will trigger
   */
  @Prop() readonly variant: UsageType = 'info';

  /**
   * Specifies the alias of the usage phrase on the top of the component
   */
  @Prop() readonly alias?: string;

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
        <div class="header" part="header">
          <mds-icon name="mi/baseline/info" part="icon" />
          <mds-text typography="label" class="label" part="label">
            {this.alias ?? this.t.get(this.variant)}
          </mds-text>
        </div>
        <div
          class="content"
          role={this.variant === 'do' || this.variant === 'info' ? 'insertion' : 'deletion'}
        >
          <slot />
        </div>
      </Host>
    );
  }
}
