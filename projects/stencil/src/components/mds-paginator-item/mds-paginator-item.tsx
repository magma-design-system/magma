import { Component, Host, h } from '@stencil/core'

@Component({
  tag: 'mds-paginator-item',
  styleUrl: 'mds-paginator-item.css',
  shadow: true,
})
export class MdsPaginatorItem {

  render () {
    return (
      <Host>
        <mds-text class="text" typography="detail">
          <slot></slot>
        </mds-text>
      </Host>
    )
  }

}
