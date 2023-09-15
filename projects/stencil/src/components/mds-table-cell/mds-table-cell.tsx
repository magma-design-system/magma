import { Component, Host, h } from '@stencil/core'

@Component({
  tag: 'mds-table-cell',
  styleUrl: 'mds-table-cell.css',
  shadow: true,
})
export class MdsTableCell {

  /**
 * @slot default - Put elements or text strings here
 */

  render () {
    return (
      <Host>
        <slot/>
      </Host>
    )
  }

}
