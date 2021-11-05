import { Component, Event, EventEmitter, Host, h, Prop, Watch } from '@stencil/core'
import clsx from 'clsx'

@Component({
  tag: 'mds-table',
  styleUrl: 'mds-table.css',
  shadow: true,
})
export class MdsTable {

  /**
   * Specifies if the table row are higlighted on mouseover event
   */
  @Prop() readonly interactive?: boolean

  /**
   * Dispatces when interactive property changes
   */
  @Event({ composed: true }) tableInteractive: EventEmitter<boolean>

  componentDidLoad ():void {
    this.tableInteractive.emit(this.interactive)
  }

  @Watch('interactive')
  onTableInteractive (): void {
    this.tableInteractive.emit(this.interactive)
  }

  render () {
    return (
      <Host>
        <table class={clsx('table', this.interactive && 'table--interactive')} role="grid">
          <slot/>
        </table>
      </Host>
    )
  }
}
