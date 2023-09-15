import { Component, Host, h } from '@stencil/core'

/**
 * @slot default - Add `text string`, `HTML elements` or `components` to this slot.
 */

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
