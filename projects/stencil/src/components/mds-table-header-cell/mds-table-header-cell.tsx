import {
  Build,
  Component,
  Element,
  Event,
  EventEmitter,
  Host,
  h,
  Prop,
  Watch,
} from '@stencil/core';
import { preferenceStore } from '@common/preference';
import miBaselineKeyboardArrowUp from '@icon/mi/baseline/keyboard-arrow-up.svg';
import miBaselineKeyboardArrowDown from '@icon/mi/baseline/keyboard-arrow-down.svg';
import miBaselineUnfoldMore from '@icon/mi/baseline/unfold-more.svg';
import { SortDirectionType } from './meta/types';
import { MdsTableHeaderCellSortEventDetail } from './meta/event-detail';
import clsx from 'clsx';

const cycle: SortDirectionType[] = ['none', 'ascending', 'descending'];

// the order the rows of a table body had before any column sorted them, brought back when the
// last sorted column returns to none; rows that left the body in the meantime stay out
const naturalOrder = new WeakMap<Element, HTMLMdsTableRowElement[]>();

/**
 * @part action - The `mds-button` that sorts the column, with the `label`: only when `sortable`
 * @part label - The `label` of a column that is not `sortable`
 */
@Component({
  tag: 'mds-table-header-cell',
  styleUrl: 'mds-table-header-cell.css',
  shadow: true,
})
export class MdsTableHeaderCell {
  @Element() element: HTMLMdsTableHeaderCellElement;
  // set while the click writes `direction`: the watcher must not take it for a write from outside
  private writingDirection = false;
  private bodyObserver?: MutationObserver;

  /**
   * Tells the component to make the cell able to sort the table columns items
   */
  @Prop({ reflect: true }) readonly sortable?: boolean;

  /**
   * Sets a label for the cell
   */
  @Prop({ reflect: true }) readonly label?: string;

  /**
   * Names the column in the `mdsTableHeaderCellSort` event, for example the field the back end
   * sorts by
   * @example 'createdAt'
   */
  @Prop({ reflect: true }) readonly sortKey?: string;

  /**
   * Specifies the current sort direction of the column. Set from outside, it sorts the rows like a
   * click, or only shows the order when the table has `sorting="external"`.
   */
  @Prop({ reflect: true, mutable: true }) direction: SortDirectionType = 'none';

  /**
   * Emits when the user changes the sort direction of the column, at every step of the cycle. With
   * `sorting="external"` on the table the rows are not moved: the application renders them in the
   * order asked.
   */
  @Event({ eventName: 'mdsTableHeaderCellSort' })
  sortEvent: EventEmitter<MdsTableHeaderCellSortEventDetail>;

  componentDidLoad(): void {
    if (this.direction !== 'none') {
      this.applyDirection();
    }
  }

  disconnectedCallback(): void {
    this.bodyObserver?.disconnect();
  }

  private table = (): HTMLMdsTableElement | null => this.element.closest('mds-table');

  private body = (): HTMLMdsTableBodyElement | null | undefined =>
    this.table()?.querySelector('mds-table-body');

  private rows = (body: HTMLMdsTableBodyElement): HTMLMdsTableRowElement[] =>
    Array.from(body.children) as HTMLMdsTableRowElement[];

  private index = (): number =>
    Array.from(this.element.closest('mds-table-header')?.children ?? []).indexOf(this.element);

  private siblings = (): HTMLMdsTableHeaderCellElement[] =>
    Array.from(
      this.element.closest('mds-table-header')?.querySelectorAll('mds-table-header-cell') ?? [],
    ).filter((cell) => cell !== this.element);

  private hasSortedSibling = (): boolean =>
    this.siblings().some((cell) => cell.direction !== 'none');

  private isExternal = (): boolean => {
    const table = this.table();
    return (table?.sorting ?? table?.getAttribute('sorting')) === 'external';
  };

  private getValue = (element: HTMLMdsTableCellElement): string | number => {
    if (
      element.value != null &&
      element.value !== '' &&
      element.value !== 0 &&
      !Number.isNaN(element.value)
    ) {
      return element.value;
    }
    return element.textContent !== null && element.textContent !== ''
      ? element.textContent.trim()
      : '';
  };

  private sortRows = (body: HTMLMdsTableBodyElement): void => {
    if (this.direction === 'none') {
      // another column drives the order now: there is nothing of this one to undo
      if (this.hasSortedSibling()) {
        return;
      }
      const natural = naturalOrder.get(body);
      naturalOrder.delete(body);
      if (!natural) {
        return;
      }
      const known = new Set(natural);
      const added = this.rows(body).filter((row) => !known.has(row));
      [...natural.filter((row) => row.parentElement === body), ...added].forEach((row) =>
        body.appendChild(row),
      );
      return;
    }

    if (!naturalOrder.has(body)) {
      naturalOrder.set(body, this.rows(body));
    }

    const index = this.index();
    const sortedRows = [...this.rows(body)].sort(
      (a: HTMLMdsTableRowElement, b: HTMLMdsTableRowElement) => {
        const cellA = this.getValue(a.querySelectorAll('mds-table-cell')[index]);
        const cellB = this.getValue(b.querySelectorAll('mds-table-cell')[index]);
        const isNumeric = !isNaN(Number(cellA)) && !isNaN(Number(cellB));
        if (isNumeric) {
          return this.direction === 'ascending'
            ? Number(cellA) - Number(cellB)
            : Number(cellB) - Number(cellA);
        }
        return this.direction === 'ascending'
          ? String(cellA).localeCompare(String(cellB))
          : String(cellB).localeCompare(String(cellA));
      },
    );
    sortedRows.forEach((row) => body.appendChild(row));
  };

  // the rows of a sorted table and the cells of the sorted column carry `sorted`, which their
  // styles read; a column that returns to none clears its own cells, and the rows only when no
  // other column is sorted
  private markRows = (body: HTMLMdsTableBodyElement): void => {
    const index = this.index();
    const sorted = this.direction !== 'none';
    const keepRows = !sorted && this.hasSortedSibling();
    this.rows(body).forEach((row) => {
      if (sorted) {
        row.setAttribute('sorted', '');
      } else if (!keepRows) {
        row.removeAttribute('sorted');
      }
      const cell = row.children[index];
      if (sorted) {
        cell?.setAttribute('sorted', '');
      } else {
        cell?.removeAttribute('sorted');
      }
    });
  };

  // rows rendered after the sort, the page an application loads with `sorting="external"`, get
  // the marks of the sorted column too
  private observeRows = (body: HTMLMdsTableBodyElement): void => {
    this.bodyObserver?.disconnect();
    this.bodyObserver = undefined;
    if (this.direction === 'none' || !Build.isBrowser) {
      return;
    }
    this.bodyObserver = new MutationObserver(() => this.markRows(body));
    this.bodyObserver.observe(body, { childList: true });
  };

  /**
   * Brings the table in line with `direction`, whoever set it: one sorted column at a time, the
   * rows in its order unless the table sorts them outside, the marks of the sorted column.
   */
  private applyDirection = (): void => {
    const body = this.body();
    if (!this.sortable || !body) {
      return;
    }
    if (this.direction !== 'none') {
      this.siblings().forEach((cell) => {
        if (cell.direction !== 'none') {
          cell.direction = 'none';
        }
      });
    }
    if (!this.isExternal()) {
      this.sortRows(body);
    }
    this.markRows(body);
    this.observeRows(body);
  };

  private sort = (): void => {
    const direction = cycle[(cycle.indexOf(this.direction) + 1) % cycle.length];
    this.writingDirection = true;
    this.direction = direction;
    this.writingDirection = false;
    this.applyDirection();
    this.sortEvent.emit({ direction, index: this.index(), sortKey: this.sortKey });
  };

  @Watch('direction')
  directionHandler(): void {
    if (this.writingDirection) {
      return;
    }
    this.applyDirection();
  }

  render() {
    return (
      <Host
        role="columnheader"
        aria-sort={this.direction}
        pref-animation={preferenceStore.state.animation}
      >
        {this.sortable ? (
          <mds-button
            class="action"
            icon={clsx(
              this.direction === 'none' && miBaselineUnfoldMore,
              this.direction === 'ascending' && miBaselineKeyboardArrowUp,
              this.direction === 'descending' && miBaselineKeyboardArrowDown,
            )}
            icon-position="right"
            onClick={this.sort}
            tone="text"
            variant="dark"
            size="sm"
            part="action"
            label={this.label}
          ></mds-button>
        ) : (
          <mds-text class="label" typography="label" part="label">
            {this.label}
          </mds-text>
        )}
      </Host>
    );
  }
}
