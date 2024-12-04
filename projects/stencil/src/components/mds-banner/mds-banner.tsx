import { Component, Element, Event, EventEmitter, Host, Prop, h, State, Method } from '@stencil/core'
import { ToneSimpleVariantType, ThemeVariantType } from '@type/variant'
import miBaselineClose from '@icon/mi/baseline/close.svg'
import { KeyboardManager } from '@common/keyboard-manager'
import { Locale } from '@common/locale'
import localeEl from './meta/locale.el.json'
import localeEn from './meta/locale.en.json'
import localeEs from './meta/locale.es.json'
import localeIt from './meta/locale.it.json'

/**
 * @slot default - Add `text string`, `HTML elements` or `components` to this slot.
 * @slot action - Add `HTML elements` or `components`, it is **recommended** to use `mds-button` element.
 */

@Component({
  tag: 'mds-banner',
  styleUrl: 'mds-banner.css',
  shadow: true,
})
export class MdsBanner {

  @Element() host: HTMLMdsBannerElement
  private actions: boolean
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
   * Sets the theme variant colors
   */
  @Prop({ reflect: true }) readonly variant?: ThemeVariantType = 'light'

  /**
   * Sets the tone of the color variant
   */
  @Prop({ reflect: true }) readonly tone?: ToneSimpleVariantType = 'weak'

  /**
   * Shows the cross icon to perform cancel/delete action on element
   */
  @Prop() readonly deletable?: boolean

  /**
   * The title on the top of the banner
   */
  @Prop() readonly headline?: string

  /**
   * An icon displayed at the top left of the banner
   */
  @Prop() readonly icon?: string

  private deletableHandler = (): void => {
    if (this.deletable) {
      const closeIcon = this.host.shadowRoot?.querySelector('.close-button') as HTMLElement
      this.km.addElement(closeIcon)
      this.km.attachClickBehavior()
      return
    }
    this.km.detachClickBehavior()
  }

  componentWillRender (): void {
    this.t.lang(this.host)
  }

  componentWillLoad (): void {
    this.actions = this.host.querySelector('[slot="actions"]') !== null
  }

  componentDidLoad (): void {
    this.deletableHandler()
  }

  componentDidUpdate (): void {
    this.deletableHandler()
  }

  disconnectedCallback (): void {
    this.km.detachClickBehavior()
  }

  /**
   * Emits when the url view is closed
   */
  @Event({ bubbles: true, composed: true, eventName: 'mdsBannerClose' }) closeEvent: EventEmitter<void>

  private closeBanner = (): void => {
    this.closeEvent.emit()
  }

  render () {
    return (
      <Host aria-label={ this.headline }>
        <div class="body">
          { this.icon && <mds-icon aria-hidden="true" class="icon" name={this.icon}/> }
          <div class="content">
            { this.headline && <mds-text aria-hidden="true" class="headline" typography="h6">{ this.headline }</mds-text> }
            <div class="text">
              <slot/>
            </div>
          </div>
          { this.deletable && <mds-button class="close-button" icon={miBaselineClose} onClick={this.closeBanner} title={ this.t.get('cancel') }/>}
        </div>
        { this.actions
          &&
          <div class="actions">
            <slot name="actions"/>
          </div>
        }
      </Host>
    )
  }
}
