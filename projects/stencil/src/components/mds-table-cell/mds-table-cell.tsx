import { Component, Host, h, Prop } from '@stencil/core'
import { TypographyType } from '../../types/typography'

@Component({
  tag: 'mds-table-cell',
  styleUrl: 'mds-table-cell.css',
  shadow: false,
})
export class MdsTableCell {

  /**
   * Specifies the font typography of the element
   */
  @Prop() readonly typography: TypographyType = 'detail'

  render () {
    return (
      <Host class="table-cell">
        <mds-text typography={this.typography}>
          <slot></slot>
        </mds-text>
      </Host>
    )
  }

}
