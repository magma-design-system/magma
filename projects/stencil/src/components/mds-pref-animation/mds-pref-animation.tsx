import { Component, Host, Element, h, Prop, Watch } from '@stencil/core'
import miOutlineCircle from '@icon/mi/outline/circle.svg'
import miBaselineAnimation from '@icon/mi/baseline/animation.svg'
import miBaselineSettings from '@icon/mi/baseline/settings.svg'
import { Locale } from '@common/locale'
import localeEn from './meta/locale.en.json'
import localeIt from './meta/locale.it.json'
import { AnimationModeType } from './meta/types'

@Component({
  tag: 'mds-pref-animation',
  styleUrl: 'mds-pref-animation.css',
  shadow: true,
})
export class MdsPrefAnimation {
  @Element() private element: HTMLMdsPrefAnimationElement
  private defaultMode: AnimationModeType = 'system'
  private t:Locale = new Locale({
    en: localeEn,
    it: localeIt,
  })

  /**
   * Specifies the preference mode
   */
  @Prop({ mutable: true, reflect: true }) mode?: AnimationModeType

  private animation = {
    enabled: {
      selector: 'pref-animation-enabled',
      label: 'animationEnabled',
    },
    system: {
      selector: 'pref-animation-system',
      label: 'systemSettings',
    },
    disabled: {
      selector: 'pref-animation-disabled',
      label: 'animationDisabled',
    },
  }

  componentWillRender (): void {
    this.t.lang(this.element)
  }

  componentDidLoad (): void {
    this.setTheme(this.mode ?? localStorage.getItem('mds-pref-animation') as AnimationModeType ?? this.defaultMode)
  }

  private setTheme = (mode: AnimationModeType): void => {
    localStorage.setItem('mds-pref-animation', mode)
    this.mode = mode
    if (document) {
      for (const key in this.animation) {
        if ({}.hasOwnProperty.call(this.animation, key)) {
          document.querySelector('html')?.classList.remove(this.animation[key].selector)
        }
      }
      document.querySelector('html')?.classList.add(this.animation[mode].selector)
    }
  }

  @Watch('mode')
  modeChanged (newValue: AnimationModeType): void {
    this.setTheme(newValue)
  }

  render () {
    return (
      <Host >
        <mds-text class="info" typography="caption"><b>{this.t.get('label')}</b> {this.t.get(this.animation[this.mode ?? this.defaultMode].label)}</mds-text>
        <mds-tab>
          <mds-tab-item selected={this.mode === 'disabled'} onClick={() => { this.setTheme('disabled') }} class="item item--disabled" icon={miOutlineCircle}></mds-tab-item>
          <mds-tab-item selected={this.mode === 'system'} onClick={() => { this.setTheme('system') }} class="item item--system" icon={miBaselineSettings}></mds-tab-item>
          <mds-tab-item selected={this.mode === 'enabled'} onClick={() => { this.setTheme('enabled') }} class="item item--enabled" icon={miBaselineAnimation}></mds-tab-item>
        </mds-tab>
      </Host>
    )
  }
}
