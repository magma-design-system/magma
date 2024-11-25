import { Component, Host, Element, Event, EventEmitter, h, Prop, Method, State } from '@stencil/core'
import { Locale } from '@common/locale'
import localeDefault from './meta/locale.json'
import localeIt from './meta/locale.it.json'
import localeEn from './meta/locale.en.json'
import miBaselineCheckCircle from '@icon/mi/baseline/check-circle.svg'
import miOutlineCircle from '@icon/mi/outline/circle.svg'
import { MdsPrefLanguageEventDetail } from '@event/language'

@Component({
  tag: 'mds-pref-language-item',
  styleUrl: 'mds-pref-language-item.css',
  shadow: true,
})
export class MdsPrefLanguageItem {
  @Element() private element: HTMLMdsPrefLanguageItemElement
  private readonly t: Locale = new Locale({
    en: localeEn,
    it: localeIt,
  })
  @State() language: string
  @Method()
  async updateLang (): Promise<void> {
    this.language = this.t.lang(this.element)
  }

  /**
   * Specifies the language code based on HTML `lang` attribute
   */
  @Prop({ reflect: true }) readonly code: string

  /**
   * Specifies if the element is selected
   */
  @Prop({ reflect: true }) readonly selected?: boolean = false

  /**
   * Emits when the component trigger the language
   */
  @Event({ eventName: 'mdsPrefLanguageItemSelect' }) selectLanguageEvent: EventEmitter<MdsPrefLanguageEventDetail>

  componentWillRender (): void {
    if (!localeDefault[this.code]) {
      throw Error(`Language code not found: ${this.code}`)
    }
    this.t.lang(this.element)
  }

  private handleClick = (): void => {
    this.selectLanguageEvent.emit({ language: this.code })
  }

  render () {
    return (
      <Host onClick={this.handleClick}>
        { this.code
          ? <mds-button icon={this.selected ? miBaselineCheckCircle : miOutlineCircle} variant="dark" tone="quiet">
            { localeDefault[this.code] }
          </mds-button>
          : <mds-button icon={miBaselineCheckCircle} variant="error" tone="quiet">
            { this.t.get('noCode') }
          </mds-button>
        }
      </Host>
    )
  }
}
