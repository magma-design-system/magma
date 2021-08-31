import { Component, Host, h } from '@stencil/core'

@Component({
  tag: 'mds-table-row',
  styleUrl: 'mds-table-row.css',
  shadow: false,
})
export class MdsTableRow {

  render () {
    return (
      <Host class="table-row" role="row">
        <slot></slot>
      </Host>
    )
  }

}
