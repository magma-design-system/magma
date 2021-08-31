import { Component, Host, h } from '@stencil/core'

@Component({
  tag: 'mds-table-body',
  styleUrl: 'mds-table-body.css',
  shadow: false,
})
export class MdsTableBody {

  render () {
    return (
      <Host class="table-body" role="rowgroup">
        <slot></slot>
      </Host>
    )
  }

}
