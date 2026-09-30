import { Component, Host, h } from '@stencil/core';

/**
 * @slot - Add `text string`, `HTML elements` or `components` to this slot.
 */
@Component({
  tag: 'mds-price-table-header',
  styleUrl: 'mds-price-table-header.css',
  shadow: true,
})
export class MdsPriceTableHeader {
  render() {
    return (
      <Host>
        <slot />
      </Host>
    );
  }
}
