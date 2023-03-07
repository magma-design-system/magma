import { Component, Host, h, Listen, Prop } from '@stencil/core'
@Component({
  tag: 'mds-table-row',
  styleUrl: 'mds-table-row.css',
  shadow: true,
})
export class MdsTableRow {

  @Prop({ mutable: true, reflect: true }) interactive: boolean

  @Listen('mdsTableInteractiveChange', { target: 'document' })
  tableInteractiveHandler (event: CustomEvent<boolean>): void {
    this.interactive = event.detail
  }

  render () {
    return (
      <Host role="row">
        <slot/>
      </Host>
    )
  }

}
