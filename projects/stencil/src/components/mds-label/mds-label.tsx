import miBaselineCancel from '@icon/mi/baseline/cancel.svg'
import { Component, Element, Event, EventEmitter, Host, h, Prop, State, Method } from '@stencil/core'
import { KeyboardManager } from '@common/keyboard-manager'
import { ThemeLabelVariantType, ThemeStatusVariantType, ToneMinimalVariantType } from '@type/variant'
import { TypographyTooltipType } from '@type/typography'
import { TypographyTruncateType } from '@type/text'
import { Locale } from '@common/locale'
import localeEl from './meta/locale.el.json'
import localeEn from './meta/locale.en.json'
import localeEs from './meta/locale.en.json'
import localeIt from './meta/locale.it.json'

/**
 * @slot default - Add `text string` to this slot, **avoid** to add `HTML elements` or `components` here.
 */

export type MdsLabelVariantType = ThemeLabelVariantType | ThemeStatusVariantType

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
   * The label of the component
   */
  @Prop({ reflect: true }) readonly label?: string

  /**
   * Sets the theme variant colors
   */
  @Prop({ reflect: true }) readonly variant: MdsLabelVariantType = 'sky'

  /**
   * Sets the tone of the color variant
   */
  @Prop({ reflect: true }) readonly tone: ToneMinimalVariantType = 'weak'

  /**
   * Truncates text inside the label or displays it in multiline if needed
   */
  @Prop({ reflect: true }) readonly truncate?: TypographyTruncateType = 'word'

  /**
   * Specifies the typography of the element
   */
  @Prop() readonly typography: TypographyTooltipType = 'caption'

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
          { this.label }
        </mds-text>
        { this.deletable && <mds-button class="button-close" icon={miBaselineCancel} onClick={ this.onClickDelete.bind(this) } title={this.t.get('remove')} size="sm"></mds-button> }
      </Host>
    )
  }
}
