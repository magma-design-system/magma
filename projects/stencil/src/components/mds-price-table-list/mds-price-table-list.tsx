import { Component, Host, h, Element, State } from '@stencil/core'

@Component({
  tag: 'mds-price-table-list',
  styleUrl: 'mds-price-table-list.css',
  shadow: true,
})
export class MdsPriceTableList {

  @State() hasItems: boolean
  @Element() hostElement: HTMLMdsPriceTableListElement

  componentDidRender (): void {
    this.hasItems = this.hostElement.querySelectorAll('[slot="item"]').length > 0
  }

  render () {
    return (
      <Host>
        <header part="header">
          <slot name="header"/>
        </header>
        { this.hasItems && <mds-separator class="separator"></mds-separator> }
        { this.hasItems &&
          <main part="content">
            <slot name="item"/>
          </main>
        }
        <footer part="footer">
          <slot name="price"/>
          <slot name="action"/>
        </footer>
      </Host>
    )
  }

}
