import { Component, Host, Element, h, Prop, Watch } from '@stencil/core'
import mggConsumptionLow from '@icon/mgg/consumption-low.svg'
import mggConsumptionMedium from '@icon/mgg/consumption-medium.svg'
import mggConsumptionHigh from '@icon/mgg/consumption-high.svg'
import { Locale } from '@common/locale'
import localeEn from './meta/locale.en.json'
import localeIt from './meta/locale.it.json'
import { ConsumptionModeType } from '@type/preference'

@Component({
  tag: 'mds-pref-consumption',
  styleUrl: 'mds-pref-consumption.css',
  shadow: true,
})
export class MdsPrefContrast {
  @Element() private element: HTMLMdsPrefContrastElement
  private defaultMode: ConsumptionModeType = 'high'
  private t:Locale = new Locale({
    en: localeEn,
    it: localeIt,
  })

  /**
   * Specifies the preference mode
   */
  @Prop({ mutable: true, reflect: true }) mode?: ConsumptionModeType

  private consumption = {
    high: {
      selector: 'pref-consumption-high',
      label: 'consumptionHigh',
    },
    medium: {
      selector: 'pref-consumption-medium',
      label: 'consumptionMedium',
    },
    low: {
      selector: 'pref-consumption-low',
      label: 'consumptionLow',
    },
  }

  componentWillRender (): void {
    this.t.lang(this.element)
  }

  componentDidLoad (): void {
    this.setConsumption(this.mode ?? localStorage.getItem('mds-pref-consumption') as ConsumptionModeType ?? this.defaultMode)
  }

  private setConsumption = (mode: ConsumptionModeType): void => {
    this.mode = mode
    localStorage.setItem('mds-pref-consumption', this.mode)
    if (document) {
      const element = document.querySelector('html')
      for (const key in this.consumption) {
        if ({}.hasOwnProperty.call(this.consumption, key)) {
          element?.classList.remove(this.consumption[key].selector)
        }
      }
      element?.classList.add(this.consumption[this.mode].selector)
      element?.style.setProperty('--magma-pref-consumption', this.mode)
    }
  }

  @Watch('mode')
  modeChanged (newValue: ConsumptionModeType): void {
    this.setConsumption(newValue)
  }

  render () {
    return (
      <Host >
        <mds-text class="info" typography="caption"><b>{this.t.get('label')}</b> {this.t.get(this.consumption[this.mode ?? this.defaultMode].label)}</mds-text>
        <mds-tab>
          <mds-tab-item selected={this.mode === 'low'} onClick={() => { this.setConsumption('low') }} class="item item--low" icon={mggConsumptionLow}></mds-tab-item>
          <mds-tab-item selected={this.mode === 'medium'} onClick={() => { this.setConsumption('medium') }} class="item item--medium" icon={mggConsumptionMedium}></mds-tab-item>
          <mds-tab-item selected={this.mode === 'high'} onClick={() => { this.setConsumption('high') }} class="item item--high" icon={mggConsumptionHigh}></mds-tab-item>
        </mds-tab>
      </Host>
    )
  }
}
