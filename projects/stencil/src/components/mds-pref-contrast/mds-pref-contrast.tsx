import { Component, Host, Element, h, Prop, Watch } from '@stencil/core'
import miBaselineContrast from '@icon/mi/baseline/contrast.svg'
import miOutlineAutoAwesome from '@icon/mi/outline/auto-awesome.svg'
import miBaselineAutoAwesome from '@icon/mi/baseline/auto-awesome.svg'
import miBaselineSettings from '@icon/mi/baseline/settings.svg'
import { Locale } from '@common/locale'
import localeEn from './meta/locale.en.json'
import localeIt from './meta/locale.it.json'
import { ContrastModeType } from './meta/types'

@Component({
  tag: 'mds-pref-contrast',
  styleUrl: 'mds-pref-contrast.css',
  shadow: true,
})
export class MdsPrefContrast {
  @Element() private element: HTMLMdsPrefContrastElement
  private defaultMode: ContrastModeType = 'system'
  private t:Locale = new Locale({
    en: localeEn,
    it: localeIt,
  })

  /**
   * Specifies the preference mode
   */
  @Prop({ mutable: true, reflect: true }) mode?: ContrastModeType

  private contrast = {
    high: {
      selector: 'pref-contrast-high',
      label: 'contrastHigh',
    },
    system: {
      selector: 'pref-contrast-system',
      label: 'systemSettings',
    },
    default: {
      selector: 'pref-contrast-default',
      label: 'contrastDefault',
    },
  }

  componentWillRender (): void {
    this.t.lang(this.element)
  }

  componentDidLoad (): void {
    this.setContrast(this.mode ?? localStorage.getItem('mds-pref-contrast') as ContrastModeType ?? this.defaultMode)
  }

  private setContrast = (mode: ContrastModeType): void => {
    localStorage.setItem('mds-pref-contrast', mode)
    this.mode = mode
    if (document) {
      for (const key in this.contrast) {
        if ({}.hasOwnProperty.call(this.contrast, key)) {
          document.querySelector('html')?.classList.remove(this.contrast[key].selector)
        }
      }
      document.querySelector('html')?.classList.add(this.contrast[mode].selector)
    }
  }

  @Watch('mode')
  modeChanged (newValue: ContrastModeType): void {
    this.setContrast(newValue)
  }

  render () {
    return (
      <Host >
        <mds-text class="info" typography="caption"><b>{this.t.get('label')}</b> {this.t.get(this.contrast[this.mode ?? this.defaultMode].label)}</mds-text>
        <mds-tab>
          <mds-tab-item selected={this.mode === 'high'} onClick={() => { this.setContrast('high') }} class="item item--high" icon={miBaselineContrast}></mds-tab-item>
          <mds-tab-item selected={this.mode === 'system'} onClick={() => { this.setContrast('system') }} class="item item--system" icon={miBaselineSettings}></mds-tab-item>
          <mds-tab-item selected={this.mode === 'default'} onClick={() => { this.setContrast('default') }} class="item item--default" icon={this.mode === 'default' ? miBaselineAutoAwesome : miOutlineAutoAwesome}></mds-tab-item>
        </mds-tab>
      </Host>
    )
  }
}
