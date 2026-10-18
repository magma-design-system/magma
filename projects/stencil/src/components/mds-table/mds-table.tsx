import clsx from 'clsx';
import {
  Build,
  Component,
  Host,
  h,
  Prop,
  Event,
  EventEmitter,
  Watch,
  Element,
  Method,
  State,
} from '@stencil/core';
import { MdsTableSelectionEventDetail } from './meta/event-detail';
import { MdsTableRowSelection, MdsTableSortingType } from './meta/type';
import { Locale } from '@common/locale';
import { preferenceStore } from '@common/preference';
import { hasChildWithSlot, observeChildren } from '@common/slot';
import localeEl from './meta/locale.el.json';
import localeEn from './meta/locale.en.json';
import localeEs from './meta/locale.es.json';
import localeIt from './meta/locale.it.json';

/**
 * @slot - Put `mds-table-header`, `mds-table-body`, `mds-table-footer` element/s.
 * @slot batch-action - Put `mds-button` element/s.
 * @part table-wrapper - Selects the element which wraps the table
 * @part table - Selects the table element
 * @part batch-actions - Selects the element which wraps the batch actions
 * @part batch-actions-wrapper - The bar of the batch actions, shown while the table is `selectable` and has `batch-action` content
 */

@Component({
  tag: 'mds-table',
  styleUrl: 'mds-table.css',
  shadow: true,
})
export class MdsTable {
  @Element() host: HTMLMdsTableElement;
  /**
   * Slotted elements are assigned in `componentWillLoad`, but the `interactive`/`selectable`
   * watchers can fire before it and, with streamed HTML, the children can still be unparsed
   * when it runs: every dereference below has to tolerate `undefined`/`null`.
   */
  private rows?: NodeListOf<HTMLMdsTableRowElement>;
  private body?: HTMLMdsTableBodyElement | null;
  private header?: HTMLMdsTableHeaderElement | null;
  private scrollWrapper?: HTMLDivElement;
  private resizeObserver?: ResizeObserver;
  private tableBodyObserver?: MutationObserver;
  @State() private hasBatchActions: boolean = false;
  private cellsWidth: number = 0;
  @State() selectedRows: MdsTableRowSelection[] = [];
  private t: Locale = new Locale({
    el: localeEl,
    en: localeEn,
    es: localeEs,
    it: localeIt,
  });

  /**
   * Specifies if the table rows are higlighted on mouseover event
   */
  @Prop() readonly interactive?: boolean;

  /**
   * Specifies if the table rows are selectable by a checkbox
   */
  @Prop() readonly selectable?: boolean;

  /**
   * Indicates whether row selection is currently active in the table.
   */
  @Prop({ mutable: true, reflect: true }) selection?: boolean;

  /**
   * Specifies who sorts the rows when a sortable header cell changes direction: `internal` moves
   * them in the DOM, `external` leaves them to the application, which listens to
   * `mdsTableHeaderCellSort` and renders the rows in the order asked (a table that shows one page
   * of a larger set)
   */
  @Prop({ reflect: true }) readonly sorting?: MdsTableSortingType = 'internal';

  /**
   * Emits when the selection of a `selectable` table changes, with the index and the value of each
   * selected row
   */
  @Event({ bubbles: true, composed: true, eventName: 'mdsTableSelectionChange' })
  selectionEvent: EventEmitter<MdsTableSelectionEventDetail>;

  @Watch('interactive')
  onTableInteractive(): void {
    this.updateInteractive();
  }

  @Watch('selectable')
  onTableSelectable(newValue: boolean): void {
    this.handleSelection();
    if (this.header) {
      this.header.selectable = newValue;
    }
  }

  /**
   * `internal` Updates the selection data event and emits it, it's used to avoid add event listener to the dom and lower performance, works only if `selectable` is true.
   */
  @Method()
  async updateSelection(): Promise<void> {
    if (!this.selectable || !this.rows) {
      return;
    }
    this.selectedRows = [];
    this.rows.forEach((row: HTMLMdsTableRowElement, index: number) => {
      if (row.selected) {
        this.selectedRows.push({ index, value: row.value } as MdsTableRowSelection);
      }
    });
    this.selectionEvent.emit({ rows: this.selectedRows });
    this.header?.setSelection(this.selectedRows.length, this.rows.length);
    this.selection = this.selectedRows.length > 0;
    if (this.body) {
      this.body.selection = this.selection;
    }
    this.rows.forEach((row: HTMLMdsTableRowElement) => {
      row.selection = this.selection;
    });
  }

  /**
   * `internal` Reads again whether the rows have `slot="action"` content: shows or hides the
   * Actions column of the header and wires the overlay of the actions. Runs when rows come and
   * go, and mds-table-row calls it when the content of its `action` slot changes.
   */
  @Method()
  async updateActions(): Promise<void> {
    const hasActions = this.hasActions();
    // a header not upgraded yet (its definition loaded after the table's) has no method: it
    // reads the rows itself when it loads
    this.header?.setActions?.(hasActions);
    if (hasActions) {
      this.watchActions();
    }
  }

  /**
   * Selects all elements or none, works only if `selectable` is true.
   */
  @Method()
  async selectAll(select: boolean = true): Promise<void> {
    if (!this.selectable || !this.rows) {
      return;
    }
    this.rows.forEach((row: HTMLMdsTableRowElement) => {
      row.selected = select;
    });
    this.updateSelection();
  }

  private updateInteractive = (): void => {
    if (this.body) {
      this.body.interactive = this.interactive;
    }
    this.rows?.forEach((row: HTMLMdsTableRowElement) => {
      row.interactive = this.interactive;
    });
  };

  private updateCellsSize = (): void => {
    const firstRow = this.rows?.[0];
    if (!firstRow) {
      return;
    }
    const cells: NodeListOf<HTMLMdsTableCellElement> = firstRow.querySelectorAll('mds-table-cell');
    const cellSelection: HTMLMdsTableCellElement = firstRow.shadowRoot?.querySelector(
      '.selection-cell',
    ) as HTMLMdsTableCellElement;
    this.cellsWidth = cellSelection != null ? cellSelection.offsetWidth : 0;
    cells.forEach((cell: HTMLMdsTableCellElement) => {
      this.cellsWidth += cell.offsetWidth;
    });
  };

  private hasActions = (): boolean => {
    this.updateCellsSize();
    return this.host.querySelector('mds-table-row > [slot="action"]') !== null;
  };

  private handleSelection = (): void => {
    this.rows?.forEach((row: HTMLMdsTableRowElement) => {
      row.selectable = this.selectable;
    });
  };

  // The overlay of the actions follows the scroll and the size of the table. It is wired the
  // first time a row has actions, not only on load: a table filled after its first render (the
  // usual fetch, #801) never got it.
  private watchActions = (): void => {
    if (!Build.isBrowser) return;
    if (!this.scrollWrapper) {
      const scrollWrapper = this.host.shadowRoot?.querySelector('.table-wrapper');
      if (!scrollWrapper) return;
      this.scrollWrapper = scrollWrapper as HTMLDivElement;
      this.scrollWrapper.addEventListener('scroll', this.handleActions);
      this.resizeObserver = new ResizeObserver(this.handleActions);
      this.resizeObserver.observe(this.host);
    }
    this.handleActions();
  };

  private handleActions = (): void => {
    if (!this.scrollWrapper) return;
    this.updateCellsSize();
    const overlayActions =
      this.scrollWrapper.offsetWidth + this.scrollWrapper.scrollLeft < this.cellsWidth;
    this.rows?.forEach((row: HTMLMdsTableRowElement) => {
      row.overlayActions = overlayActions;
    });
  };

  private querySlottedElements = (): void => {
    this.body = this.host.querySelector('mds-table-body');
    this.header = this.host.querySelector('mds-table-header');
    this.rows = this.host.querySelectorAll('mds-table-row');
    if (this.body) {
      // observing an already observed node just resets its options, so this is safe to
      // re-run: it also attaches the observer to a body parsed after the first render
      this.tableBodyObserver?.observe(this.body, { childList: true });
    }
  };

  // The bar shows once a button sits in batch-action, a button added after load too: the slot is
  // rendered only with the bar, so no slotchange tells the table (#826). The observer stays on
  // the host when it moves, and goes with it.
  private updateBatchActions = (): void => {
    this.hasBatchActions = hasChildWithSlot(this.host, 'batch-action');
  };

  componentWillLoad(): void {
    this.updateBatchActions();
    observeChildren(this.host, this.updateBatchActions);
    // MutationObserver is missing in the hydrate/SSR runtime; every use of
    // tableBodyObserver is already optional-chained
    if (typeof MutationObserver !== 'undefined') {
      this.tableBodyObserver = new MutationObserver(() => {
        this.updateSlottedElements();
      });
    }
    this.querySlottedElements();
  }

  componentDidLoad(): void {
    if (this.header) {
      this.header.selectable = this.selectable;
    }
    this.updateActions();
  }

  private updateSlottedElements = (): void => {
    this.querySlottedElements();
    this.updateInteractive();
    this.handleSelection();
    this.updateActions();
  };

  connectedCallback(): void {
    // a table moved in the DOM after its first load lost the wiring of its actions in
    // disconnectedCallback; before the first load there is nothing to wire yet
    this.updateActions();
  }

  disconnectedCallback(): void {
    // the listener is on the scroll area, where watchActions put it: removing it from the host
    // removed nothing
    this.scrollWrapper?.removeEventListener('scroll', this.handleActions);
    this.resizeObserver?.disconnect();
    this.scrollWrapper = undefined;
    this.resizeObserver = undefined;
    this.tableBodyObserver?.disconnect();
  }

  render() {
    return (
      <Host
        pref-animation={preferenceStore.state.animation}
        pref-contrast={preferenceStore.state.contrast}
        pref-mode={preferenceStore.state.mode}
        pref-theme-scheme={preferenceStore.state['theme-scheme']}
      >
        <div
          class={clsx('table-wrapper', this.interactive && 'table-wrapper--interactive')}
          part="table-wrapper"
        >
          <table
            class={clsx('table', this.interactive && 'table--interactive')}
            role="table"
            part="table"
          >
            <slot onSlotchange={this.updateSlottedElements} />
          </table>
        </div>
        {this.selectable && this.hasBatchActions && (
          <div
            class={clsx(
              'batch-actions-wrapper',
              this.selectedRows.length > 0 ? 'batch-actions-wrapper--has-selected-rows' : '',
            )}
            part="batch-actions-wrapper"
          >
            <div class="batch-actions" part="batch-actions">
              <div class="batch-actions-header">
                <mds-text class="batch-actions-label" typography="label">
                  {this.t.get('batchActions')}
                </mds-text>
                {/* the count goes in through `label`, not through the slot: a badge reads
                    its slotted text once, on the first slotchange, and from then on renders
                    the copy - and slotchange does not fire again when the text node keeps
                    its place and only changes its data, which is exactly what a re-render
                    of this number does */}
                <mds-badge
                  label={`${this.selectedRows.length}`}
                  variant="dark"
                  tone="outline"
                  typography="label"
                ></mds-badge>
              </div>
              <slot name="batch-action" />
            </div>
          </div>
        )}
      </Host>
    );
  }
}
