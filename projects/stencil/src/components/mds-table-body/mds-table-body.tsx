import { Component, Listen, Host, h, State } from '@stencil/core'
import clsx from 'clsx'
@Component({
  tag: 'mds-table-body',
  styleUrl: 'mds-table-body.css',
  shadow: false,
})
export class MdsTableBody {

  @State() interactive?: boolean

  @Listen('tableInteractive', { target: 'body' })
  tableInteractiveHandler (event: CustomEvent<boolean>): void {
    this.interactive = event.detail
  }

  render () {
    return (
      <Host class={clsx('table-body', this.interactive && 'table-body--interactive')} role="rowgroup">
        <slot/>
      </Host>
    )
  }

}
