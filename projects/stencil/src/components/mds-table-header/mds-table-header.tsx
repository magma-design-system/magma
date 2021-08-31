import { Component, Host, h } from '@stencil/core'

@Component({
  tag: 'mds-table-header',
  styleUrl: 'mds-table-header.css',
  shadow: false,
})
export class MdsTableHeader {

  render () {
    return (
      <Host class="table-header">
        <slot></slot>
      </Host>
    )
  }

}
