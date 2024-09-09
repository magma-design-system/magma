import { Component, Element, Host, h, Prop, State } from '@stencil/core'
import { LanguageType } from '@type/language'

@Component({
  tag: 'mds-pref-language',
  styleUrl: 'mds-pref-language.css',
  shadow: false,
})
export class MdsPrefLanguage {
  @State() showDropdown: boolean = false
  @Element() element: HTMLMdsPrefLanguageElement
  private pageLanguage: LanguageType
  private systemLanguage: LanguageType
  private currentSelectedItem: HTMLMdsPrefLanguageItemElement
  private elPreferLanguageItems: NodeListOf<HTMLMdsPrefLanguageItemElement>

  /**
   * Specifies the preference mode
   */
  @Prop({ mutable: true, reflect: true }) set?: LanguageType = 'auto'

  componentDidLoad (): void {
    this.systemLanguage = this.sanitizeLanguage(navigator.language)
    this.pageLanguage = (document.querySelector('html')?.getAttribute('lang') ?? this.systemLanguage) as LanguageType
    this.setLanguage(this.set ?? this.pageLanguage)
    this.checkLanguageSelect()
  }

  private showLanguageSelectDropdown = (e: CustomEvent): void => {
    if (!e.detail.language) {
      this.showDropdown = true
    }
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
        this.showDropdown = false
        this.setLanguage(e.detail.language)
      })
    })
  }

  private sanitizeLanguage = (value: string): LanguageType => {
    if (value.includes('-')) {
      return value.split('-')[0].toLowerCase() as LanguageType
    }
    return value as LanguageType
  }

  private setLanguage = (set: LanguageType): void => {
    this.set = set
    localStorage.setItem('mds-pref-language', this.set)
    if (document) {
      const element = document.querySelector('html')
      element?.setAttribute('lang', this.set)
    }
  }

  render () {
    return (
      <Host>
        <mds-pref-language-nav id="mds-pref-language-nav" onMdsPrefLanguageNavSelect={this.showLanguageSelectDropdown} set={this.set}></mds-pref-language-nav>
        <mds-dropdown target="#mds-pref-language-nav" interaction="none" visible={this.showDropdown} onMdsDropdownHide={this.hideLanguageSelectDropdown}>
          <slot></slot>
        </mds-dropdown>
      </Host>
    )
  }
}
