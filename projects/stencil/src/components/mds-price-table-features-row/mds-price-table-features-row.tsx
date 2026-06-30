import { Component, Host, h, Element, State } from '@stencil/core';
import { subscribePreference } from '@common/preference';

/**
 * @slot default - Expects to slot `mds-price-table-features-cell` component
 */

@Component({
  tag: 'mds-price-table-features-row',
  styleUrl: 'mds-price-table-features-row.css',
  shadow: true,
})
export class MdsPriceTableFeaturesRow {
  private horizontalCells: NodeListOf<HTMLMdsPriceTableFeaturesCellElement>;
  @State() cellPercWidth: string;
  @Element() host: HTMLMdsPriceTableFeaturesRowElement;
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

  componentWillRender(): void {
    this.horizontalCells = this.host.querySelectorAll('mds-price-table-features-cell');
    this.cellPercWidth = Number(100 / this.horizontalCells.length).toFixed(4) + '%';
    this.horizontalCells.forEach((el: HTMLMdsPriceTableFeaturesCellElement) => {
      el.style.width = this.cellPercWidth;
    });
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
      </Host>
    );
  }
}
