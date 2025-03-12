import { Component, Host, Element, Event, EventEmitter, h, Prop, Watch, Method, State } from '@stencil/core'
import { MdsPrefChangeEventDetail } from '@event/preference'
import mggConsumptionLow from '@icon/mgg/consumption-low.svg'
import mggConsumptionMedium from '@icon/mgg/consumption-medium.svg'
import mggConsumptionHigh from '@icon/mgg/consumption-high.svg'
import { Locale } from '@common/locale'
import localeEl from './meta/locale.el.json'
import localeEn from './meta/locale.en.json'
import localeEs from './meta/locale.es.json'
import localeIt from './meta/locale.it.json'
import { ConsumptionModeType } from '@type/preference'

@Component({
  tag: 'mds-pref-consumption',
  styleUrl: 'mds-pref-consumption.css',
  shadow: true,
})
export class MdsPrefContrast {
  @Element() private element: HTMLMdsPrefContrastElement
  private readonly localStorageAlias: string = 'mdsPrefConsumption'
  private readonly customPropertyAlias: string = '--magma-pref-consumption'
  private readonly defaultMode: ConsumptionModeType = 'high'
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
   * Specifies the preference mode
   */
  @Prop({ mutable: true, reflect: true }) mode?: ConsumptionModeType

  /**
   * Emits when the component is triggered
   */
  @Event({ eventName: 'mdsPrefChange' }) prefChangeEvent: EventEmitter<MdsPrefChangeEventDetail>

  private readonly consumption = {
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
    this.setConsumption(this.mode ?? localStorage.getItem(this.localStorageAlias) as ConsumptionModeType ?? this.defaultMode)
  }

  private readonly setConsumption = (mode: ConsumptionModeType): void => {
    this.prefChangeEvent.emit({ preference: 'consumption' })
    this.mode = mode
    localStorage.setItem(this.localStorageAlias, this.mode)
    if (document) {
      const element = document.querySelector('html')
      for (const key in this.consumption) {
        if ({}.hasOwnProperty.call(this.consumption, key)) {
          element?.classList.remove(this.consumption[key].selector)
        }
      }
      element?.classList.add(this.consumption[this.mode].selector)
      element?.style.setProperty(this.customPropertyAlias, this.mode)
    }
  }

  @Watch('mode')
  modeChanged (newValue: ConsumptionModeType): void {
    this.setConsumption(newValue)
  }

  render () {
    return (
      <Host>
        <mds-text class="info" typography="caption"><b>{this.t.get('label')}</b> {this.t.get(this.consumption[this.mode ?? this.defaultMode].label)}</mds-text>
        <mds-tab fill>
          <mds-tab-item selected={this.mode === 'low'} onClick={() => { this.setConsumption('low') }} class="item item--low" icon={mggConsumptionLow}></mds-tab-item>
          <mds-tab-item selected={this.mode === 'medium'} onClick={() => { this.setConsumption('medium') }} class="item item--medium" icon={mggConsumptionMedium}></mds-tab-item>
          <mds-tab-item selected={this.mode === 'high'} onClick={() => { this.setConsumption('high') }} class="item item--high" icon={mggConsumptionHigh}></mds-tab-item>
        </mds-tab>
      </Host>
    )
  }
}
