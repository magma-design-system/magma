import { Component, Host, h } from '@stencil/core'

@Component({
  tag: 'mds-table-header',
  styleUrl: 'mds-table-header.css',
  shadow: true,
})
export class MdsTableHeader {

  render () {
    return (
      <Host role="row">
        <slot/>
      </Host>
    )
  }

}
