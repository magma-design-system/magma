import clsx from 'clsx'
import { Component, Host, h, Prop, Event, EventEmitter, Watch, Element, Method, State } from '@stencil/core'
import { MdsTableSelectionEventDetail } from './meta/event-detail'
import { MdsTableRowSelection } from './meta/type'
import { Locale } from '@common/locale'
import localeEl from './meta/locale.el.json'
import localeEn from './meta/locale.en.json'
import localeEs from './meta/locale.es.json'
import localeIt from './meta/locale.it.json'

/**
 * @slot default - Put `mds-table-header`, `mds-table-body`, `mds-table-footer` element/s.
 * @slot batch-actions - Put `mds-button` element/s.
 * @part table-wrapper - Selects the element which wraps the table
 * @part table - Selects the table element
 * @part batch-actions - Selects the element which wraps the batch actions
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
  private scrollWrapper: HTMLDivElement
  private resizeObserver?: ResizeObserver
  private tableBodyObserver: MutationObserver
  private hasBatchActions: boolean = false
  private cellsWidth: number = 0
  @State() selectedRows: MdsTableRowSelection[] = []
  private t:Locale = new Locale({
    el: localeEl,
    en: localeEn,
    es: localeEs,
    it: localeIt,
  })
  @State() language: string

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
    const cells: NodeListOf<HTMLMdsTableCellElement> = this.rows[0].querySelectorAll('mds-table-cell')
    const cellSelection: HTMLMdsTableCellElement = this.rows[0].shadowRoot?.querySelector('.selection-cell') as HTMLMdsTableCellElement
    this.cellsWidth = cellSelection ? cellSelection.offsetWidth : 0
    cells.forEach((cell: HTMLMdsTableCellElement) => {
      this.cellsWidth += cell.offsetWidth
    })
  }

  private hasActions = (): boolean => {
    this.updateCellsSize()
    return this.host.querySelector('mds-table-row > [slot="action"]') !== null
  }

  private handleSelection = (): void => {
    this.rows.forEach((row: HTMLMdsTableRowElement) => {
      row.selectable = this.selectable
    })
  }

  private handleActions = (): void => {
    this.updateCellsSize()
    const overlayActions = this.scrollWrapper.offsetWidth + this.scrollWrapper.scrollLeft < this.cellsWidth
    this.rows.forEach((row: HTMLMdsTableRowElement) => {
      row.overlayActions = overlayActions
    })
  }

  componentWillLoad (): void {
    this.language = this.t.lang(this.host)
    this.body = this.host.querySelector('mds-table-body')!
    this.header = this.host.querySelector('mds-table-header')!
    this.rows = this.host.querySelectorAll('mds-table-row')
    this.hasBatchActions = this.host.querySelector(':scope > [slot="batch-action"]') !== null
    this.tableBodyObserver = new MutationObserver(() => {
      this.updateSlottedElements()
    })
    this.tableBodyObserver.observe(this.body, { childList: true })
  }

  componentDidLoad (): void {
    this.header.selectable = this.selectable
    if (this.hasActions()) {
      const scrollWrapper = this.host.shadowRoot?.querySelector('.table-wrapper')
      if (!scrollWrapper) {
        throw new Error('Table element table-wrapper not found')
      }
      this.scrollWrapper = scrollWrapper as HTMLDivElement
      this.scrollWrapper.addEventListener('scroll', this.handleActions)
      this.resizeObserver = new ResizeObserver(this.handleActions)
      this.resizeObserver.observe(this.host)
      this.handleActions()
    }
  }

  private updateSlottedElements = (): void => {
    this.rows = this.host.querySelectorAll('mds-table-row')
    this.updateInteractive()
    this.handleSelection()
  }

  disconnectedCallback (): void {
    this.host.removeEventListener('scroll', this.handleActions)
    this.resizeObserver?.disconnect()
    this.tableBodyObserver.disconnect()
  }

  render () {
    return (
      <Host>
        <div class="table-wrapper" part="table-wrapper">
          <table class={clsx('table', this.interactive && 'table--interactive')} role="table" part="table">
            <slot onSlotchange={this.updateSlottedElements}/>
          </table>
        </div>
        { this.selectable && this.hasBatchActions &&
          <div class={clsx('batch-actions-wrapper', this.selectedRows.length > 0 ? 'batch-actions-wrapper--has-selected-rows' : '')} part="batch-actions-wrapper">
            <div class="batch-actions" part="batch-actions">
              <div class="batch-actions-header">
                <mds-text class="batch-actions-label" typography="label">{ this.t.get('batchActions') }</mds-text>
                <mds-badge variant="dark" tone="outline" typography="label">{this.selectedRows.length}</mds-badge>
              </div>
              <slot name="batch-action"/>
            </div>
          </div>
        }
      </Host>
    )
  }
}
