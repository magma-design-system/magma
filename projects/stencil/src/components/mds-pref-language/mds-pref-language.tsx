import { Component, Element, Event, EventEmitter, Host, h, Prop, State, Method } from '@stencil/core'
import { MdsPrefLanguageEventDetail } from '@event/language'
import { MdsPrefChangeEventDetail } from '@event/preference'
import { Locale } from '@common/locale'
import localeEl from './meta/locale.el.json'
import localeEn from './meta/locale.en.json'
import localeEs from './meta/locale.es.json'
import localeIt from './meta/locale.it.json'
import miBaselineKeyboardArrowDown from '@icon/mi/baseline/keyboard-arrow-down.svg'
import miBaselineKeyboardArrowUp from '@icon/mi/baseline/keyboard-arrow-up.svg'

/**
 * @slot default - Add `mds-pref-language-item` element/s.
 */

@Component({
  tag: 'mds-pref-language',
  styleUrl: 'mds-pref-language.css',
  shadow: true,
})
export class MdsPrefLanguage {
  @State() showDropdown: boolean = false
  @Element() element: HTMLMdsPrefLanguageElement
  private readonly localStorageAlias: string = 'mdsPrefLanguage'
  private readonly defaultLanguage: string = 'en'
  private pageLanguage: string | null
  private systemLanguage: string
  private userLanguage: string | null
  private currentSelectedItem: HTMLMdsPrefLanguageItemElement
  private elPreferLanguageItems: NodeListOf<HTMLMdsPrefLanguageItemElement>
  private readonly t: Locale = new Locale({
    el: localeEl,
    en: localeEn,
    es: localeEs,
    it: localeIt,
  })
  @State() language: string
  @Method()
  async updateLang (): Promise<void> {
    this.language = this.t.lang(this.element)
  }


  /**
   * Specifies the language code based on HTML `lang` attribute
   *
   * A string representing the language version as defined in {@link https://datatracker.ietf.org/doc/html/rfc5646 RFC 5646: Tags for Identifying Languages (also known as BCP 47)}.
   *
   * `Examples of valid language codes include "en", "en-US", "fr", "fr-FR", "es-ES", etc.`
   *
   * Supported languages are Italiano, English, Español, ελληνικά
   */
  @Prop({ mutable: true, reflect: true }) set: string = 'auto'

  /**
   * Emits when the component changes the language selected from the click event of the dropdown list item
   */
  @Event({ eventName: 'mdsPrefLanguageChange' }) languageChangeEvent: EventEmitter<MdsPrefLanguageEventDetail>

  /**
   * Emits when the component is triggered
   */
  @Event({ eventName: 'mdsPrefChange' }) prefChangeEvent: EventEmitter<MdsPrefChangeEventDetail>

  componentDidLoad (): void {
    this.checkLanguageSelect()
  }

  componentWillRender (): void {
    this.systemLanguage = this.sanitizeLanguage(navigator.language)
    this.userLanguage = localStorage.getItem(this.localStorageAlias)
    this.pageLanguage = (document.querySelector('html')?.getAttribute('lang')) ?? null
    this.setLanguage(this.set)
    this.t.lang(this.element)
  }

  private readonly toggleDropdown = (): void => {
    this.showDropdown = !this.showDropdown
  }

  private readonly hideLanguageSelectDropdown = (): void => {
    this.showDropdown = false
  }

  private readonly changeLanguageSelectItem = (): void => {
    this.elPreferLanguageItems.forEach(element => {
      element.selected = false
    })
  }

  private readonly checkLanguageSelect = (): void => {
    this.elPreferLanguageItems = this.element.querySelectorAll('mds-pref-language-item')
    this.elPreferLanguageItems.forEach(element => {
      element.addEventListener('mdsPrefLanguageItemSelect', (e: CustomEvent) => {
        this.changeLanguageSelectItem()
        this.currentSelectedItem = e.currentTarget as HTMLMdsPrefLanguageItemElement
        this.currentSelectedItem.selected = true
        this.languageChangeEvent.emit({ language: this.currentSelectedItem.code })
        this.showDropdown = false
        this.setLanguage(e.detail.language)
        this.t.update(document)
      })
    })

    this.elPreferLanguageItems.forEach(element => {
      element.selected = element.code === this.set
    })
  }

  private readonly sanitizeLanguage = (value: string): string => {
    if (value.includes('-')) {
      return value.split('-')[0].toLowerCase()
    }
    return value
  }

  private readonly setLanguage = (set: string): void => {
    if (!/(auto)|^[a-z]{2}(-[A-Z]{2})?$/gm.exec(set)) {
      throw Error(`Language code setted not reconized: ${set}`)
    }
    set === 'auto' ? this.set = this.userLanguage ?? this.pageLanguage ?? this.systemLanguage : this.set = this.sanitizeLanguage(set)

    this.prefChangeEvent.emit({ preference: 'language' })

    localStorage.setItem(this.localStorageAlias, this.set)
    if (document) {
      const element = document.querySelector('html')
      element?.setAttribute('lang', this.set)
    }
  }

  render () {
    return (
      <Host>
        <div class="menu" >
          <mds-text class="info" typography="caption"><b>{ this.t.get('label') }</b></mds-text>
          <mds-tab fill>
            <mds-tab-item selected onClick={this.toggleDropdown} id="mds-pref-language-nav" class="item item--custom-language" icon-position="right" icon={this.showDropdown ? miBaselineKeyboardArrowUp : miBaselineKeyboardArrowDown}>{this.t.get(this.set ?? 'auto')}</mds-tab-item>
          </mds-tab>
        </div>

        <mds-dropdown class="mds-pref-language-dropdown" target="#mds-pref-language-nav" interaction="none" visible={this.showDropdown} onMdsDropdownHide={this.hideLanguageSelectDropdown} autoPlacement>
          <slot></slot>
        </mds-dropdown>
        { this.set !== this.defaultLanguage && <mds-text typography="caption">{ this.t.get('defaultLanguage') }</mds-text> }
      </Host>
    )
  }
}
