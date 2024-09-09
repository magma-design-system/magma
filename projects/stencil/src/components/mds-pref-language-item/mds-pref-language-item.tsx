import { Component, Host, Element, Event, EventEmitter, h, Prop } from '@stencil/core'
import { LanguageType } from '@type/language'
import { Locale } from '@common/locale'
import localeDefault from './meta/locale.json'
import localeIt from './meta/locale.it.json'
import localeEn from './meta/locale.en.json'
import miBaselineCheckCircle from '@icon/mi/baseline/check-circle.svg'
import miOutlineCircle from '@icon/mi/outline/circle.svg'
import { MdsPrefLanguageNavEventDetail } from '@event/language'

@Component({
  tag: 'mds-pref-language-item',
  styleUrl: 'mds-pref-language-item.css',
  shadow: true,
})
export class MdsPrefLanguageItem {
  @Element() private element: HTMLMdsPrefLanguageItemElement
  private t:Locale = new Locale({
    en: localeEn,
    it: localeIt,
  })

  /**
   * Specifies the language code
   */
  @Prop({ reflect: true }) readonly code?: LanguageType

  /**
   * Specifies if the element is selected
   */
  @Prop({ reflect: true }) readonly selected?: boolean = false

  /**
   * Emits when the component trigger the language
   */
  @Event({ eventName: 'mdsPrefLanguageItemSelect' }) selectLanguageEvent: EventEmitter<MdsPrefLanguageNavEventDetail>

  componentWillRender (): void {
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
