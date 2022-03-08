import { Component, Host, h, Listen, Prop } from '@stencil/core'

@Component({
  tag: 'mds-flex-table-body',
  styleUrl: 'mds-flex-table-body.css',
  shadow: true,
})
export class MdsFlexTableBody {

  @Prop({ mutable: true, reflect: true }) interactive?: boolean

  @Listen('flexTableInteractive', { target: 'body' })
  tableInteractiveHandler (event: CustomEvent<boolean>): void {
    this.interactive = event.detail
  }

  render () {
    return (
      <Host role="rowgroup">
        <slot/>
      </Host>
    )
  }

}
