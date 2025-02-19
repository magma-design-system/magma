import { Component, Host, Element, Event, EventEmitter, h, Prop, Watch, Method, State } from '@stencil/core'
import miBaselineContrast from '@icon/mi/baseline/contrast.svg'
import miOutlineAutoAwesome from '@icon/mi/outline/auto-awesome.svg'
import miBaselineAutoAwesome from '@icon/mi/baseline/auto-awesome.svg'
import miBaselineSettings from '@icon/mi/baseline/settings.svg'
import { Locale } from '@common/locale'
import localeEl from './meta/locale.el.json'
import localeEn from './meta/locale.en.json'
import localeEs from './meta/locale.es.json'
import localeIt from './meta/locale.it.json'
import { ContrastModeType } from './meta/types'
import { MdsPrefChangeEventDetail } from '@event/preference'

@Component({
  tag: 'mds-pref-contrast',
  styleUrl: 'mds-pref-contrast.css',
  shadow: true,
})
export class MdsPrefContrast {
  @Element() private element: HTMLMdsPrefContrastElement
  private readonly localStorageAlias: string = 'mdsPrefContrast'
  private readonly customPropertyAlias: string = '--magma-pref-contrast'
  private readonly defaultMode: ContrastModeType = 'system'
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

  private readonly prefersDefaults = {
    custom: 'no-preference',
    less: 'no-preference',
    more: 'more',
    'no-preference': 'no-preference',
  }

  /**
   * Specifies the preference mode
   */
  @Prop({ mutable: true, reflect: true }) mode?: ContrastModeType

  /**
   * Emits when the component is triggered
   */
  @Event({ eventName: 'mdsPrefChange' }) prefChangeEvent: EventEmitter<MdsPrefChangeEventDetail>

  private readonly contrast = {
    more: {
      selector: 'pref-contrast-more',
      label: 'contrastMore',
    },
    system: {
      selector: 'pref-contrast-system',
      label: 'systemSettings',
    },
    'no-preference': {
      selector: 'pref-contrast-no-preference',
      label: 'contrastDefault',
    },
  }

  componentWillRender (): void {
    this.t.lang(this.element)
    this.setContrast(this.mode ?? localStorage.getItem(this.localStorageAlias) as ContrastModeType ?? this.defaultMode)
  }

  private readonly rollbackContrast = (): ContrastModeType => {
    if (!window) {
      return this.defaultMode
    }

    for (const key in this.prefersDefaults) {
      if ({}.hasOwnProperty.call(this.prefersDefaults, key)) {
        if (window.matchMedia(`(prefers-contrast: ${key})`).matches) {
          return this.prefersDefaults[key]
        }
      }
    }

    throw Error('No prefers-contrast value found.')
  }

  private readonly setContrast = (mode: ContrastModeType): void => {
    this.prefChangeEvent.emit({ preference: 'contrast' })
    this.rollbackContrast()
    this.mode = mode
    localStorage.setItem(this.localStorageAlias, this.mode)
    if (document) {
      const element = document.querySelector('html')
      for (const key in this.contrast) {
        if ({}.hasOwnProperty.call(this.contrast, key)) {
          element?.classList.remove(this.contrast[key].selector)
        }
      }
      element?.classList.add(this.contrast[mode].selector)
      element?.style.setProperty(this.customPropertyAlias, this.mode)
    }
  }

  @Watch('mode')
  modeChanged (newValue: ContrastModeType, oldValue: ContrastModeType): void {
    if (newValue !== oldValue) {
      this.setContrast(newValue)
    }
  }

  render () {
    return (
      <Host>
        <mds-text class="info" typography="caption"><b>{this.t.get('label')}</b> {this.t.get(this.contrast[this.mode ?? this.defaultMode].label)}</mds-text>
        <mds-tab fill>
          <mds-tab-item selected={this.mode === 'more'} onClick={() => { this.setContrast('more') }} class="item item--more" icon={miBaselineContrast}></mds-tab-item>
          <mds-tab-item selected={this.mode === 'system'} onClick={() => { this.setContrast('system') }} class="item item--system" icon={miBaselineSettings}></mds-tab-item>
          <mds-tab-item selected={this.mode === 'no-preference'} onClick={() => { this.setContrast('no-preference') }} class="item item--default" icon={this.mode === 'no-preference' ? miBaselineAutoAwesome : miOutlineAutoAwesome}></mds-tab-item>
          {/* <mds-tab-item selected={this.mode === 'sensor'} onClick={() => { this.setContrast('sensor') }} class="item item--sensor" icon={this.mode === 'sensor' ? miBaselineAutoAwesome : miOutlineAutoAwesome}></mds-tab-item> */}
        </mds-tab>
      </Host>
    )
  }
}
