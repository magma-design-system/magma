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
  private rows: NodeListOf<HTMLMdsTableRowElement>
  private resizeObserver: ResizeObserver

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

  private handleActions = (): void => {
    const row = this.rows[0] as HTMLMdsTableRowElement
    const cells: NodeListOf<HTMLMdsTableCellElement> = row.querySelectorAll('mds-table-cell') as NodeListOf<HTMLMdsTableCellElement>
    let cellsWidth = 0
    cells.forEach((cell: HTMLMdsTableCellElement) => {
      cellsWidth += cell.offsetWidth
    })
    const overlayActions = this.host.offsetWidth + this.host.scrollLeft < cellsWidth
    this.rows.forEach((row: HTMLMdsTableRowElement) => {
      row.overlayActions = overlayActions
    })
  }

  componentDidLoad (): void {
    this.rows = this.host.querySelectorAll('mds-table-row') as NodeListOf<HTMLMdsTableRowElement>
    this.interactiveEvent.emit(this.interactive)
    this.host.addEventListener('scroll', this.handleActions)
    this.resizeObserver = new ResizeObserver(this.handleActions)
    this.resizeObserver.observe(this.host)
    this.handleActions()
  }

  disconnectedCallback (): void {
    this.host.removeEventListener('scroll', this.handleActions)
    this.resizeObserver.disconnect()
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
