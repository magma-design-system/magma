import clsx from 'clsx'
import miBaselineChecked from '@icon/mgg/check-small.svg'
import miBaselineRemove from '@icon/mi/baseline/remove.svg'
import { AttachInternals, Component, Element, Host, h, Prop, Event, EventEmitter, State, Method, Watch } from '@stencil/core'
import { InputSwitchType, InputSwitchSizeType } from './meta/types'
import { KeyboardManager } from '@common/keyboard-manager'
import { MdsInputSwitchEventDetail } from './meta/event-detail'
import { TypographyInfoType, TypographyReadType, TypographyVariants } from '@type/typography'
import { inputSwitchIconVariant } from './meta/variants'
import { hasSlotted } from '@common/slot'
import { Locale } from '@common/locale'
import localeEl from './meta/locale.el.json'
import localeEn from './meta/locale.en.json'
import localeEs from './meta/locale.es.json'
import localeIt from './meta/locale.it.json'

/**
 * @slot default - Put text string or elements here
 */

@Component({
  tag: 'mds-input-switch',
  styleUrl: 'mds-input-switch.css',
  formAssociated: true,
  shadow: true,
})
export class MdsInputSwitch {

  @AttachInternals() internals: ElementInternals
  @Element() host: HTMLMdsInputSwitchElement
  private km = new KeyboardManager()
  private label: string
  @State() dirty = false
  @State() hasText: boolean = false

  private t: Locale = new Locale({
    el: localeEl,
    en: localeEn,
    es: localeEs,
    it: localeIt,
  })
  @State() language: string
  @Method()
  async updateLang (): Promise<void> {
    this.language = this.t.lang(this.host)
  }

  /**
   * Sets or returns whether a checkbox should automatically
   * get focus when the page loads
   */
  @Prop({ reflect: true }) readonly autofocus: boolean

  /**
   * Specifies that an <input> element should be pre-selected
   * when the page loads (for type="checkbox" or type="radio")
   */
  @Prop({ mutable:true, reflect: true }) checked?: boolean

  /**
   * Sets or returns whether a checkbox is disabled, or not
   */
  @Prop({ reflect: true }) readonly disabled?: boolean

  /**
   * Sets if the type switch mode shows explicit icons
   */
  @Prop({ reflect: true }) readonly explicit?: boolean

  /**
   * The checked icon displayed
   */
  @Prop({ reflect: true }) readonly icon: string = ''

  /**
   * Sets or returns the indeterminate state of the checkbox
   */
  @Prop({ reflect: true, mutable: true }) indeterminate?: boolean

  /**
   * Specifies the name of an <input> element
   */
  @Prop({ reflect: true }) readonly name: string = ''

  /**
   * Specifies the size for the switch toggle, it works only if attribute 'type' is set to 'switch'
   */
  @Prop({ reflect: true }) readonly size: InputSwitchSizeType = 'md'

  /**
   * Specifies switch type: switch (default), checkbox and radio
   */
  @Prop({ reflect: true }) readonly type: InputSwitchType = 'switch'

  /**
   * Specifies the font typography of the element
   */
  @Prop({ reflect: true }) readonly typography?: TypographyInfoType | TypographyReadType = 'detail'

  /**
   * Specifies the variant for `typography`
   */
  @Prop({ reflect: true }) readonly variant?: TypographyVariants

  /**
   * Specifies the value of the input element
   */
  @Prop({ mutable:true, reflect: true }) value?: string = ''

  /**
   * Emits when the value changes
   */
  @Event({ eventName: 'mdsInputSwitchChange' }) changeEvent: EventEmitter<MdsInputSwitchEventDetail>

  private uncheckSiblings = (): void => {
    const elements = document.querySelectorAll(`mds-input-switch[name="${this.name}"]`)

    elements.forEach((element: HTMLMdsInputSwitchElement) => {
      if (element !== this.host) {
        element.checked = false
      }
    })
  }

  private handleInputOnChange = (e: Event): void => {
    const { value } = (e.target as HTMLInputElement)
    e.preventDefault()
    e.stopPropagation()
    const input = this.host.shadowRoot?.getElementById('field') as HTMLInputElement
    this.checked = input.checked
    this.indeterminate = false

    if (this.type === 'radio') {
      this.uncheckSiblings()
    }

    this.changeEvent.emit({ name: this.name, checked: this.checked, value })
    this.internals.setFormValue(this.checked ? this.value ?? null : null)
  }

  private handleDirty = (): void => {
    this.dirty = true
  }

  private checkFocusElement = (): void => {
    switch (this.type) {
    case 'switch':
      this.km.removeElement('default')
      this.km.addElement(this.host.shadowRoot?.querySelector('.switch-container') as HTMLElement, 'switch')
      this.km.attachClickBehavior('switch')
      break
    default:
      this.km.removeElement('switch')
      this.km.addElement(this.host.shadowRoot?.querySelector('.label-icon') as HTMLElement, 'default')
      this.km.attachClickBehavior('default')
    }
  }

  @Watch('disabled')
  protected disabledChanged (newValue: boolean):void {
    /**
     * This is related to ALL disabled attributes set on Magma input components
     * if solved, please check mds-button, mds-input, mds-input-*
     * https://github.com/ionic-team/stencil/issues/5461
     */
    if (newValue) {
      this.internals.setFormValue(null)
    }
  }

  formResetCallback (): void {
    this.internals.setFormValue('')
  }

  componentDidLoad (): void {
    this.language = this.t.lang(this.host)
    this.label = this.host.textContent ?? ''
    this.internals.setFormValue(this.checked ? this.value ?? null : null)
    this.checkFocusElement()
    this.hasText = hasSlotted(this.host)
  }

  render () {
    const { iconChecked, iconUnchecked, iconIndeterminate } = inputSwitchIconVariant[this.type]
    const iconCheckedUser = this.icon !== '' ? this.icon : iconChecked

    return (
      <Host onClick={this.handleDirty}>
        <input
          autoFocus={this.autofocus}
          checked={this.checked}
          class="field"
          disabled={this.disabled}
          id="field"
          indeterminate={this.indeterminate}
          name={this.name}
          onChange={event => this.handleInputOnChange(event)}
          type={this.type === 'switch' ? 'checkbox' : this.type }
          value={this.value ?? undefined}
        />
        { this.type === 'switch'
          ?
          <label htmlFor="field" class={clsx('switch-container', this.dirty !== false && 'dirty')} tabindex="0" aria-label={ this.t.get(this.checked ? 'unselect' : 'select', { label: this.label })}>
            <div class="switch">
              <div class="switch-toggle">
                { this.explicit && <mds-icon class="icon-explicit" name={this.checked ? miBaselineChecked : miBaselineRemove}></mds-icon> }
              </div>
            </div>
          </label>
          :
          <label htmlFor="field" class="label-icon" tabindex="0" aria-label={ this.t.get(this.checked ? 'unselect' : 'select', { label: this.label })}>
            <mds-text class="icon-typography-unchecked" tag="div" typography={this.typography} variant={this.variant}>
              <mds-icon class="icon-unchecked" name={clsx(this.indeterminate ? iconIndeterminate : iconUnchecked)}/>
            </mds-text>
            <mds-text class="icon-typography-checked" tag="div" typography={this.typography} variant={this.variant}>
              <mds-icon class="icon-checked" name={clsx(this.indeterminate ? iconIndeterminate : iconCheckedUser)}/>
            </mds-text>
          </label>
        }
        <label htmlFor="field" class={clsx('label-text', !this.hasText && 'label-text--empty')}>
          <mds-text typography={this.typography} variant={this.variant}>
            <slot></slot>
          </mds-text>
        </label>
      </Host>
    )
  }
}
