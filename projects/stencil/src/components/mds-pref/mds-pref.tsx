import { Component, Host, h, Element, State, Method } from '@stencil/core'
import { Locale } from '@common/locale'
import localeEl from './meta/locale.el.json'
import localeEn from './meta/locale.en.json'
import localeEs from './meta/locale.es.json'
import localeIt from './meta/locale.it.json'

/**
 * @slot default - Add `mds-pref-animation`, `mds-pref-consumption`, `mds-pref-contrast`, `mds-pref-language`, or `mds-pref-theme` element/s.
 */

@Component({
  tag: 'mds-pref',
  styleUrl: 'mds-pref.css',
  shadow: true,
})
export class MdsPref {

  @Element() host: HTMLMdsPrefElement
  @State() showReload: boolean = false
  private prefNeedsReload: string[] = ['consumption', 'language']
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

  componentWillRender (): void {
    this.t.lang(this.host)
  }

  componentDidLoad (): void {
    this.host.querySelector('mds-pref-animation') && this.addEvent(this.host.querySelector('mds-pref-animation') as HTMLElement)
    this.host.querySelector('mds-pref-consumption') && this.addEvent(this.host.querySelector('mds-pref-consumption') as HTMLElement)
    this.host.querySelector('mds-pref-contrast') && this.addEvent(this.host.querySelector('mds-pref-contrast') as HTMLElement)
    this.host.querySelector('mds-pref-language') && this.addEvent(this.host.querySelector('mds-pref-language') as HTMLElement)
    this.host.querySelector('mds-pref-theme') && this.addEvent(this.host.querySelector('mds-pref-theme') as HTMLElement)
  }

  private addEvent = (element: HTMLElement): void => {
    element.addEventListener('mdsPrefChange', (e: CustomEvent) => {
      if (this.prefNeedsReload.includes(e.detail.preference)) {
        this.showReload = true
        if (e.detail.preference === 'language') {
          this.t.lang(this.host)
        }
      }
    })
  }

  render () {
    return (
      <Host>
        <slot></slot>
        { this.showReload && <div class="reload-required">
          <mds-text typography="caption">{ this.t.get('reloadPageToSeeChanges') }</mds-text>
        </div> }
      </Host>
    )
  }
}
