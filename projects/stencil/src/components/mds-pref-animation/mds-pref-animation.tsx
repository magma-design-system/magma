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
    reduce: {
      selector: 'pref-animation-reduce',
      label: 'animationDisabled',
    },
    system: {
      selector: 'pref-animation-system',
      label: 'systemSettings',
    },
    'no-preference': {
      selector: 'pref-animation-no-preference',
      label: 'animationEnabled',
    },
  }

  componentWillRender (): void {
    this.t.lang(this.element)
  }

  componentDidLoad (): void {
    this.setAnimation(this.mode ?? localStorage.getItem('mds-pref-animation') as AnimationModeType ?? this.defaultMode)
  }

  private setAnimation = (mode: AnimationModeType): void => {
    this.mode = mode
    localStorage.setItem('mds-pref-animation', this.mode)
    if (document) {
      const element = document.querySelector('html')

      for (const key in this.animation) {
        if ({}.hasOwnProperty.call(this.animation, key)) {
          element?.classList.remove(this.animation[key].selector)
        }
      }
      element?.classList.add(this.animation[this.mode].selector)
      element?.style.setProperty('--magma-pref-animation', this.mode)
    }
  }

  @Watch('mode')
  modeChanged (newValue: AnimationModeType): void {
    this.setAnimation(newValue)
  }

  render () {
    return (
      <Host >
        <mds-text class="info" typography="caption"><b>{this.t.get('label')}</b> {this.t.get(this.animation[this.mode ?? this.defaultMode].label)}</mds-text>
        <mds-tab>
          <mds-tab-item selected={this.mode === 'reduce'} onClick={() => { this.setAnimation('reduce') }} class="item item--reduce" icon={miOutlineCircle}></mds-tab-item>
          <mds-tab-item selected={this.mode === 'system'} onClick={() => { this.setAnimation('system') }} class="item item--system" icon={miBaselineSettings}></mds-tab-item>
          <mds-tab-item selected={this.mode === 'no-preference'} onClick={() => { this.setAnimation('no-preference') }} class="item item--no-preference" icon={miBaselineAnimation}></mds-tab-item>
        </mds-tab>
      </Host>
    )
  }
}
