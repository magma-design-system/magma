import { Component, Host, Element, Event, EventEmitter, h, Prop, Method, State } from '@stencil/core'
import { Locale } from '@common/locale'
import localeIt from './meta/locale.it.json'
import localeEn from './meta/locale.en.json'
import miBaselineCheckCircle from '@icon/mi/baseline/check-circle.svg'
import miOutlineCircle from '@icon/mi/outline/circle.svg'
import { MdsPrefThemeVariantEventDetail } from '@event/theme-variant'
import { PreferenceThemeSchemeType } from '@type/preference'

@Component({
  tag: 'mds-pref-theme-variant-item',
  styleUrl: 'mds-pref-theme-variant-item.css',
  shadow: true,
})
export class MdsPrefThemeVariantItem {
  @Element() private element: HTMLMdsPrefThemeVariantItemElement
  private readonly t: Locale = new Locale({
    en: localeEn,
    it: localeIt,
  })
  @State() language: string
  @Method()
  async updateLang (): Promise<void> {
    this.language = this.t.lang(this.element)
  }

  /**
   * Specifies the theme name
   */
  @Prop({ reflect: true, mutable: true }) label?: string

  /**
   * Specifies the theme name
   */
  @Prop({ reflect: true }) readonly name: string = 'default'

  /**
   * Specifies the theme scheme which can be 'light', 'dark' or 'all'
   */
  @Prop({ reflect: true }) readonly scheme?: PreferenceThemeSchemeType = 'all'

  /**
   * Specifies if the element is selected
   */
  @Prop({ reflect: true }) readonly selected?: boolean = false

  /**
   * Emits when the component trigger the language
   */
  @Event({ eventName: 'mdsPrefThemeVariantItemSelect' }) selectVariantEvent: EventEmitter<MdsPrefThemeVariantEventDetail>

  componentWillRender (): void {
    this.t.lang(this.element)
    if (!this.label) {
      this.label = this.name.charAt(0).toUpperCase() + this.name.slice(1).replace(/-/g, ' ')
    }
  }

  private handleClick = (): void => {
    this.selectVariantEvent.emit({ name: this.name, scheme: this.scheme })
  }

  render () {
    return (
      <Host onClick={this.handleClick}>
        <mds-button icon={this.selected ? miBaselineCheckCircle : miOutlineCircle} variant="dark" tone="text">
          <div class="label">
            <div class="theme-preview">
              <div class="theme-color theme-color--variant-primary"></div>
              <div class="theme-color theme-color--status-success"></div>
              <div class="theme-color theme-color--status-warning"></div>
              <div class="theme-color theme-color--status-error"></div>
            </div>
            {this.label}
          </div>
        </mds-button>
      </Host>
    )
  }
}
