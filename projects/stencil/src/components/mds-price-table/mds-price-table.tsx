import { Component, Host, h } from '@stencil/core'

@Component({
  tag: 'mds-price-table',
  styleUrl: 'mds-price-table.css',
  shadow: true,
})
export class MdsPriceTable {

  render () {
    return (
      <Host>
        <slot/>
      </Host>
    )
  }
}
