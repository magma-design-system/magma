import { Component, Element, Host, h, Prop, State, Watch } from '@stencil/core'
import miBaselineKeyboardArrowUp from '@icon/mi/baseline/keyboard-arrow-up.svg'
import miBaselineKeyboardArrowDown from '@icon/mi/baseline/keyboard-arrow-down.svg'
import miBaselineUnfoldMore from '@icon/mi/baseline/unfold-more.svg'
import { SortDirectionType } from './meta/types'
import clsx from 'clsx'

@Component({
  tag: 'mds-table-header-cell',
  styleUrl: 'mds-table-header-cell.css',
  shadow: true,
})
export class MdsTableHeaderCell {

  @State() isAscending: boolean = true
  @Element() element: HTMLMdsTableHeaderCellElement
  private tableBody: HTMLMdsTableBodyElement
  private tableHeader: HTMLMdsTableHeaderElement
  private tableHeaderCellSiblings: HTMLMdsTableHeaderCellElement[]
  private tableRows: HTMLMdsTableRowElement[]
  private index: number = 0
  private sorterInitialized: boolean = false
  private dirtySorted: boolean = false

  /**
   * Tells the component to make the cell able to sort the table columns items
   */
  @Prop({ reflect: true }) readonly sortable?: boolean

  /**
   * Sets a label for the cell
   */
  @Prop({ reflect: true }) readonly label?: string

  @Prop({ reflect: true, mutable: true }) direction: SortDirectionType = 'none'

  componentDidLoad (): void {
    if (this.sortable && !this.sorterInitialized) {
      this.prepareSorter()
    }
  }

  private prepareSorter = (): void => {
    this.tableBody = this.element.closest('mds-table')?.querySelector('mds-table-body') as HTMLMdsTableBodyElement
    this.tableHeader = this.element.closest('mds-table-header') as HTMLMdsTableHeaderElement
    this.tableHeaderCellSiblings = Array.from(this.tableHeader.children) as HTMLMdsTableHeaderCellElement[]
    this.index = this.tableHeaderCellSiblings.indexOf(this.element)
    this.tableRows = Array.from(this.tableBody.children) as HTMLMdsTableRowElement[]
    this.sorterInitialized = true
  }

  private getValue = (element: HTMLMdsTableCellElement): string | number => {
    if (element.value) {
      return element.value
    }
    return element.textContent ? element.textContent.trim() : ''
  }

  private resetSortAttribute = (): void => {

    this.tableHeaderCellSiblings.forEach((cell: HTMLMdsTableHeaderCellElement) => {
      if (this.tableHeaderCellSiblings.indexOf(cell) !== this.index) {
        cell.direction = 'none'
      }
    })

    this.tableRows.forEach((row: HTMLMdsTableRowElement) => {
      const cells: HTMLMdsTableCellElement[] = Array.from(row.children) as HTMLMdsTableCellElement[]
      cells.forEach((cell: HTMLMdsTableCellElement, index: number) => {
        if (this.index === index) {
          cell.setAttribute('sorted', '')
          return
        }
        cell.removeAttribute('sorted')
      })
    })
  }

  private sortRows = (): void => {
    const sortedRows = this.tableRows.sort((a: HTMLMdsTableRowElement, b: HTMLMdsTableRowElement) => {
      const cellA = this.getValue(a.querySelectorAll('mds-table-cell')[this.index])
      const cellB = this.getValue(b.querySelectorAll('mds-table-cell')[this.index])
      const isNumeric = !isNaN(Number(cellA)) && !isNaN(Number(cellB))
      if (isNumeric) {
        return this.isAscending ? Number(cellA) - Number(cellB) : Number(cellB) - Number(cellA)
      }
      return this.isAscending ? String(cellA).localeCompare(String(cellB)) : String(cellB).localeCompare(String(cellA))
    })
    sortedRows.forEach(row => this.tableBody.appendChild(row))
  }

  private sort = (): void => {
    this.isAscending = !this.isAscending
    if (this.isAscending) {
      this.direction = 'asc'
    } else {
      this.direction = 'desc'
    }
    this.sortRows()
    this.resetSortAttribute()
    if (!this.dirtySorted) {
      this.tableRows.forEach((row: HTMLMdsTableRowElement) => {
        row.setAttribute('sorted', '')
      })
    }
    this.dirtySorted = true
  }

  @Watch('sortable')
  sortableHandler (newValue: boolean): void {
    if (newValue && !this.sorterInitialized) {
      this.prepareSorter()
    }
  }

  render () {
    return (
      <Host>
        { this.sortable
          ? <mds-button class="action" icon={clsx(this.direction === 'none' && miBaselineUnfoldMore, this.direction === 'asc' && miBaselineKeyboardArrowUp, this.direction === 'desc' && miBaselineKeyboardArrowDown)} icon-position="right" onClick={this.sort} tone="quiet" variant="dark" size="sm" part="action">
            { this.label }
          </mds-button>
          : <mds-text class="label" typography="label" part="label">
            { this.label }
          </mds-text>
        }
      </Host>
    )
  }
}
