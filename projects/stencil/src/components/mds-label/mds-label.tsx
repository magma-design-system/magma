import miBaselineCancel from '@icon/mi/baseline/cancel.svg'
import { Component, Element, Event, EventEmitter, Host, h, Prop, State, Method } from '@stencil/core'
import { KeyboardManager } from '@common/keyboard-manager'
import { ThemeFullVariantType, ToneSimpleVariantType } from '@type/variant'
import { TypographyType } from '@type/typography'
import { TypographyTruncateType } from '@type/text'
import { Locale } from '@common/locale'
import localeEl from './meta/locale.el.json'
import localeEn from './meta/locale.en.json'
import localeEs from './meta/locale.en.json'
import localeIt from './meta/locale.it.json'

/**
 * @slot default - Add `text string` to this slot, **avoid** to add `HTML elements` or `components` here.
 */

@Component({
  tag: 'mds-label',
  styleUrl: 'mds-label.css',
  shadow: true,
})
export class MdsLabel {

  @Element() private host: HTMLMdsLabelElement
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
   * Specifies the ARIA label for remove element
   */
  @Prop() readonly labelAction?: string = 'Rimuovi'

  /**
   * Sets the theme variant colors
   */
  @Prop({ reflect: true }) readonly variant: ThemeFullVariantType = 'sky'

  /**
   * Sets the tone of the color variant
   */
  @Prop({ reflect: true }) readonly tone: ToneSimpleVariantType = 'quiet'

  /**
   * Truncates text inside the label or displays it in multiline if needed
   */
  @Prop({ reflect: true }) readonly truncate?: TypographyTruncateType

  /**
   * Specifies the typography of the element
   */
  @Prop() readonly typography: TypographyType = 'caption'

  /**
   * Enables the cross icon to perform cancel/delete action on element
   */
  @Prop() readonly deletable: boolean = false

  private onClickDelete = (ev: Event) => {
    ev.stopPropagation()
    ev.preventDefault()
    this.deletedEvent.emit()
  }

  /**
   * Emits when the label has to be cancelled
   */
  @Event({ eventName: 'mdsLabelDelete' }) deletedEvent: EventEmitter<void>

  private handleKeyboard = (): void => {
    if (this.deletable) {
      const close = this.host.shadowRoot?.querySelector('.close') as HTMLElement
      this.km.addElement(close)
      this.km.attachClickBehavior()
      return
    }
    this.km.detachClickBehavior()
  }

  componentDidLoad ():void {
    this.t.lang(this.host)
    this.handleKeyboard()
  }

  componentDidUpdate (): void {
    this.handleKeyboard()
  }

  disconnectedCallback (): void {
    this.km.detachClickBehavior()
  }

  render () {
    return (
      <Host>
        <mds-text class="text" truncate={this.truncate} typography={this.typography}>
          <slot/>
        </mds-text>
        { this.deletable && <mds-button class="button-close" icon={miBaselineCancel} onClick={ this.onClickDelete.bind(this) } title={this.t.get('remove')}></mds-button> }
      </Host>
    )
  }
}
