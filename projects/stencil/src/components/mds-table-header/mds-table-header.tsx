import { Component, Host, h, Element, State, Method } from '@stencil/core'
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
  @State() hasActions: boolean = false
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
  }

  componentWillLoad (): void {
    this.t.lang(this.host)
    this.table = this.host.closest('mds-table') as HTMLMdsTableElement
    this.hasActions = this.table.querySelector('[slot="action"]') !== null
    this.hasSelection = this.table.hasAttribute('selectable')
  }

  private handleSelectAllChange = (e: CustomEvent): void => {
    this.table.selectAll(e.detail.checked)
  }

  render () {
    return (
      <Host role="row">
        { this.hasSelection && <mds-table-cell class="selection">
          <mds-input-switch type="checkbox" onMdsInputSwitchChange={this.handleSelectAllChange}></mds-input-switch>
        </mds-table-cell> }
        <slot/>
        { this.hasActions && <mds-table-header-cell class="actions" label={this.t.get('actions')}></mds-table-header-cell> }
      </Host>
    )
  }

}
