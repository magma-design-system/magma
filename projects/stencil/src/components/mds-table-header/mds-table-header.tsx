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
  @State() hasActions: boolean = false
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
    this.hasActions = this.host.closest('mds-table')?.querySelector('[slot="action"]') !== null
  }

  render () {
    return (
      <Host role="row">
        <slot/>
        { this.hasActions && <mds-table-header-cell class="actions" label={this.t.get('actions')}></mds-table-header-cell> }
      </Host>
    )
  }

}
