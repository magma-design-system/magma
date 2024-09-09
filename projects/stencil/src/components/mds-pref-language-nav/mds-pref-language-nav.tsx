import { Component, Host, h, Element, Event, EventEmitter, Prop } from '@stencil/core'
// import miBaselineSettings from '@icon/mi/baseline/settings.svg'
import miBaselineTranslate from '@icon/mi/baseline/translate.svg'
import miBaselineWysiwyg from '@icon/mi/baseline/wysiwyg.svg'
import { LanguageType } from '@type/language'
import { Locale } from '@common/locale'
import localeEn from './meta/locale.en.json'
import localeIt from './meta/locale.it.json'
import { MdsPrefLanguageNavEventDetail } from '@event/language'

/*
default
html
user (os fallback)
os
*/

@Component({
  tag: 'mds-pref-language-nav',
  styleUrl: 'mds-pref-language-nav.css',
  shadow: true,
})
export class MdsPrefLanguageNav {
  @Element() private element: HTMLMdsPrefLanguageNavElement
  private t:Locale = new Locale({
    en: localeEn,
    it: localeIt,
  })

  /**
   * Specifies the preference mode
   */
  @Prop({ mutable: true, reflect: true }) set?: LanguageType

  /**
   * Emits when the component trigger the language selector dropdown
   */
  @Event({ eventName: 'mdsPrefLanguageNavSelect' }) selectLanguageEvent: EventEmitter<MdsPrefLanguageNavEventDetail>

  componentWillRender (): void {
    this.t.lang(this.element)
  }

  private setAutoLanguage = (): void => {
    this.selectLanguageEvent.emit({ language: 'auto' })
  }

  private selectLanguage = (): void => {
    this.selectLanguageEvent.emit({ language: undefined })
  }

  render () {
    return (
      <Host>
        <mds-text class="info" typography="caption"><b>{this.t.get('label')}</b> {this.t.get(this.set ?? 'auto')}</mds-text>
        <mds-tab>
          <mds-tab-item selected={this.set !== 'auto'} onClick={() => { this.selectLanguage() }} class="item item--custom-language" icon={miBaselineTranslate}></mds-tab-item>
          <mds-tab-item selected={this.set === 'auto'} onClick={() => { this.setAutoLanguage() }} class="item item--auto" icon={miBaselineWysiwyg}></mds-tab-item>
        </mds-tab>
      </Host>
    )
  }
}
