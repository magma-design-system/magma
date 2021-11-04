import { Component, Host, h, Listen, Prop } from '@stencil/core'
import clsx from 'clsx'
@Component({
  tag: 'mds-table-row',
  styleUrl: 'mds-table-row.css',
  shadow: false,
})
export class MdsTableRow {

  /**
   * Specifies if the table row are higlighted on mouseover event
   */
  @Prop({ reflect: true, mutable: true }) interactive?: boolean

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
