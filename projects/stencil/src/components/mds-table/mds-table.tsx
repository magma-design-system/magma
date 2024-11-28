import clsx from 'clsx'
import { Component, Host, h, Prop, Event, EventEmitter, Watch, Element } from '@stencil/core'

/**
 * @slot default - Put `mds-table-header`, `mds-table-body`, `mds-table-footer` element/s.
 */

@Component({
  tag: 'mds-table',
  styleUrl: 'mds-table.css',
  shadow: true,
})
export class MdsTable {

  @Element() host: HTMLMdsTableElement

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

  componentDidLoad (): void {
    this.interactiveEvent.emit(this.interactive)
    const rowElements: NodeListOf<HTMLMdsTableRowElement> = this.host.querySelectorAll('mds-table-row') as NodeListOf<HTMLMdsTableRowElement>
    this.host.addEventListener('scroll', (e: Event) => {
      const target = e.target as HTMLElement
      // console.log('here', target.scrollLeft, target.offsetWidth)
      // console.log(target.offsetWidth - target.scrollLeft)
      // console.log(rowElement.offsetWidth - target.offsetWidth)
      rowElements.forEach((rowElement: HTMLMdsTableRowElement) => {
        if (target.scrollLeft > rowElement.offsetWidth - target.offsetWidth) {
          rowElement.overlayActions = true
          return
        }
        rowElement.overlayActions = false
      })

    })
  }

  render () {
    return (
      <Host>
        <table class={clsx('table', this.interactive && 'table--interactive')} role="table">
          <slot/>
        </table>
      </Host>
    )
  }
}
