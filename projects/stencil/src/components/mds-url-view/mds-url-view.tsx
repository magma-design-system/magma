import miBaselineClose from '@icon/mi/baseline/close.svg'
import miBaselineExplore from '@icon/mi/baseline/explore.svg'
import { Component, Element, Event, EventEmitter, Host, h, Prop, State, Method } from '@stencil/core'
import { KeyboardManager } from '@common/keyboard-manager'
import { LoadingType } from '@type/loading'
import { Locale } from '@common/locale'
import localeEl from './meta/locale.el.json'
import localeEn from './meta/locale.en.json'
import localeEs from './meta/locale.es.json'
import localeIt from './meta/locale.it.json'

@Component({
  tag: 'mds-url-view',
  styleUrl: 'mds-url-view.css',
  shadow: true,
})
export class MdsUrlView {

  @Element() host: HTMLMdsUrlViewElement
  private km = new KeyboardManager()
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

  /**
   * Specifies if domain is visible on header
   */
  @Prop() readonly domain!: boolean

  /**
   * Specifies the URL to the web page
   */
  @Prop() readonly src!: string

  /**
   * Specifies whether a browser should load an iframe immediately
   * or to defer loading of images until some conditions are met.
   */
  @Prop() readonly loading?: LoadingType = 'lazy'

  private urlDomain = (url: string): string => {
    const domain = new URL(url)
    return domain.hostname.replace('www.', '')
  }

  /**
   * Emits when the url view is closed
   */
  @Event({ bubbles: true, composed: true, eventName: 'mdsUrlViewClose' }) closeEvent: EventEmitter<void>

  private closeUrlView = (): void => {
    this.closeEvent.emit()
  }

  componentWillLoad ():void {
    this.t.lang(this.host)
  }

  componentDidLoad (): void {
    const close = this.host.shadowRoot?.querySelector('.close') as HTMLElement
    this.km.addElement(close)
    this.km.attachClickBehavior()
  }

  disconnectedCallback = (): void => {
    this.km.detachClickBehavior()
  }

  render () {
    return (
      <Host aria-label={this.t.get('previewURL', { url: this.urlDomain(this.src) })}>
        <div class="window">
          <div class="header">
            <i class="browser-icon" innerHTML={miBaselineExplore}/>
            { this.domain && <mds-text class="title" typography="caption">
              { this.urlDomain(this.src) }
            </mds-text> }
            <mds-button title={this.t.get('close')} class="button-close" icon={miBaselineClose} onClick={this.closeUrlView}></mds-button>
          </div>
          <iframe class="iframe" aria-label={this.t.get('iframeURL', { url: this.urlDomain(this.src) })} src={ this.src }/>
        </div>
      </Host>
    )
  }

}
