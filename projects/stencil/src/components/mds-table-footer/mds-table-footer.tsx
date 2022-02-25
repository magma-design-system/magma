import { Component, Host, h } from '@stencil/core'

@Component({
  tag: 'mds-table-footer',
  styleUrl: 'mds-table-footer.css',
  shadow: true,
})
export class MdsTableFooter {

  render () {
    return (
      <Host role="row">
        <slot/>
      </Host>
    )
  }

}
