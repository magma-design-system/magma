import { Component, Host, h } from '@stencil/core'

@Component({
  tag: 'mds-table-cell',
  styleUrl: 'mds-table-cell.css',
  shadow: true,
})
export class MdsTableCell {

  render () {
    return (
      <Host>
        <slot/>
      </Host>
    )
  }

}
