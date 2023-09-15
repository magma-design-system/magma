import clsx from 'clsx'
import { Component, Host, h, Prop, Event, EventEmitter, Watch } from '@stencil/core'

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
  @Event({ bubbles: true, composed: true, eventName: 'mdsTableInteractiveChange' }) interactiveEvent: EventEmitter<boolean>

  @Watch('interactive')
  onTableInteractive (): void {
    this.interactiveEvent.emit(this.interactive)
  }

  componentDidLoad = (): void => {
    this.interactiveEvent.emit(this.interactive)
  }

  /**
 * @slot default - Put mds-table-header, mds-table-body, mds-table-footer here
 */

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
