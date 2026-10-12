import { Build, Component, Host, h, Prop, Element, State } from '@stencil/core';
import { hasChildWithSlot } from '@common/slot';
import clsx from 'clsx';
import { Locale } from '@common/locale';
import localeEl from './meta/locale.el.json';
import localeEn from './meta/locale.en.json';
import localeEs from './meta/locale.es.json';
import localeIt from './meta/locale.it.json';
import { isSafari } from '@common/browser';
import { preferenceStore } from '@common/preference';

/**
 * @slot - Put `mds-table-cell` element/s.
 * @slot action - Put `mds-button` element/s or other kind of actions as aside menu for the single row.
 */

// TODO [bug, style]: on Safari actions menu is visually broken

@Component({
  tag: 'mds-table-row',
  styleUrl: 'mds-table-row.css',
  shadow: true,
})
export class MdsTableRow {
  @Element() host: HTMLMdsTableRowElement;
  private actions?: HTMLDivElement;
  @State() hasActions: boolean;
  private observer?: ResizeObserver;
  // border box width of the actions, unknown until the observer reports it (and on the server)
  @State() sizerWidth?: string;
  private t: Locale = new Locale({
    el: localeEl,
    en: localeEn,
    es: localeEs,
    it: localeIt,
  });

  /**
   * Specifies whether the row reacts to user interaction (hover/focus).
   */
  @Prop({ reflect: true }) readonly interactive?: boolean;

  /**
   * Specifies whether the row's actions are shown as an overlay.
   */
  @Prop({ reflect: true }) readonly overlayActions: boolean;

  /**
   * Specifies whether the row can be selected via a checkbox.
   */
  @Prop({ reflect: true }) readonly selectable?: boolean = undefined;

  /**
   * Specifies whether the row is currently selected.
   */
  @Prop({ mutable: true, reflect: true }) selected?: boolean;

  /**
   * Reflects the parent table selection state (set by mds-table); drives the
   * row action background without :host-context
   */
  @Prop({ reflect: true }) readonly selection?: boolean;

  /**
   * The value associated with the row, emitted when the row is selected.
   */
  @Prop({ reflect: true }) readonly value?: string | number;

  private onActionSlotChange = (): void => {
    this.hasActions = hasChildWithSlot(this.host, 'action');
  };

  componentWillLoad(): void {
    this.hasActions = hasChildWithSlot(this.host, 'action');
  }

  connectedCallback(): void {
    // a row moved or re-attached after its first load lost the observer in disconnectedCallback:
    // React reveals a streamed SSR boundary that way, moving the rows hydrated in a hidden
    // container, so the width measured there (0, or nothing yet) would never be updated
    this.observeActions();
  }

  componentDidLoad(): void {
    // needed to capture sizer width when become visible
    this.observeActions();
  }

  private observeActions(): void {
    // nothing to measure on the server; the actions are not rendered before the first load
    if (!Build.isBrowser || !this.actions) return;
    this.observer ??= new ResizeObserver((entry) => {
      // the cell is hidden while the slot is empty: no border box to read
      this.sizerWidth = `${entry[0].borderBoxSize?.[0]?.inlineSize ?? 0}px`;
    });
    // a new observation always reports the current size first
    this.observer.observe(this.actions);
  }

  disconnectedCallback() {
    this.observer?.disconnect();
  }

  private handleSelectionChange = (e: CustomEvent): void => {
    this.selected = e.detail.checked;
    this.host.closest('mds-table')?.updateSelection();
  };

  render() {
    return (
      <Host role="row" pref-animation={preferenceStore.state.animation}>
        {this.selectable && (
          <mds-table-cell class="selection-cell">
            <div class="checkbox-wrapper">
              <mds-input-switch
                title={this.t.get(this.selected ? 'unselectRow' : 'selectRow')}
                type="checkbox"
                checked={this.selected}
                onMdsInputSwitchChange={this.handleSelectionChange}
              ></mds-input-switch>
            </div>
          </mds-table-cell>
        )}
        <slot />
        {isSafari() && (
          <mds-table-cell
            class={clsx(
              'actions-cell',
              'actions-cell--disable',
              !this.hasActions && 'actions-cell--hidden',
            )}
          >
            <div class="actions">
              <slot name="action" onSlotchange={this.onActionSlotChange}></slot>
            </div>
          </mds-table-cell>
        )}
        {!isSafari() && (
          <mds-table-cell class={clsx('actions-cell', !this.hasActions && 'actions-cell--hidden')}>
            <div
              class="actions-sizer"
              style={{
                minHeight: '1px',
                // until the width is measured (the server render included) the styles that depend
                // on it are left out: `calc(undefined + ...)` is invalid and drops the margin
                ...(this.sizerWidth && { maxWidth: this.sizerWidth, minWidth: this.sizerWidth }),
              }}
            ></div>
            <div class="actions-view">
              <div
                class="actions"
                ref={(el) => (this.actions = el as HTMLDivElement)}
                style={
                  this.sizerWidth
                    ? { marginRight: `calc(${this.sizerWidth} + var(--mds-table-cell-padding))` }
                    : undefined
                }
              >
                <slot name="action" onSlotchange={this.onActionSlotChange}></slot>
              </div>
            </div>
          </mds-table-cell>
        )}
      </Host>
    );
  }
}
