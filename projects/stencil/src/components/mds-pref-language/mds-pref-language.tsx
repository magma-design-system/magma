import { Component, Element, Event, EventEmitter, Host, h, Prop, State } from '@stencil/core'
import { PrefLanguageType } from '@type/language'
import { MdsPrefLanguageEventDetail } from '@event/language'
import { MdsPrefChangeEventDetail } from '@event/preference'
import { Locale } from '@common/locale'
import localeEl from './meta/locale.el.json'
import localeEn from './meta/locale.en.json'
import localeEs from './meta/locale.es.json'
import localeIt from './meta/locale.it.json'

/**
 * @slot default - Add `mds-pref-language-item` element/s.
 */

@Component({
  tag: 'mds-pref-language',
  styleUrl: 'mds-pref-language.css',
  shadow: false,
})
export class MdsPrefLanguage {
  @State() showDropdown: boolean = false
  @Element() element: HTMLMdsPrefLanguageElement
  private defaultLanguage: PrefLanguageType = 'en'
  private pageLanguage: PrefLanguageType
  private systemLanguage: PrefLanguageType
  private userLanguage: PrefLanguageType
  private currentSelectedItem: HTMLMdsPrefLanguageItemElement
  private elPreferLanguageItems: NodeListOf<HTMLMdsPrefLanguageItemElement>
  private t:Locale = new Locale({
    el: localeEl,
    en: localeEn,
    es: localeEs,
    it: localeIt,
  })
  /**

  /**
   * Specifies the language code based on HTML `lang` attribute
   */
  @Prop({ mutable: true, reflect: true }) set: PrefLanguageType = 'auto'

  /**
   * Emits when the component changes the language selected from the click event of the dropdown list item
   */
  @Event({ eventName: 'mdsPrefLanguageChange' }) languageChangeEvent: EventEmitter<MdsPrefLanguageEventDetail>

  /**
   * Emits when the component is triggered
   */
  @Event({ eventName: 'mdsPrefChange' }) prefChangeEvent: EventEmitter<MdsPrefChangeEventDetail>

  componentDidLoad (): void {
    this.systemLanguage = this.sanitizeLanguage(navigator.language)
    this.userLanguage = localStorage.getItem('mds-pref-language') as PrefLanguageType
    this.pageLanguage = (document.querySelector('html')?.getAttribute('lang')) as PrefLanguageType
    this.setLanguage(this.set)
    this.checkLanguageSelect()
  }

  componentWillRender (): void {
    this.t.lang(this.element)
  }

  private showLanguageSelectDropdown = (): void => {
    this.showDropdown = !this.showDropdown
  }

  private hideLanguageSelectDropdown = (): void => {
    this.showDropdown = false
  }

  private changeLanguageSelectItem = (): void => {
    this.elPreferLanguageItems.forEach(element => {
      element.selected = false
    })
  }

  private checkLanguageSelect = (): void => {
    this.elPreferLanguageItems = this.element.querySelectorAll('mds-pref-language-item')
    this.elPreferLanguageItems.forEach(element => {
      element.addEventListener('mdsPrefLanguageItemSelect', (e: CustomEvent) => {
        this.changeLanguageSelectItem()
        this.currentSelectedItem = e.currentTarget as HTMLMdsPrefLanguageItemElement
        this.currentSelectedItem.selected = true
        this.languageChangeEvent.emit({ language: this.currentSelectedItem.code })
        this.showDropdown = false
        this.setLanguage(e.detail.language)
      })
    })

    this.elPreferLanguageItems.forEach(element => {
      element.selected = element.code === this.set
    })
  }

  private sanitizeLanguage = (value: string): PrefLanguageType => {
    if (value.includes('-')) {
      return value.split('-')[0].toLowerCase() as PrefLanguageType
    }
    return value as PrefLanguageType
  }

  private setLanguage = (set: PrefLanguageType): void => {
    set === 'auto' ? this.set = this.userLanguage ?? this.pageLanguage ?? this.systemLanguage : this.set = set

    this.prefChangeEvent.emit({ preference: 'language' })

    localStorage.setItem('mds-pref-language', this.set)
    if (document) {
      const element = document.querySelector('html')
      element?.setAttribute('lang', this.set)
    }
  }

  render () {
    return (
      <Host>
        <mds-pref-language-nav active={this.showDropdown} id="mds-pref-language-nav" onMdsPrefLanguageNavSelect={this.showLanguageSelectDropdown} set={this.set}></mds-pref-language-nav>
        <mds-dropdown class="mds-pref-language-dropdown" target="#mds-pref-language-nav" interaction="none" visible={this.showDropdown} onMdsDropdownHide={this.hideLanguageSelectDropdown}>
          <slot></slot>
        </mds-dropdown>
        { this.set !== this.defaultLanguage && <mds-text typography="caption">{ this.t.get('defaultLanguage') }</mds-text> }
      </Host>
    )
  }
}
