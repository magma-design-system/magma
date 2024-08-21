import { Component, Host, Element, h, Prop, Watch } from '@stencil/core'
import { cssDurationToMilliseconds } from '@common/unit'
import miBaselineLightMode from '@icon/mi/baseline/light-mode.svg'
import miOutlineDarkMode from '@icon/mi/outline/dark-mode.svg'
import miBaselineDarkMode from '@icon/mi/baseline/dark-mode.svg'
import miBaselineSettings from '@icon/mi/baseline/settings.svg'
import { Locale } from '@common/locale'
import localeEn from './meta/locale.en.json'
import localeIt from './meta/locale.it.json'
import { ThemeModeType, ThemeTransitionType } from './meta/types'

@Component({
  tag: 'mds-pref-theme',
  styleUrl: 'mds-pref-theme.css',
  shadow: true,
})
export class MdsPrefTheme {
  @Element() private element: HTMLMdsPrefThemeElement
  private defaultMode: ThemeModeType = 'system'
  private t:Locale = new Locale({
    en: localeEn,
    it: localeIt,
  })

  private overlayBackgroundVisible = 'rgb(var(--tone-neutral))'
  private overlayBackgroundHidden = 'rgb(var(--tone-neutral) / 0.5)'
  private cssOverlayShowDuration: string = '300'
  private cssOverlayFadeoutDuration: string = '200'
  private cssOverlayZIndex: string = '10000'
  private overlayEl: HTMLElement
  private overlayId = 'mds-pref-theme-overlay'
  private overlayTimer: NodeJS.Timeout
  // private overlayShowTimer: NodeJS.Timeout
  private prevMode?: ThemeModeType = 'system'

  private updateCSSCustomProps = (): void => {
    const elementStyles = window.getComputedStyle(this.element)
    this.cssOverlayShowDuration = elementStyles.getPropertyValue('--mds-pref-theme-overlay-show-duration')
    this.cssOverlayFadeoutDuration = elementStyles.getPropertyValue('--mds-pref-theme-overlay-fadeout-duration')
    this.cssOverlayZIndex = elementStyles.getPropertyValue('--mds-pref-theme-overlay-z-index')
  }

  
  /**
   * Specifies the preference mode
   */
  @Prop({ mutable: true, reflect: true }) mode?: ThemeModeType

  /**
   * Specifies the preference mode
   */
  @Prop({ mutable: true, reflect: true }) transition: ThemeTransitionType = 'flash'

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
    this.updateCSSCustomProps()
    this.setTheme(this.mode ?? localStorage.getItem('mds-pref-theme') as ThemeModeType ?? this.defaultMode)
  }

  private isDarkMode = (): boolean => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  private getColorScheme = (): ThemeModeType => {
    if (this.mode === 'system') {
      if (this.isDarkMode()) {
        return 'dark'
      }
      return 'light'
    }

    return this.mode as ThemeModeType
  }

  private attachOverlayTransition = (): void => {
    const colorScheme = this.getColorScheme()
    if (this.prevMode === colorScheme) {
      return
    }
    this.prevMode = colorScheme

    if (!this.overlayEl) {
      this.overlayEl = document.createElement('div')
      this.overlayEl.className = this.overlayId
      this.overlayEl.style.inset = '0'
      this.overlayEl.style.pointerEvents = 'none'
      this.overlayEl.style.position = 'fixed'
      this.overlayEl.style.backgroundColor = 'transparent'
      this.overlayEl.style.transition = `background-color ${this.cssOverlayFadeoutDuration} ease-out`
      this.overlayEl.style.zIndex = this.cssOverlayZIndex
    }

    this.overlayEl.style.backgroundColor = this.overlayBackgroundVisible
    document.body.appendChild(this.overlayEl)

    clearTimeout(this.overlayTimer)
    this.overlayTimer = setTimeout(() => {
      this.detachOverlayTransition()
    }, cssDurationToMilliseconds(this.cssOverlayShowDuration))
  }

  private detachOverlayTransition (): void {
    if (!this.overlayEl) {
      return
    }
    this.overlayEl.style.backgroundColor = this.overlayBackgroundHidden
    clearTimeout(this.overlayTimer)
    
    this.overlayTimer = setTimeout(() => {
      this.overlayEl.remove()
    }, cssDurationToMilliseconds(this.cssOverlayFadeoutDuration))
  }

  // private changeTheme = (mode: ThemeModeType): void => {
  //   this.attachOverlayTransition()

  //   clearTimeout(this.overlayShowTimer)
  //   this.overlayShowTimer = setTimeout(() => {
  //     this.overlayEl.style.backgroundColor = this.overlayBackgroundVisible
  //   }, 1)

  //   clearTimeout(this.overlayTimer)
  //   this.overlayTimer = setTimeout(() => {
  //     this.detachOverlayTransition()
  //   }, cssDurationToMilliseconds(this.cssOverlayShowDuration))
  // }

  private setTheme = (mode: ThemeModeType): void => {
    localStorage.setItem('mds-pref-theme', mode)
    this.mode = mode
    if (document) {
      for (const key in this.theme) {
        if ({}.hasOwnProperty.call(this.theme, key)) {
          document.querySelector('html')?.classList.remove(this.theme[key].selector)
        }
      }
      document.querySelector('html')?.classList.add(this.theme[mode].selector)
      document.querySelector('html')?.setAttribute('style', `--magma-pref-theme:${this.mode};`)
    }
  }

  @Watch('mode')
  modeChanged (newValue: ThemeModeType): void {
    this.setTheme(newValue)
  }

  render () {
    return (
      <Host >
        <mds-text class="info" typography="caption"><b>{this.t.get('label')}</b> {this.t.get(this.theme[this.mode ?? this.defaultMode].label)}</mds-text>
        <mds-tab>
          <mds-tab-item selected={this.mode === 'light'} onClick={() => { this.setTheme('light'); this.attachOverlayTransition() }} class="item item--light" icon={miBaselineLightMode}></mds-tab-item>
          <mds-tab-item selected={this.mode === 'system'} onClick={() => { this.setTheme('system'); this.attachOverlayTransition() }} class="item item--system" icon={miBaselineSettings}></mds-tab-item>
          <mds-tab-item selected={this.mode === 'dark'} onClick={() => { this.setTheme('dark'); this.attachOverlayTransition() }} class="item item--dark" icon={this.mode === 'dark' ? miBaselineDarkMode : miOutlineDarkMode}></mds-tab-item>
        </mds-tab>
      </Host>
    )
  }
}
