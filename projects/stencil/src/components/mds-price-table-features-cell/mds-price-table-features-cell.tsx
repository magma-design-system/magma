import { Component, Host, h, Prop, State } from '@stencil/core';
import { subscribePreference } from '@common/preference';
import { PriceTableFeaturesCellType } from './meta/types';
import miBaselineCheckCircle from '@icon/mi/baseline/check-circle.svg';
import miBaselineHorizontalRule from '@icon/mi/baseline/horizontal-rule.svg';

/**
 * @part icon - Selects the HTML element of the icon when `type` attribute when is `supported` or `unsupported`.
 * @part text - Selects the HTML element wrapper of text when `type` attribute when is `text`.
 * @slot - Add `text string`, `HTML elements` or `components` to this slot.
 */

@Component({
  tag: 'mds-price-table-features-cell',
  styleUrl: 'mds-price-table-features-cell.css',
  shadow: true,
})
export class MdsPriceTableFeaturesCell {
  @State() prefAnimation?: string;
  private unsubscribePrefAnimation?: () => void;
  @State() prefContrast?: string;
  private unsubscribePrefContrast?: () => void;
  @State() prefTheme?: string;
  private unsubscribePrefTheme?: () => void;
  @State() prefThemeScheme?: string;
  private unsubscribePrefThemeScheme?: () => void;

  /**
   * Specifies the support type which is represented
   */
  @Prop({ reflect: true }) type?: PriceTableFeaturesCellType = 'text';

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
        {this.type === 'supported' && (
          <i class="icon icon--supported" innerHTML={miBaselineCheckCircle} part="icon" />
        )}
        {this.type === 'unsupported' && (
          <i class="icon icon--unsupported" innerHTML={miBaselineHorizontalRule} part="icon" />
        )}
        {this.type === 'text' && (
          <mds-text part="text" typography="detail">
            <slot />
          </mds-text>
        )}
        {this.type === 'custom' && <slot />}
        {this.type === 'label' && <slot />}
      </Host>
    );
  }
}
