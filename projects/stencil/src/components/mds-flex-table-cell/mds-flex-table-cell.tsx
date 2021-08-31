import { Component, Host, h, Prop } from '@stencil/core'

import { TypographyType } from '../../types/typography'

@Component({
  tag: 'mds-flex-table-cell',
  styleUrl: 'mds-flex-table-cell.css',
  shadow: false,
})
export class MdsFlexTableCell {

  /**
   * Specifies the template for flex children elements
   */
  @Prop() readonly flexGrow?: string

  /**
   * Specifies the font typography of the element
   */
  @Prop() readonly typography: TypographyType = 'detail'

  render () {
    return (
      <Host style={ { flexGrow: this.flexGrow } } role="gridcell">
        <mds-text typography={this.typography}>
          <slot></slot>
        </mds-text>
      </Host>
    )
  }

}
