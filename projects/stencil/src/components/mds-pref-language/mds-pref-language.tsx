import { Component, Host, h, Prop, State } from '@stencil/core'
import { LanguageType } from '@type/language'

@Component({
  tag: 'mds-pref-language',
  styleUrl: 'mds-pref-language.css',
  shadow: false,
})
export class MdsPrefLanguage {
  @State() showDropdown: boolean = false
  private pageLanguage: LanguageType
  private systemLanguage: LanguageType

  /**
   * Specifies the preference mode
   */
  @Prop({ mutable: true, reflect: true }) set?: LanguageType

  private showLanguageSelectDropdown = (e: CustomEvent): void => {
    console.info(e.detail.language)
    if (!e.detail.language) {
      this.setLanguage('auto')
      this.showDropdown = true
    }
  }

  private hideLanguageSelectDropdown = (): void => {
    this.showDropdown = false
    this.setLanguage('auto')
  }

  componentDidLoad (): void {
    this.systemLanguage = this.sanitizeLanguage(navigator.language)
    this.pageLanguage = (document.querySelector('html')?.getAttribute('lang') ?? this.systemLanguage) as LanguageType
    this.setLanguage(this.set ?? this.pageLanguage)
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
