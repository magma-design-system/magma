import { Component, Host, Element, Event, EventEmitter, h, Prop, Watch, Method, State } from '@stencil/core'
import { cssDurationToMilliseconds } from '@common/unit'
import miBaselineLightMode from '@icon/mi/baseline/light-mode.svg'
import miOutlineDarkMode from '@icon/mi/outline/dark-mode.svg'
import miBaselineDarkMode from '@icon/mi/baseline/dark-mode.svg'
import miBaselineSettings from '@icon/mi/baseline/settings.svg'
import { Locale } from '@common/locale'
import localeEl from './meta/locale.el.json'
import localeEn from './meta/locale.en.json'
import localeEs from './meta/locale.es.json'
import localeIt from './meta/locale.it.json'
import { ThemeModeType, ThemeTransitionType } from './meta/types'
import { MdsPrefChangeEventDetail } from '@event/preference'

@Component({
  tag: 'mds-pref-theme',
  styleUrl: 'mds-pref-theme.css',
  shadow: true,
})
export class MdsPrefTheme {
  @Element() private element: HTMLMdsPrefThemeElement
  private readonly defaultMode: ThemeModeType = 'system'
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

  private readonly localStorageAlias: string = 'mdsPrefTheme'
  private readonly customPropertyAlias: string = '--magma-pref-theme'
  private readonly overlayBackgroundVisible = 'rgb(var(--tone-neutral))'
  private readonly overlayBackgroundHidden = 'rgb(var(--tone-neutral) / 0)'
  private cssOverlayShowDuration: string = '300'
  private cssOverlayFadeoutDuration: string = '200'
  private cssOverlayZIndex: string = '6000'
  private overlayEl: HTMLElement
  private readonly overlayId = 'mds-pref-theme-overlay'
  private overlayTimer: NodeJS.Timeout
  private overlaySmoothTimer: NodeJS.Timeout
  private overlayShow: boolean = false

  private updateCSSCustomProps = (): void => {
    if (typeof window === 'undefined') return
    const elementStyles = window.getComputedStyle(this.element)
    this.cssOverlayShowDuration = elementStyles.getPropertyValue('--mds-pref-theme-overlay-show-duration') ?? '300'
    this.cssOverlayFadeoutDuration = elementStyles.getPropertyValue('--mds-pref-theme-overlay-fadeout-duration') ?? '200'
    this.cssOverlayZIndex = elementStyles.getPropertyValue('--mds-pref-theme-overlay-z-index') ?? '6000'
  }


  /**
   * Specifies the preference mode
   */
  @Prop({ mutable: true, reflect: true }) mode?: ThemeModeType

  /**
   * Specifies the transition of switching from a theme to another one
   */
  @Prop({ mutable: true, reflect: true }) transition: ThemeTransitionType = 'smooth'

  /**
   * Emits when the component is triggered
   */
  @Event({ eventName: 'mdsPrefChange' }) prefChangeEvent: EventEmitter<MdsPrefChangeEventDetail>

  private readonly theme = {
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
    this.setTheme(this.mode ?? localStorage.getItem(this.localStorageAlias) as ThemeModeType ?? this.defaultMode)
  }

  componentDidLoad (): void {
    this.updateCSSCustomProps()
  }

  @Watch('mode')
  modeChanged (newValue: ThemeModeType, oldValue: ThemeModeType): void {
    if (newValue === oldValue) {
      return
    }
    this.setTheme(newValue)
  }

  private readonly setTheme = (mode: ThemeModeType): void => {
    this.prefChangeEvent.emit({ preference: 'theme' })
    this.mode = mode
    localStorage.setItem(this.localStorageAlias, this.mode)
    if (document) {
      const element = document.querySelector('html')
      for (const key in this.theme) {
        if ({}.hasOwnProperty.call(this.theme, key)) {
          element?.classList.remove(this.theme[key].selector)
        }
      }
      element?.classList.add(this.theme[mode].selector)
      element?.style.setProperty(this.customPropertyAlias, this.mode)
    }
  }

  private readonly isDarkMode = (): boolean => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  private readonly getColorScheme = (mode?: ThemeModeType): ThemeModeType => {
    if (mode) {
      if (mode === 'system') {
        return this.isDarkMode() ? 'dark' : 'light'
      }
      return mode as ThemeModeType
    }

    if (this.mode === 'system') {
      return this.isDarkMode() ? 'dark' : 'light'
    }
    return this.mode as ThemeModeType
  }

  private instanceOverlay = (): void => {
    if (!this.overlayEl) {
      this.overlayEl = document.createElement('div')
      this.overlayEl.className = this.overlayId
      this.overlayEl.style.inset = '0'
      this.overlayEl.style.pointerEvents = 'none'
      this.overlayEl.style.position = 'fixed'
      this.overlayEl.style.transition = `background-color ${this.cssOverlayFadeoutDuration} ease-out`
      this.overlayEl.style.zIndex = this.cssOverlayZIndex
    }
    this.overlayEl.style.backgroundColor = this.overlayBackgroundHidden
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

  private attachFlashOverlayTransition = (): void => {
    this.overlayShow = true
    this.instanceOverlay()
    this.overlayEl.style.backgroundColor = this.overlayBackgroundVisible
    document.body.appendChild(this.overlayEl)

    clearTimeout(this.overlayTimer)
    this.overlayTimer = setTimeout(() => {
      this.overlayShow = false
      this.detachOverlayTransition()
    }, cssDurationToMilliseconds(this.cssOverlayShowDuration))
  }

  private attachSmoothOverlayTransition = (mode: ThemeModeType): void => {

    this.overlayShow = true
    this.instanceOverlay()
    document.body.appendChild(this.overlayEl)

    clearTimeout(this.overlaySmoothTimer)
    this.overlaySmoothTimer = setTimeout(() => {
      this.overlayEl.style.backgroundColor = this.overlayBackgroundVisible
      clearTimeout(this.overlayTimer)

      this.overlayTimer = setTimeout(() => {
        this.setTheme(mode)

        clearTimeout(this.overlayTimer)
        this.overlayTimer = setTimeout(() => {
          this.overlayShow = false
          this.detachOverlayTransition()
        }, cssDurationToMilliseconds(this.cssOverlayFadeoutDuration))

      }, cssDurationToMilliseconds(this.cssOverlayShowDuration))

    }, 1)
  }

  private changeTheme = (mode: ThemeModeType): void => {

    const prevColor = this.getColorScheme()
    const nextColor = this.getColorScheme(mode)

    if (prevColor === nextColor) {
      this.setTheme(mode)
      return
    }

    switch (this.transition) {
    case 'none':
      this.setTheme(mode)
      break
    case 'flash':
      this.setTheme(mode)
      this.attachFlashOverlayTransition()
      break
    case 'smooth':
      this.attachSmoothOverlayTransition(mode)
      break
    default:
      this.setTheme(mode)
      break
    }
  }

  render () {
    return (
      <Host>
        <mds-text class="info" typography="caption"><b>{this.t.get('label')}</b> {this.t.get(this.theme[this.mode ?? this.defaultMode].label)}</mds-text>
        <mds-tab fill>
          <mds-tab-item selected={this.mode === 'light'} onClick={() => { if (this.overlayShow) { return } this.changeTheme('light') }} class="item item--light" icon={miBaselineLightMode}></mds-tab-item>
          <mds-tab-item selected={this.mode === 'system'} onClick={() => { if (this.overlayShow) { return } this.changeTheme('system') }} class="item item--system" icon={miBaselineSettings}></mds-tab-item>
          <mds-tab-item selected={this.mode === 'dark'} onClick={() => { if (this.overlayShow) { return } this.changeTheme('dark') }} class="item item--dark" icon={this.mode === 'dark' ? miBaselineDarkMode : miOutlineDarkMode}></mds-tab-item>
        </mds-tab>
      </Host>
    )
  }
}
