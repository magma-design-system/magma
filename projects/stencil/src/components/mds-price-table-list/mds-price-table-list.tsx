import { Component, Host, h, Element, State } from '@stencil/core';
import { subscribePreference } from '@common/preference';

/**
 * @part content - Selects the element which wraps elements added via `default slot`
 * @part footer - Selects the element which wraps elements added via `slot="price"` and `slot="action"`
 * @part header - Selects the element which wraps elements added via `slot="header"`
 * @slot action - Add `HTML elements` or `components`, it is **recommended** to use `mds-button` element.
 * @slot item - Add `mds-price-table-list-item` component, `HTML elements` or other `components` to this slot.
 * @slot header - Add `text string`, `HTML elements` or `components` to this slot.
 * @slot price - Add `text string`, `HTML elements` or `components` to this slot.
 */

@Component({
  tag: 'mds-price-table-list',
  styleUrl: 'mds-price-table-list.css',
  shadow: true,
})
export class MdsPriceTableList {
  @State() hasItems: boolean;
  @Element() hostElement: HTMLMdsPriceTableListElement;
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

  componentWillLoad(): void {
    this.hasItems =
      this.hostElement.querySelectorAll('[slot="item"], mds-price-table-list-item').length > 0;
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
          <slot name="header" />
        </div>
        {this.hasItems && <mds-separator class="separator"></mds-separator>}
        {this.hasItems && (
          <main class="main" part="content">
            <slot name="item" />
          </main>
        )}
        <div class="footer" part="footer">
          <slot name="price" />
          <slot name="action" />
        </div>
      </Host>
    );
  }
}
