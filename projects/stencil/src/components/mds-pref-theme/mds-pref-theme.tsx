import { Component, Host, Element, h, State } from '@stencil/core'
import miBaselineLightMode from '@icon/mi/baseline/light-mode.svg'
import miBaselineDarkMode from '@icon/mi/baseline/dark-mode.svg'
import miBaselineSettings from '@icon/mi/baseline/settings.svg'
import { Locale } from '@common/locale'
import localeEn from './meta/locale.en.json'
import localeIt from './meta/locale.it.json'
import { ThemeModeType } from './meta/types'



@Component({
  tag: 'mds-pref-theme',
  styleUrl: 'mds-pref-theme.css',
  shadow: true,
})
export class MdsPrefTheme {
  @Element() private element: HTMLMdsPrefThemeElement
  @State() themeMode: ThemeModeType
  private defaultMode: ThemeModeType = 'system'
  private t:Locale = new Locale({
    en: localeEn,
    it: localeIt,
  })

  // related selectors for @magma-design-system/styles
  // projects/design-tokens/formats/css-vars-rgb/template.hbs
  // projects/design-tokens/formats/css-vars-hex/template.hbs

  private theme = {
    dark: {
      selector: 'pref-theme-dark',
      label: 'darkMode',
    },
    system: {
      selector: 'pref-theme-system',
      label: 'systemSettings',
    },
    light: {
      selector: 'pref-theme-light',
      label: 'lightMode',
    },
  }

  componentWillRender (): void {
    this.t.lang(this.element)
  }

  componentDidLoad (): void {
    this.setTheme(localStorage.getItem('mds-pref-theme') as ThemeModeType ?? this.defaultMode)
  }

  private setTheme = (mode: ThemeModeType): void => {
    localStorage.setItem('mds-pref-theme', mode)
    this.themeMode = mode
    if (document) {
      for (const key in this.theme) {
        if ({}.hasOwnProperty.call(this.theme, key)) {
          document.querySelector('html')?.classList.remove(this.theme[key].selector)
        }
      }
      document.querySelector('html')?.classList.add(this.theme[mode].selector)
    }
  }

  render () {
    return (
      <Host >
        <mds-text class="info" typography="caption"><b>{this.t.get('label')}</b> {this.t.get(this.theme[this.themeMode ?? this.defaultMode].label)}</mds-text>
        <mds-tab>
          <mds-tab-item onClick={() => { this.setTheme('light') }} class="item item--light" icon={miBaselineLightMode}></mds-tab-item>
          <mds-tab-item onClick={() => { this.setTheme('system') }} class="item item--system" icon={miBaselineSettings}></mds-tab-item>
          <mds-tab-item onClick={() => { this.setTheme('dark') }} class="item item--dark" icon={miBaselineDarkMode}></mds-tab-item>
        </mds-tab>
      </Host>
    )
  }
}
