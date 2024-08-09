import { Component, Host, Element, h } from '@stencil/core'
import miBaselineLightMode from '@icon/mi/baseline/light-mode.svg'
import miBaselineDarkMode from '@icon/mi/baseline/dark-mode.svg'
import miBaselineSettings from '@icon/mi/baseline/settings.svg'
import { Locale } from '@common/locale'
import jsonEnData from './meta/i18n.en.json'
import jsonItData from './meta/i18n.it.json'

const configData = {
  en: jsonEnData,
  it: jsonItData,
}

@Component({
  tag: 'mds-pref-theme',
  styleUrl: 'mds-pref-theme.css',
  shadow: true,
})
export class MdsPrefTheme {
  @Element() private element: HTMLMdsPrefThemeElement
  private t:Locale = new Locale(configData)

  componentWillRender (): void {
    this.t.lang(this.element)
  }

  render () {
    return (
      <Host>
        <mds-text class="info" typography="detail"><b>{this.t.get('label')}</b> {this.t.get('systemSettings')}</mds-text>
        <mds-tab>
          <mds-tab-item class="item item--light-mode" icon={miBaselineLightMode}></mds-tab-item>
          <mds-tab-item class="item item--system-settings" icon={miBaselineSettings}></mds-tab-item>
          <mds-tab-item class="item item--dark-mode" icon={miBaselineDarkMode}></mds-tab-item>
        </mds-tab>
      </Host>
    )
  }
}
