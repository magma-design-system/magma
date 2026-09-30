import { Component, Host, h } from '@stencil/core';

/**
 * @slot - Add `mds-price-table-list` elements or `components` to this slot.
 */
@Component({
  tag: 'mds-price-table',
  styleUrl: 'mds-price-table.css',
  shadow: true,
})
export class MdsPriceTable {
  render() {
    return (
      <Host>
        <slot />
      </Host>
    );
  }
}
