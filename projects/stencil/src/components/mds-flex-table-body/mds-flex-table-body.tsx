import { Component, Host, h, Listen, State } from '@stencil/core'
import clsx from 'clsx'

@Component({
  tag: 'mds-flex-table-body',
  styleUrl: 'mds-flex-table-body.css',
  shadow: false,
})
export class MdsFlexTableBody {

  @State() interactive?: boolean

  @Listen('flexTableInteractive', { target: 'body' })
  tableInteractiveHandler (event: CustomEvent<boolean>): void {
    this.interactive = event.detail
  }

  render () {
    return (
      <Host class={clsx('flex-table-body', this.interactive && 'flex-table-body--interactive')} role="rowgroup">
        <slot/>
      </Host>
    )
  }

}
