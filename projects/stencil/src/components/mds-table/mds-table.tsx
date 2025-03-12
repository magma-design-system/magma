import clsx from 'clsx'
import { Component, Host, h, Prop, Event, EventEmitter, Watch, Element, Method, State } from '@stencil/core'
import { MdsTableSelectionEventDetail } from './meta/event-detail'
import { MdsTableRowSelection } from './meta/type'

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
  private body: HTMLMdsTableBodyElement
  private header: HTMLMdsTableHeaderElement
  private resizeObserver: ResizeObserver
  private cellsWidth: number = 0
  @State() selectedRows: MdsTableRowSelection[] = []

  /**
   * Specifies if the table rows are higlighted on mouseover event
   */
  @Prop() readonly interactive?: boolean

  /**
   * Specifies if the table rows are selectable by a checkbox
   */
  @Prop() readonly selectable?: boolean

  @Prop({ mutable: true, reflect: true }) selection?: boolean

  /**
   * Dispatces when interactive property changes
   */
  @Event({ bubbles: true, composed: true, eventName: 'mdsTableSelectionChange' }) selectionEvent: EventEmitter<MdsTableSelectionEventDetail>

  @Watch('interactive')
  onTableInteractive (): void {
    this.updateInteractive()
  }

  @Watch('selectable')
  onTableSelectable (newValue: boolean): void {
    this.handleSelection()
    this.header.selectable = newValue
  }

  /**
   * `internal` Updates the selection data event and emits it, it's used to avoid add event listener to the dom and lower performance, works only if `selectable` is true.
   */
  @Method()
  async updateSelection (): Promise<void> {
    if (!this.selectable) {
      return
    }
    this.selectedRows = []
    this.rows.forEach((row: HTMLMdsTableRowElement, index: number) => {
      if (row.selected) {
        this.selectedRows.push({ index, value: row.value } as MdsTableRowSelection)
      }
    })
    this.selectionEvent.emit({ rows: this.selectedRows })
    this.header.setSelection(this.selectedRows.length, this.rows.length)
    this.selection = this.selectedRows.length > 0
    this.body.selection = this.selection
  }

  /**
   * Selects all elements or none, works only if `selectable` is true.
   */
  @Method()
  async selectAll (select: boolean = true): Promise<void> {
    if (!this.selectable) {
      return
    }
    this.rows.forEach((row: HTMLMdsTableRowElement) => {
      row.selected = select
    })
    this.updateSelection()
  }

  private updateInteractive = (): void => {
    this.body.interactive = this.interactive
    this.rows.forEach((row: HTMLMdsTableRowElement) => {
      row.interactive = this.interactive
    })
  }

  private updateCellsSize = (): void => {
    const cells: NodeListOf<HTMLMdsTableCellElement> = this.rows[0].querySelectorAll('mds-table-cell') as NodeListOf<HTMLMdsTableCellElement>
    const cellSelection: HTMLMdsTableCellElement = this.rows[0].shadowRoot?.querySelector('.selection-cell') as HTMLMdsTableCellElement
    this.cellsWidth = cellSelection ? cellSelection.offsetWidth : 0
    cells.forEach((cell: HTMLMdsTableCellElement) => {
      this.cellsWidth += cell.offsetWidth
    })
  }

  private hasActions = (): boolean => {
    this.updateCellsSize()
    return this.rows[0].offsetWidth > this.cellsWidth
  }

  private handleSelection = (): void => {
    this.rows.forEach((row: HTMLMdsTableRowElement) => {
      row.selectable = this.selectable
    })
  }

  private handleActions = (): void => {
    this.updateCellsSize()
    const overlayActions = this.host.offsetWidth + this.host.scrollLeft < this.cellsWidth
    this.rows.forEach((row: HTMLMdsTableRowElement) => {
      row.overlayActions = overlayActions
    })
  }

  componentDidLoad (): void {
    this.rows = this.host.querySelectorAll('mds-table-row') as NodeListOf<HTMLMdsTableRowElement>
    this.body = this.host.querySelector('mds-table-body') as HTMLMdsTableBodyElement
    this.header = this.host.querySelector('mds-table-header') as HTMLMdsTableHeaderElement
    this.header.selectable = this.selectable
    this.updateInteractive()
    this.handleSelection()
    if (this.hasActions()) {
      this.host.addEventListener('scroll', this.handleActions)
      this.resizeObserver = new ResizeObserver(this.handleActions)
      this.resizeObserver.observe(this.host)
      this.handleActions()
    }
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
