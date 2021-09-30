import { Component, Host, h } from '@stencil/core'

@Component({
  tag: 'mds-breadcrumb-item',
  styleUrl: 'mds-breadcrumb-item.css',
  shadow: false,
})
export class MdsBreadcrumbItem {

  render () {
    return (
      <Host slot="breadcrumb-item">
        <mds-text class="text" typography="detail">
          <slot/>
        </mds-text>
        <mds-icon class="icon" name="navigate-next"/>
      </Host>
    )
  }

}
