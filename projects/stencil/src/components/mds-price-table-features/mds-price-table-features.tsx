import { Component, Host, h, Prop, State } from '@stencil/core';
import { subscribePreference } from '@common/preference';

/**
 * @part header - Selects the HTML element wrapper of label text
 * @slot - Expects to slot `mds-price-table-features-row` component
 */

@Component({
  tag: 'mds-price-table-features',
  styleUrl: 'mds-price-table-features.css',
  shadow: true,
})
export class MdsPriceTableFeatures {
  @State() prefAnimation?: string;
  private unsubscribePrefAnimation?: () => void;
  @State() prefContrast?: string;
  private unsubscribePrefContrast?: () => void;
  @State() prefTheme?: string;
  private unsubscribePrefTheme?: () => void;
  @State() prefThemeScheme?: string;
  private unsubscribePrefThemeScheme?: () => void;

  /**
   * Sets a header title for the entire table
   */
  @Prop() readonly label?: string;

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
        <div class="table-wrapper">
          {this.label && (
            <header part="header">
              <mds-text typography="detail">
                <b>{this.label}</b>
              </mds-text>
            </header>
          )}
          <table>
            <tbody>
              <slot />
            </tbody>
          </table>
        </div>
      </Host>
    );
  }
}
