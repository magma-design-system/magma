import { Component, Host, h, Element, State, Method, Prop } from '@stencil/core'
import { Locale } from '@common/locale'
import localeEl from './meta/locale.el.json'
import localeEn from './meta/locale.en.json'
import localeEs from './meta/locale.es.json'
import localeIt from './meta/locale.it.json'

/**
 * @slot default - Add `mds-table-row` element/s.
 */

@Component({
  tag: 'mds-table-header',
  styleUrl: 'mds-table-header.css',
  shadow: true,
})
export class MdsTableHeader {

  @Element() host: HTMLMdsTableHeaderElement
  private table: HTMLMdsTableElement
  private checkboxEl: HTMLMdsInputSwitchElement
  @State() selectAll: boolean = false
  @State() hasActions: boolean = false
  @State() indeterminate: boolean = false
  @State() hasSelection?: boolean = false
  private t:Locale = new Locale({
    el: localeEl,
    en: localeEn,
    es: localeEs,
    it: localeIt,
  })
  @State() language: string
  @Method()
  async updateLang (): Promise<void> {
    this.language = this.t.lang(this.host)
    this.t.update()
  }

  @Prop() readonly selectable?: boolean

  @Method()
  async setSelection (selectedItems: number, totalItems: number): Promise<void> {
    this.indeterminate = selectedItems !== 0 ? selectedItems !== totalItems : false
    if (this.indeterminate) {
      if (!this.checkboxEl) {
        this.checkboxEl = this.host.shadowRoot?.querySelector('.checkbox') as HTMLMdsInputSwitchElement
      }
      this.checkboxEl.checked = false
    }
  }

  componentWillLoad (): void {
    this.language = this.t.lang(this.host)
    this.table = this.host.closest('mds-table') as HTMLMdsTableElement
    this.hasActions = this.table.querySelector('[slot="action"]') !== null
  }

  private handleSelectAllChange = (e: CustomEvent): void => {
    if (this.indeterminate) {
      this.selectAll = true
    } else {
      this.selectAll = e.detail.checked
    }
    this.indeterminate = false
    this.table.selectAll(this.selectAll)
  }

  render () {
    return (
      <Host role="row">
        { this.selectable &&
          <mds-table-cell class="selection" role="columnheader">
            <div class="checkbox-wrapper">
              <mds-input-switch class="checkbox" title={this.t.get(this.selectAll ? 'selectNoneRows' : 'selectAllRows')} lang={this.language} type="checkbox" onMdsInputSwitchChange={this.handleSelectAllChange} indeterminate={this.indeterminate}></mds-input-switch>
            </div>
          </mds-table-cell>
        }
        <slot/>
        { this.hasActions && <mds-table-header-cell class="actions" label={this.t.get('actions')}></mds-table-header-cell> }
      </Host>
    )
  }

}
