import clsx from 'clsx'
import miBaselineAdd from '@icon/mi/baseline/add.svg'
import miBaselineArrowDown from '@icon/mi/baseline/keyboard-arrow-down.svg'
import miBaselineArrowUp from '@icon/mi/baseline/keyboard-arrow-up.svg'
import miBaselineRemove from '@icon/mi/baseline/remove.svg'
import miBaselineVisible from '@icon/mi/baseline/visibility.svg'
import miBaselineVisibleOff from '@icon/mi/baseline/visibility-off.svg'
import { AttachInternals, Component, Element, Event, EventEmitter, Host, Method, Prop, State, Watch, h } from '@stencil/core'
import { AutocompleteType } from '@type/autocomplete'
import { InputTextType, InputControlsLayoutType, InputControlsIconType, MdsInputEventDetail } from '@type/input'
import { ThemeStatusVariantType } from '@type/variant'
import { TypographyInputType } from '@type/typography'
import { InputTipItemVariantType } from '@type/input-tip'
import { Locale } from '@common/locale'
import localeEl from './meta/locale.el.json'
import localeEn from './meta/locale.en.json'
import localeEs from './meta/locale.es.json'
import localeIt from './meta/locale.it.json'
import { createInputValidationManager, InputValidationManager } from './meta/input-type/InputValidationManager'
import { MdsValidationErrors, MdsValidatorFn, requiredValidor } from './meta/validators'

/*
  * @part counter-button-decrease - Selects the button used to decrese the input value
  * @part counter-button-increase - Selects the button used to increse the input value
  * @part field - Selects the native input field used by the component
  * @part password-toggle-button - Selects the button used to show or hide password
  * @part tip-count - Selects the mds-input-tip shown when maxlength attribute is set, can be used to hide it if needed
  */

export interface MdsInputInterface {
  autocomplete?: AutocompleteType
  autofocus?: boolean
  controlsIcon?: InputControlsIconType
  controlsLayout?: InputControlsLayoutType
  datalist?: string[]
  disabled?: boolean
  icon?: string
  max?: string
  maxLength?: number
  min?: string
  minLength?: number
  name?: string
  pattern?: string
  placeholder?: string
  readOnly?: boolean
  required?: boolean
  step?: string
  tabindex?: number
  tip?: string
  type: InputTextType
  typography?: TypographyInputType
  value?: string
  variant?: ThemeStatusVariantType
}

@Component({
  tag: 'mds-input',
  styleUrl: 'mds-input.css',
  formAssociated: true,
  shadow: true,
})

export class MdsInput {

  private nativeInput?: HTMLInputElement | HTMLTextAreaElement
  private tabindex?: number

  private inputValidation: InputValidationManager

  @Element() el: HTMLMdsInputElement
  @State() hasFocus = false
  @State() language: string
  @State() currentLengthLabel: string
  @State() countVariant: InputTipItemVariantType = 'count-empty'
  @State() isPasswordVisible = false
  // private valuePristine?: string

  private t:Locale = new Locale({
    el: localeEl,
    en: localeEn,
    es: localeEs,
    it: localeIt,
  })
  @Method()
  async updateLang (): Promise<void> {
    this.language = this.t.lang(this.el)
    this.t.update()
  }

  @AttachInternals() internals: ElementInternals

  /**
   * Specifies whether the element should have autocomplete enabled
   */
  @Prop({ reflect: true }) readonly autocomplete?: AutocompleteType = 'off'

  /**
   * Specifies that the element should automatically get focus when the page loads
   */
  @Prop({ reflect: true }) readonly autofocus: boolean = false

  /**
   * Specifies if the spinner icon is shown, replacing the icon if present
   */
  @Prop({ reflect: true }) readonly await: boolean = false

  /**
   * Specifies the layout of the counter button when the input type is set to `number`
   */
  @Prop({ reflect: true }) readonly controlsLayout?: InputControlsLayoutType = 'vertical'

  /**
   * Specifies the icon type of the counter button when the input type is set to `number`
   */
  @Prop({ reflect: true }) readonly controlsIcon?: InputControlsIconType = 'arrow'

  /**
   * Specifies the label for control button increase for component when type is number
   */
  @Prop({ reflect: true }) readonly controlIncreaseLabel?: string = 'Aumenta'

  /**
   * Specifies the label for control button decrease for component when type is number
   */
  @Prop({ reflect: true }) readonly controlDecreaseLabel?: string = 'Riduci'

  /**
   * A list of search terms to be searched from the input field,
   * it should be used with type="search" input.
   */
  @Prop() readonly datalist?: string[]

  /**
   * If true, the element is displayed as disabled
   */
  @Prop({ reflect: true }) readonly disabled?: boolean = false

  /**
   * An icon displayed at the right of the input
   */
  @Prop({ reflect: true }) readonly icon?: string

  /**
   * Specifies the maximum value
   * use it with input type="number" or type="date"
   * Example: max="180", max="2046-12-04"
   */
  @Prop({ reflect: true }) readonly max?: string

  /**
   * Specifies the maximum number of characters allowed in an element.
   * Use it with input type="text".
   * If maxlength is set to 0 or a negative number it will be considered as undefined.
   */
  @Prop({ reflect: true, mutable: true }) maxlength?: number

  /**
   * Specifies the minimum value
   * use it with input type="number" or type="date"
   * Example: min="-3", min="1988-04-15"
   */
  @Prop({ reflect: true }) readonly min?: string | number

  /**
   * Specifies the minimum number of characters allowed in an element
   * use it with input type="number"
   */
  @Prop({ reflect: true }) readonly minlength?: number

  /**
   * Is needed to reference the form data after the form is submitted
   */
  @Prop({ reflect: true }) readonly name?: string

  /**
   * Specifies a regular expression that element\'s value is checked against
   */
  @Prop({ reflect: true }) readonly pattern?: string

  /**
   * Specifies a short hint that describes the expected value of the element
   */
  @Prop({ reflect: true }) readonly placeholder?: string

  /**
   * Specifies that the element is read-only
   */
  @Prop({ reflect: true }) readonly readonly?: boolean = false

  /**
   * Specifies that the element must be filled out before submitting the form
   */
  @Prop({ reflect: true }) readonly required?: boolean = false

  /**
   * Sets the variant of the input field
   */
  @Prop({ reflect: true, mutable: true }) variant?: ThemeStatusVariantType

  /**
   * Sets the word(s) of the tip of the input field
   */
  @Prop({ reflect: true }) readonly tip?: string

  /**
   * Specifies the interval between legal numbers in an input field
   */
  @Prop({ reflect: true }) readonly step?: string

  /**
   * Specifies the type of input element
   */
  @Prop({ reflect: true }) readonly type?: InputTextType = 'text'

  /**
   * Specifies the typography of input element
   */
  @Prop({ reflect: true }) typography: TypographyInputType = 'detail'

  /**
   * Specifies the value of the input element
   */
  @Prop({ mutable:true, reflect: true }) value: string = ''

  /**
   * Emits an InputChangeEventDetail when the value of the input element changes
   */
  @Event({ eventName: 'mdsInputChange' }) changeEvent!: EventEmitter<MdsInputEventDetail>

  /**
   * Emits a KeyboardEvent when a keyboard key is pressed on the focused input element
   */
  @Event({ eventName: 'mdsInputKeydown' }) keyDownEvent!: EventEmitter<KeyboardEvent>

  /**
   * Emits a void event when input element is blurred
   */
  @Event({ eventName: 'mdsInputBlur' }) blurEvent!: EventEmitter<void>

  /**
   * Emits a void event when input element is focused
   */
  @Event({ eventName: 'mdsInputFocus' }) focusEvent!: EventEmitter<void>

  formResetCallback (): void {
    this.internals.setFormValue('')
  }

  componentWillLoad (): void {

    this.language = this.t.lang(this.el)
    // this.valuePristine = this.value

    // If the mds-input has a tabindex attribute we get the value
    // and pass it down to the native input, then remove it from the
    // mds-input to avoid causing tabbing twice on the same element
    if (this.el.hasAttribute('tabindex')) {
      const tabindex = this.el.getAttribute('tabindex')
      this.tabindex = tabindex !== null ? parseInt(tabindex) : undefined
      this.el.removeAttribute('tabindex')
    }
    this.internals.setFormValue(this.value ?? null)
    this.maxLengthChanged(this.maxlength)

    this.el.focus = () => {
      this.nativeInput?.focus()
    }
  }

  componentDidLoad (): void {
    this.inputValidation = createInputValidationManager(this.type!)
    if (this.required) {
      this.inputValidation.validator.addValidator(requiredValidor)
    }
    this.nativeInput?.setAttribute('pattern', String(this.inputValidation.pattern))
    if (this.autofocus) {
      this.nativeInput?.focus()
    }
  }
  /**
   * Emits the change event when the component value changes
   */
  @Watch('value')
  protected valueChanged ():void {
    this.changeEvent.emit({ value: this.value })
    this.internals.setFormValue(this.value ?? null)
    if (this.maxlength !== undefined) {
      this.countMaxLength()
    }
  }

  @Watch('maxlength')
  private maxLengthChanged (newValue?: number):void {
    if (newValue === undefined) return
    if (newValue <= 0) {
      this.maxlength = undefined
      return
    }
    this.countMaxLength()
  }

  @Method()
  async addValidator (validator: MdsValidatorFn): Promise<void> {
    this.inputValidation.validator.addValidator(validator)
    return Promise.resolve()
  }

  @Method()
  async removeValidator (validator: MdsValidatorFn): Promise<void> {
    this.inputValidation.validator.removeValidator(validator)
  }

  /**
   * Returns if validator is presen
   * @param validator validator to check if it is present
   * @returns if a validator is present or not, if no validator given, return if there are at least one validator
   */
  @Method()
  async hasValidator (validator?: MdsValidatorFn): Promise<boolean> {
    return this.inputValidation.validator.hasValidator(validator)
  }

  @Method()
  async getErrors (): Promise<MdsValidationErrors | null> {
    return Promise.resolve(this.inputValidation.validator.errors)
  }

  private validateInput (): boolean {
    const isValid = this.inputValidation.isValid(this.value)
    this.variant = isValid ? 'success' : 'error'
    return isValid
  }


  private countMaxLength = (): void => {
    if (!this.maxlength) return
    if (this.value === undefined) return

    this.currentLengthLabel = `${this.value?.length ?? 0} / ${this.maxlength}`

    const completionPerc = Math.round(this.value.length * 100 / this.maxlength)

    if (this.value?.length === this.maxlength) {
      this.countVariant = 'count-full'
      return
    }

    if (completionPerc >= 100) {
      this.countVariant = 'count-full'
      return
    }

    if (completionPerc >= 75) {
      this.countVariant = 'count-almost-full'
      return
    }
    if (completionPerc >= 50) {
      this.countVariant = 'count-almost'
      return
    }
    if (completionPerc >= 25) {
      this.countVariant = 'count-incomplete'
      return
    }
    this.countVariant = 'count-empty'
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
   * Sets focus on the specified `my-input`.
   * Use this method instead
   * of the global `input.focus()`.
   */
  @Method()
  async setFocus ():Promise<void> {
    if (this.nativeInput) {
      this.nativeInput.focus()
    }
  }

  /**
   * Returns the native `<input>` element used under the hood.
   */
  @Method()
  getInputElement (): Promise<HTMLInputElement | HTMLTextAreaElement> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return Promise.resolve(this.nativeInput!)
  }

  private onInput = (ev: InputEvent) => {
    const input = ev.target as HTMLInputElement | HTMLTextAreaElement | false
    if (input) {
      this.value = input.value
      this.internals.setFormValue(this.value)
    }
    this.keyDownEvent.emit(ev as Event as KeyboardEvent)
  }

  private onBlur = () => {
    this.hasFocus = false
    this.validateInput()
    this.blurEvent.emit()
    // this.isValidInput = this.validateInput()
  }

  private onFocus = (ev: Event) => {
    const input = ev.target as HTMLInputElement | HTMLTextAreaElement
    this.hasFocus = true
    this.focusEvent.emit()
    if (this.readonly) {
      // setTimeout to avoid Safari 14.1.2
      // to unselect text when mouse is clicked slowly
      setTimeout(() => {
        input.select()
      }, 10)
    }
  }

  private stepUp = () => {
    if (this.nativeInput && !this.readonly && !this.disabled) {
      (this.nativeInput as HTMLInputElement).stepUp()
      this.value = this.nativeInput.value
    }
  }

  private stepDown = () => {
    if (this.nativeInput && !this.readonly && !this.disabled) {
      (this.nativeInput as HTMLInputElement).stepDown()
      this.value = this.nativeInput.value
    }
  }

  componentWillRender (): void {
    this.t.lang(this.el)
  }

  render () {
    return (
      <Host>
        {this.type === 'number'
          && this.controlsLayout === 'horizontal'
          && <mds-button class="counter-button counter-button--horizontal counter-button--decrease"
            icon={this.controlsIcon === 'arrow' ? miBaselineArrowDown : miBaselineRemove}
            onClick={this.stepDown} tabindex="0" title={this.t.get('decrease')}
            part="counter-button-decrease"></mds-button>
        }
        {this.type === 'textarea'
          ? <textarea
            class={clsx(
              'input',
              (this.icon ?? this.await) && 'has-icon',
            )}
            autoFocus={this.autofocus}
            disabled={this.disabled}
            maxLength={this.maxlength}
            minLength={this.minlength}
            name={this.name}
            onBlur={this.onBlur}
            onFocus={this.onFocus}
            onInput={this.onInput}
            part="field"
            placeholder={this.placeholder}
            readOnly={this.readonly}
            ref={input => (this.nativeInput = input)}
            required={this.required}
            tabIndex={this.tabindex}
            value={this.value}>
          </textarea>
          : <input
            class={clsx(
              'input',
              (this.icon ?? this.await) && 'has-icon',
            )}
            autoComplete={this.autocomplete}
            autoFocus={this.autofocus}
            disabled={this.disabled}
            max={this.max}
            maxLength={this.maxlength}
            min={this.min}
            minLength={this.minlength}
            name={this.name}
            onBlur={this.onBlur}
            onFocus={this.onFocus}
            onInput={this.onInput}
            pattern={this.pattern}
            list={this.datalist && 'datalist'}
            part="field"
            placeholder={this.placeholder}
            readOnly={this.readonly}
            ref={input => (this.nativeInput = input)}
            required={this.required}
            step={this.step}
            tabIndex={this.tabindex}
            type={this.type === 'password' && this.isPasswordVisible ? 'text' : this.type}
            value={this.value}
          />
        }
        {this.type === 'number'
          && this.controlsLayout === 'vertical'
          && <div class="counter counter--vertical">
            <mds-button class="counter-button" icon={this.controlsIcon === 'arrow' ? miBaselineArrowUp : miBaselineAdd}
              onClick={this.stepUp} tabindex="0" title={this.t.get('increase')}
              part="counter-button-increase"></mds-button>
            <mds-button class="counter-button"
              icon={this.controlsIcon === 'arrow' ? miBaselineArrowDown : miBaselineRemove}
              onClick={this.stepDown} tabindex="0" title={this.t.get('decrease')}
              part="counter-button-decrease"></mds-button>
          </div>
        }
        {this.type === 'number'
          && this.controlsLayout === 'horizontal'
          && <mds-button class="counter-button counter-button--horizontal counter-button--increase"
            icon={this.controlsIcon === 'arrow' ? miBaselineArrowUp : miBaselineAdd} onClick={this.stepUp}
            tabindex="0" title={this.t.get('increase')}
            part="counter-button-increase"></mds-button>
        }
        {this.type === 'password'
          && <mds-button class="password-toggle-button"
            icon={this.isPasswordVisible ? miBaselineVisibleOff : miBaselineVisible} onClick={() => this.isPasswordVisible = !this.isPasswordVisible}
            tabindex="0" tone="quiet" title={this.isPasswordVisible ? this.t.get('hidePassword') : this.t.get('showPassword')}
            part="password-toggle-button"></mds-button>
        }
        <mds-input-tip lang={this.language} position="top" active={this.hasFocus}>
          { this.disabled && <mds-input-tip-item expanded variant="disabled"></mds-input-tip-item> }
          { this.readonly && <mds-input-tip-item expanded variant="readonly"></mds-input-tip-item> }
          { this.required &&
            <mds-input-tip-item expanded={this.hasFocus} variant={this.value === '' ? 'required' : 'required-success'}></mds-input-tip-item>
          }
        </mds-input-tip>
        <mds-input-tip lang={this.language} position="bottom" active={this.hasFocus}>
          { this.tip && <mds-input-tip-item expanded variant="text">{ this.tip }</mds-input-tip-item>}
          { this.maxlength && <mds-input-tip-item part="tip-count" expanded variant={this.countVariant}>{ this.currentLengthLabel }</mds-input-tip-item> }
        </mds-input-tip>
        {this.datalist &&
          <datalist id="datalist" class="datalist">
            {this.datalist.forEach(element => {
              return <option value={element}/>
            })}
          </datalist>
        }
        {this.icon && !this.await && <mds-icon class={clsx('icon', this.variant)} name={this.icon}/>}
        <mds-spinner running={this.await} class={clsx('await', this.variant)}/>
      </Host>
    )
  }
}
