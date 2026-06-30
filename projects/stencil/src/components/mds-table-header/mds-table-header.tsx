import { Component, Host, h, Element, State, Method, Prop } from '@stencil/core';
import { Locale } from '@common/locale';
import { subscribePreference } from '@common/preference';
import localeEl from './meta/locale.el.json';
import localeEn from './meta/locale.en.json';
import localeEs from './meta/locale.es.json';
import localeIt from './meta/locale.it.json';
import { MdsInputSwitchEventDetail } from '@component/mds-input-switch/meta/event-detail';

/**
 * @slot default - Add `mds-table-row` element/s.
 */

@Component({
  tag: 'mds-table-header',
  styleUrl: 'mds-table-header.css',
  shadow: true,
})
export class MdsTableHeader {
  @Element() host: HTMLMdsTableHeaderElement;
  @State() prefAnimation?: string;
  private unsubscribePrefAnimation?: () => void;
  private table: HTMLMdsTableElement;
  private checkboxEl: HTMLMdsInputSwitchElement;
  @State() selectAll: boolean = false;
  @State() hasActions: boolean = false;
  @State() indeterminate: boolean = false;
  @State() hasSelection?: boolean = false;
  private t: Locale = new Locale({
    el: localeEl,
    en: localeEn,
    es: localeEs,
    it: localeIt,
  });
  @State() language: string;
  @Method()
  async updateLang(): Promise<void> {
    this.language = this.t.lang(this.host);
    this.t.update();
  }

  @Prop() readonly selectable?: boolean;

  @Method()
  async setSelection(selectedItems: number, totalItems: number): Promise<void> {
    this.indeterminate = selectedItems !== 0 && selectedItems !== totalItems;
    if (this.indeterminate) {
      if (!this.checkboxEl) {
        this.checkboxEl = this.host.shadowRoot?.querySelector(
          '.checkbox',
        ) as HTMLMdsInputSwitchElement;
      }
    }
    this.checkboxEl.checked = selectedItems === totalItems;
  }

  connectedCallback(): void {
    this.unsubscribePrefAnimation = subscribePreference('animation', (value) => {
      this.prefAnimation = value;
    });
  }

  disconnectedCallback(): void {
    this.unsubscribePrefAnimation?.();
  }

  componentWillLoad(): void {
    this.language = this.t.lang(this.host);
    this.table = this.host.closest('mds-table') as HTMLMdsTableElement;
    this.hasActions = this.table.querySelector('mds-table-row > [slot="action"]') !== null;
  }

  private handleSelectAllChange = (e: CustomEvent<MdsInputSwitchEventDetail>): void => {
    if (this.indeterminate) {
      this.selectAll = true;
    } else {
      this.selectAll = e.detail.checked ?? false;
    }
    this.indeterminate = false;
    this.table.selectAll(this.selectAll);
  };

  render() {
    return (
      <Host role="row" pref-animation={this.prefAnimation}>
        {this.selectable && (
          <mds-table-cell class="selection" role="columnheader">
            <div class="checkbox-wrapper">
              <mds-input-switch
                class="checkbox"
                title={this.t.get(this.selectAll ? 'selectNoneRows' : 'selectAllRows')}
                lang={this.language}
                type="checkbox"
                onMdsInputSwitchChange={this.handleSelectAllChange}
                indeterminate={this.indeterminate}
              ></mds-input-switch>
            </div>
          </mds-table-cell>
        )}
        <slot />
        {this.hasActions && (
          <mds-table-header-cell
            part="actions"
            class="actions"
            label={this.t.get('actions')}
          ></mds-table-header-cell>
        )}
      </Host>
    );
  }
}
