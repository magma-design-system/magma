import { Locale } from '@common/locale'
import miBaselineKeyboardArrowDown from '@icon/mi/baseline/keyboard-arrow-down.svg'
import { AttachInternals, Component, Element, Event, EventEmitter, Host, Method, Prop, h, State, Watch } from '@stencil/core'
import { MdsInputEventDetail } from '@type/input'
import { ThemeStatusVariantType } from '@type/variant'

/**
 * @part select - The select HTML element
 * @part tip-top - Selects the verbose status of input on top of element
 */

@Component({
  tag: 'mds-input-select',
  styleUrl: 'mds-input-select.css',
  formAssociated: true,
  shadow: true,
})
export class MdsInputSelect {

  private selectEl: HTMLSelectElement
  @Element() host: HTMLMdsInputSelectElement
  // @State() selected: boolean
  @State() hasFocus = false
  @State() language: string
  @AttachInternals() internals: ElementInternals

  private t:Locale = new Locale()

  @Method()
  async updateLang (): Promise<void> {
    this.language = this.t.lang(this.host)
    this.t.update()
  }

  /**
   * Specifies a short hint that describes the expected value of the element
   */
  @Prop({ reflect: true }) readonly autocomplete?: 'on'

  /**
   * Specifies a short hint that describes the expected value of the element
   */
  @Prop({ reflect: true }) readonly autoFocus?: boolean

  /**
   * Specifies a short hint that describes the expected value of the element
   */
  @Prop({ reflect: true }) readonly placeholder?: string

  /**
   * Is needed to reference the form data after the form is submitted
   */
  @Prop({ reflect: true }) readonly name?: string

  /**
   * If true, the element is displayed as disabled
   */
  @Prop({ reflect: true }) readonly disabled?: boolean = false

  /**
   * Specifies that the element must be filled out before submitting the form
   */
  @Prop({ reflect: true }) readonly required?: boolean = false

  /**
   * Specifies if the select should allow multiple options to be selected in the list
   */
  @Prop({ reflect: true }) readonly multiple?: boolean = false

  /**
   * When `multiple` is set to `true`, represents the number or rows in the list that should be visible
   */
  @Prop({ reflect: true }) readonly size?: number = 0

  /**
   * Specifies the value of the component
   */
  @Prop({ reflect: true }) value?: string | number | null = ''

  /**
   * Specifies the default value of the component
   */
  @Prop({ reflect: true }) defaultValue?: string | number | null

  /**
   * Sets the variant of the component
   */
  @Prop({ reflect: true }) readonly variant?: ThemeStatusVariantType

  /**
   * Emits an InputChangeEventDetail when the value of the input element changes
   */
  @Event({ eventName: 'mdsInputSelectChange' }) changeEvent: EventEmitter<MdsInputEventDetail>

  /**
   * Sets the value of the component
   */
  @Method()
  async setValue (value: string | number | null): Promise<void> {
    this.value = value
    return Promise.resolve()
  }

  /**
   * Emits the change event when the component value changes
   */
  @Watch('value')
  protected valueChanged ():void {
    this.changeEvent.emit({ value: this.value?.toString() })
    this.setCurrentValue()
    this.internals.setFormValue(this.value?.toString() ?? null)
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

  /**
   * This is for the react component because placeholder is valued after didload
   * and therefore the placeholder option is drawn as the last option.
   * Here the option is brought back to the first position
   * @param newValue placeholder new value
   * @param oldValue placeholder old value
   */
  @Watch('placeholder')
  protected placeholderChanged (newValue: string | undefined, oldValue: string | undefined) {
    if (newValue && !oldValue) {
      let defaultOption: HTMLOptionElement | null = document.querySelector('.placeholder-option')
      if (defaultOption) defaultOption.remove()
      defaultOption = document.createElement('option')
      this.selectEl.insertBefore(defaultOption, this.selectEl.firstChild)
      defaultOption.value = ''
      defaultOption.text = newValue
      if (!this.defaultValue) {
        defaultOption.selected = true
        this.value = undefined
      }
      if (this.required) defaultOption.disabled = true
    }
  }

  formResetCallback (): void {
    this.internals.setFormValue('')
  }

  componentWillLoad (): void {
    this.language = this.t.lang(this.host)
    // needed for react component, this prop should be used as default-value html attributo instead of defaultValue prop
    if (this.defaultValue) {
      this.value = this.defaultValue
    }
  }

  componentDidLoad (): void {
    if (this.value) {
      this.internals.setFormValue(this.value.toString())
    }
  }

  private onInput = (ev: Event) => {
    const input = ev.target as HTMLSelectElement | false
    if (input) {
      this.value = input.value
    }
  }

  private onBlur = () => {
    this.hasFocus = false
  }

  private onFocus = () => {
    this.hasFocus = true
  }

  private emptyOptions = (): void => {
    const select = this.host.shadowRoot?.querySelector('select')
    const options = select?.querySelectorAll('option')

    if (!options) {
      return
    }

    options.forEach((option: HTMLOptionElement, index: number) => {
      if (!this.placeholder) {
        option.remove()
      }

      if (this.placeholder && index > 0) {
        option.remove()
      }
    })
  }

  private onSlotChangeHandler = (): void => {
    const elements = this.host.shadowRoot?.querySelectorAll('slot')[0]?.assignedNodes()
    const options = this.selectEl?.querySelectorAll('option')

    if (!options) {
      return
    }

    if (!this.placeholder && options.length > 0) {
      this.emptyOptions()
    }

    if (this.placeholder && options.length > 1) {
      this.emptyOptions()
    }

    elements?.forEach((element: HTMLOptionElement) => {
      this.selectEl?.appendChild(element.cloneNode(true))
    })

    this.setCurrentValue()
  }

  private setCurrentValue = (): void => {
    if (!this.selectEl) return
    if (this.value){
      this.selectEl.querySelectorAll('option').forEach((element: HTMLOptionElement) => {
        element.selected = element.value === this.value
      })
    } else if (!this.placeholder) {
      this.value = this.selectEl?.querySelectorAll('option')[0].value
    }
  }

  render () {
    return (
      <Host>
        <select
          class='input'
          onInput={this.onInput.bind(this)}
          onBlur={this.onBlur}
          onFocus={this.onFocus}
          name={this.name}
          required={this.required}
          disabled={this.disabled}
          multiple={this.multiple}
          size={this.size}
          part="select"
          ref={el => this.selectEl = el as HTMLSelectElement}
        >
          <option class="placeholder-option" value="" disabled={!this.required ? undefined : true} selected={this.defaultValue ? undefined : true}>{ this.placeholder }</option>
        </select>
        <div class="icon-container">
          <i class="icon" innerHTML={miBaselineKeyboardArrowDown} />
        </div>
        <div class="option-container">
          <slot onSlotchange={this.onSlotChangeHandler}></slot>
        </div>
        <mds-input-tip position="top" lang={this.language} active={this.hasFocus} part="tip-top">
          { this.disabled && <mds-input-tip-item expanded variant="disabled"></mds-input-tip-item> }
          { this.required &&
            <mds-input-tip-item expanded={this.hasFocus} variant={this.value === '' ? 'required' : 'required-success'}></mds-input-tip-item>
          }
        </mds-input-tip>
      </Host>
    )
  }
}
