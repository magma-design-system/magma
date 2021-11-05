import { Component, Host, h, Listen, State } from '@stencil/core'
import clsx from 'clsx'
@Component({
  tag: 'mds-table-row',
  styleUrl: 'mds-table-row.css',
  shadow: false,
})
export class MdsTableRow {

  @State() interactive?: boolean

  @Listen('tableInteractive', { target: 'body' })
  tableInteractiveHandler (event: CustomEvent<boolean>): void {
    this.interactive = event.detail
  }

  render () {
    return (
      <Host class={clsx('table-row', this.interactive && 'table-row--interactive')} role="row">
        <slot/>
      </Host>
    )
  }

}
