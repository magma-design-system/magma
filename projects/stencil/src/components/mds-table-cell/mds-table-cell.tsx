import { Component, Host, h, Prop } from '@stencil/core'

/**
 * @slot default - Add `text string`, `HTML elements` or `components` to this slot.
 */

@Component({
  tag: 'mds-table-cell',
  styleUrl: 'mds-table-cell.css',
  shadow: true,
})
export class MdsTableCell {

  /**
   * Sets a value to help the sorting function from `mds-table-header-cell`, if not set it will be used the content of the cell.
   */
  @Prop({ reflect: true }) readonly value?: string | number

  render () {
    return (
      <Host>
        <slot/>
      </Host>
    )
  }

}
