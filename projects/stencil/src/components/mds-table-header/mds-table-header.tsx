import { Component, Host, h } from '@stencil/core'

@Component({
  tag: 'mds-table-header',
  styleUrl: 'mds-table-header.css',
  shadow: true,
})
export class MdsTableHeader {

  /**
 * @slot default - Put mds-table-row here
 */

  render () {
    return (
      <Host role="row">
        <slot/>
      </Host>
    )
  }

}
