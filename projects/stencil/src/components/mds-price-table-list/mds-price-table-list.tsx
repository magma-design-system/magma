import { Component, Host, h } from '@stencil/core'

@Component({
  tag: 'mds-price-table-list',
  styleUrl: 'mds-price-table-list.css',
  shadow: true,
})
export class MdsPriceTableList {

  render () {
    return (
      <Host>
        <header part="header">
          <slot name="header"/>
        </header>
        <mds-hr class="hr"></mds-hr>
        <main part="content">
          <slot name="item"/>
        </main>
        <footer part="footer">
          <slot name="price"/>
          <slot name="action"/>
        </footer>
      </Host>
    )
  }

}
