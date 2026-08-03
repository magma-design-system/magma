import { Component, Host, h, Element, State } from '@stencil/core';
import { preferenceStore } from '@common/preference';

/**
 * @slot - Expects to slot `mds-price-table-features-cell` component
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
        pref-animation={preferenceStore.state.animation}
        pref-contrast={preferenceStore.state.contrast}
        pref-theme={preferenceStore.state.theme}
        pref-theme-scheme={preferenceStore.state['theme-scheme']}
      >
        <slot />
      </Host>
    );
  }
}
