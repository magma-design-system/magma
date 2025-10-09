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
   * Shows a decoration around the banner icon
   */
  @Prop({ reflect: true }) readonly cockade?: boolean = true

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

  private ariaVariants: Record<ThemeVariantType, { role: string; live: 'polite' | 'assertive' | undefined }> = {
    ai:      { role: 'status', live: 'polite' },
    dark:    { role: 'presentation', live: undefined },
    error:   { role: 'alert', live: 'assertive' },
    info:    { role: 'status', live: 'polite' },
    light:   { role: 'presentation', live: undefined },
    primary: { role: 'status', live: 'polite' },
    success: { role: 'status', live: 'polite' },
    warning: { role: 'alert', live: 'assertive' },
  }


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
    this.actions = this.host.querySelector(':scope > [slot="action"]') !== null
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
  @Event({ eventName: 'mdsBannerClose' }) closeEvent: EventEmitter<void>

  private closeBanner = (): void => {
    this.closeEvent.emit()
    const modalEL = this.host?.closest('mds-modal') as HTMLMdsModalElement
    if (modalEL) {
      modalEL.opened = false
    }
  }

  render () {
    return (
      <Host aria-label={ this.headline } role={this.ariaVariants[this.variant ?? 'primary'].role} aria-live={this.ariaVariants[this.variant ?? 'primary'].live}>
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
            <slot name="action"/>
          </div>
        }
      </Host>
    )
  }
}
