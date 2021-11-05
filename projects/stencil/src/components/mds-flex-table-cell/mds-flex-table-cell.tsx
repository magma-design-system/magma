import { Component, Host, h, Prop } from '@stencil/core'
@Component({
  tag: 'mds-flex-table-cell',
  styleUrl: 'mds-flex-table-cell.css',
  shadow: false,
})
export class MdsFlexTableCell {

  /**
   * Specifies the template for flex children elements
   */
  @Prop() readonly flexGrow?: string = '1'

  render () {
    return (
      <Host style={ { flexGrow: this.flexGrow } } role="gridcell">
        <slot/>
      </Host>
    )
  }
}
