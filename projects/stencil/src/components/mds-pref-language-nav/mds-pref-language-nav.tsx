import { Component, Host, h, Element, Event, EventEmitter, Prop, State } from '@stencil/core'
import miBaselineKeyboardArrowDown from '@icon/mi/baseline/keyboard-arrow-down.svg'
import miBaselineKeyboardArrowUp from '@icon/mi/baseline/keyboard-arrow-up.svg'
import { LanguageType } from '@type/language'
import { Locale } from '@common/locale'
import localeEl from './meta/locale.el.json'
import localeEn from './meta/locale.en.json'
import localeEs from './meta/locale.es.json'
import localeIt from './meta/locale.it.json'
import { MdsPrefLanguageEventDetail } from '@event/language'

@Component({
  tag: 'mds-pref-language-nav',
  styleUrl: 'mds-pref-language-nav.css',
  shadow: true,
})
export class MdsPrefLanguageNav {
  @Element() private element: HTMLMdsPrefLanguageNavElement
  @State() isOpened: boolean = false
  private t:Locale = new Locale({
    el: localeEl,
    en: localeEn,
    es: localeEs,
    it: localeIt,
  })

  /**
   * Specifies the language code based on HTML `lang` attribute
   */
  @Prop({ mutable: true, reflect: true }) set?: LanguageType

  /**
   * Specifies if the element is active or not
   */
  @Prop({ mutable: true, reflect: true }) active: boolean = false

  /**
   * Emits when the component trigger the language selector dropdown
   */
  @Event({ eventName: 'mdsPrefLanguageNavSelect' }) selectLanguageEvent: EventEmitter<MdsPrefLanguageEventDetail>

  componentWillRender (): void {
    this.t.lang(this.element)
  }

  private selectLanguage = (): void => {
    this.selectLanguageEvent.emit({ language: undefined })
  }

  render () {
    return (
      <Host>
        <div class="menu">
          <mds-text class="info" typography="caption"><b>{ this.t.get('label') }</b></mds-text>
          <mds-tab>
            <mds-tab-item selected onClick={this.selectLanguage} class="item item--custom-language" icon-position="right" icon={this.active ? miBaselineKeyboardArrowUp : miBaselineKeyboardArrowDown}>{this.t.get(this.set ?? 'auto')}</mds-tab-item>
          </mds-tab>
        </div>
      </Host>
    )
  }
}
