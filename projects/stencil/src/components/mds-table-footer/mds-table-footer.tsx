import { Component, Host, h } from '@stencil/core'

/**
 * @slot default - Add `mds-table-row` element/s.
 */

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
