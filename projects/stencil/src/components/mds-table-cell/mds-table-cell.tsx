import { Component, Host, h, Prop } from '@stencil/core'
import { TypographyType } from '../../types/typography'

@Component({
  tag: 'mds-table-cell',
  styleUrl: 'mds-table-cell.css',
  shadow: false,
})
export class MdsTableCell {

  render () {
    return (
      <Host class="table-cell">
        <slot></slot>
      </Host>
    )
  }

}
