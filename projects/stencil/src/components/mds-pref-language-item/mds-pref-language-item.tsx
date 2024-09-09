import { Component, Host, Element, h, Prop } from '@stencil/core'
import { LanguageType } from '@type/language'
import { Locale } from '@common/locale'
import localeDefault from './meta/locale.json'
import localeIt from './meta/locale.it.json'
import localeEn from './meta/locale.en.json'

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

  @Prop({ reflect: true }) readonly code?: LanguageType

  componentWillRender (): void {
    this.t.lang(this.element)
  }

  render () {
    return (
      <Host>
        { this.code
          ? <mds-entity initials={this.code}>
            <mds-text aria-label={ localeDefault[this.code] } truncate="word" typography="h6">
              { localeDefault[this.code] }
            </mds-text>
          </mds-entity>
          : <mds-entity initials="xx">
            <mds-text aria-label={ this.t.get('noCode') } truncate="word" typography="h6">
              { this.t.get('noCode') }
            </mds-text>
          </mds-entity>
        }
      </Host>
    )
  }
}
