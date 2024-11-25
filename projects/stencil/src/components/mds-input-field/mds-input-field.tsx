import clsx from 'clsx'
import { AttachInternals, Component, Element, Event, EventEmitter, Host, Method, Prop, State, Watch, h } from '@stencil/core'
import { AutocompleteType } from '@type/autocomplete'
import { InputControlsLayoutType, InputControlsIconType, InputTextType, MdsInputEventDetail } from '@type/input'
import { MdsInputInterface } from '@component/mds-input/mds-input'
import { ThemeStatusVariantType } from '@type/variant'
import { TypographyInputType } from '@type/typography'
import { InputValidationManager, createInputValidationManager } from './meta/input-type/InputValidationManager'
import { MdsValidatorFn, MdsValidationErrors } from './meta/validators'
import { InputFieldType } from './meta/types'

export interface MdsInputFieldInterface extends MdsInputInterface {
  label?: string
  message?: string
}

@Component({
  tag: 'mds-input-field',
  styleUrl: 'mds-input-field.css',
  formAssociated: true,
  shadow: true,
})
export class MdsInputField {

  // private cleanValue?: string | number | null = ''
  private nativeInput?: HTMLInputElement | HTMLTextAreaElement | null
  private tabindex?: number

  private inputValidation: InputValidationManager

  private isValidInput: boolean = true

  @Element() el!: HTMLMdsInputFieldElement
  @State() hasFocus = false
  @AttachInternals() internals: ElementInternals

  /**
   * Specifies whether the element should have autocomplete enabled
   */
  @Prop({ reflect: true }) autocomplete?: AutocompleteType = 'off'

  /**
   * Specifies that the element should automatically get focus when the page loads
   */
  @Prop({ reflect: true }) autofocus = false

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
   * If true, the element is displayed as disabled
   */
  @Prop({ reflect: true }) disabled?: boolean = false

  /**
   * An icon displayed at the right of the input
   */
  @Prop() icon?: string

  /**
   * Specifies the maximum value
   * use it with input type="number" or type="date"
   * Example: max="180", max="2046-12-04"
   */
  @Prop() max?: string

  /**
   * Specifies the maximum number of characters allowed in an element
   * use it with input type="number"
   */
  @Prop() maxlength?: number

  /**
   * Specifies the minimum value
   * use it with input type="number" or type="date"
   * Example: min="-3", min="1988-04-15"
   */
  @Prop() min?: string

  /**
   * Specifies the minimum number of characters allowed in an element
   * use it with input type="number"
   */
  @Prop() minlength?: number

  /**
   * Is needed to reference the form data after the form is submitted
   */
  @Prop() name?: string

  /**
   * Specifies a regular expression that element\'s value is checked against
   */
  @Prop() pattern?: string

  /**
   * Specifies a short hint that describes the expected value of the element
   */
  @Prop() placeholder = ''

  /**
   * Specifies that the element is read-only
   */
  @Prop({ reflect: true }) readonly?: boolean = false

  /**
   * Specifies that the element must be filled out before submitting the form
   */
  @Prop({ reflect: true }) required?: boolean = false

  /**
   * Specifies the interval between legal numbers in an input field
   */
  @Prop() step?: string

  /**
   * Specifies the type of input element
   */
  @Prop({ reflect: true }) type: InputFieldType = 'text'

  /**
   * Specifies the typography of input element
   */
  @Prop() typography: TypographyInputType = 'detail'

  /**
   * Specifies the value of the input element
   */
  @Prop({ reflect: true, mutable: true }) value: string = ''

  /**
   * Emits an InputValue when the value of the input element changes
   */
  @Event({ eventName: 'mdsInputFieldChange' }) changeEvent!: EventEmitter<MdsInputEventDetail>

  /**
   * Emits a KeyboardEvent when a keboard key is pressed on the focused input element
   */
  @Event({ eventName: 'mdsInputFieldKeydown' }) keyDownEvent!: EventEmitter<KeyboardEvent>

  /**
   * Emits a void event when input element is blurred
   */
  @Event({ eventName: 'mdsInputFieldBlur' }) blurEvent!: EventEmitter<void>

  /**
   * Emits a void event when input element is focused
   */
  @Event({ eventName: 'mdsInputFieldFocus' }) focusEvent!: EventEmitter<void>

  componentWillLoad (): void {
    // If the mds-input has a tabindex attribute we get the value
    // and pass it down to the native input, then remove it from the
    // mds-input to avoid causing tabbing twice on the same element
    if (this.el.hasAttribute('tabindex')) {
      const tabindex = this.el.getAttribute('tabindex')
      this.tabindex = tabindex !== null ? parseInt(tabindex) : undefined
      this.el.removeAttribute('tabindex')
    }

    this.inputValidation = createInputValidationManager(this.type)
  }

  componentDidLoad (): void {
    this.nativeInput = this.el.shadowRoot?.querySelector('mds-input')?.shadowRoot?.querySelector('input')
    this.nativeInput?.setAttribute('pattern', String(this.inputValidation.pattern))
    // this.inputValidation.mask(this.nativeInput)

    // this.mdsInput?.getInputElement().then(input => this.inputValidation.mask(input as HTMLInputElement))
  }
  /**
   * Emits the change event when the component value changes
   */
  @Watch('value')
  protected valueChanged ():void {
    this.changeEvent.emit({ value: this.value })
    this.internals.setFormValue(this.value)
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
  getInputElement (): Promise<HTMLInputElement | HTMLTextAreaElement | null | undefined> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return Promise.resolve(this.nativeInput)
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

  @Method()
  async getErrors (): Promise<MdsValidationErrors | null> {
    return Promise.resolve(this.inputValidation.validator.errors)
  }

  private validateInput () {
    return this.inputValidation.isValid(this.value)
  }

  private onInput = (ev: Event) => {
    const input = ev.target as HTMLInputElement | false
    if (input) {
      this.value = input.value
      this.internals.setFormValue(this.value)
    }
    this.keyDownEvent.emit(ev as KeyboardEvent)
  }

  private onBlur = () => {
    this.hasFocus = false
    this.blurEvent.emit()
    this.isValidInput = this.validateInput()
    this.variant = this.isValidInput ? 'success' : 'error'
    if (this.inputValidation.validator.errors){
      this.message = Object.entries(this.inputValidation.validator.errors).map(v => v[1]).join('\n')
    } else {
      this.message = undefined
    }
  }

  private onFocus = (ev: Event) => {
    const input = ev.target as HTMLInputElement
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

  // component props

  /**
   * Display a text on the top of the input text field
   */
  @Prop() label?: string

  /**
   * Display a message at the bottom of the input text field
   */
  @Prop({ mutable: true }) message?: string

  /**
   * Display the variant of a message at the bottom of the input text field
   */
  @Prop({ reflect: true, mutable: true }) variant?: ThemeStatusVariantType

  /**
   * Display the variant of a message at the bottom of the input text field
   */
  @Prop() tip?: string

  render () {
    return (
      <Host>
        { this.label && <mds-text class="label" typography="label">{ this.label }</mds-text> }
        <div class={clsx('message-window', this.variant && this.message && 'message-window--opened')}>
          <mds-input
            autocomplete={this.autocomplete}
            autofocus={this.autofocus}
            await={this.await}
            class={clsx('input', this.isValidInput ? 'input-valid' : 'input-invalid')}
            controlsLayout={this.controlsLayout}
            controlsIcon={this.controlsIcon}
            disabled={this.disabled}
            icon={this.icon}
            id="field"
            max={this.max}
            maxlength={this.maxlength}
            min={this.min}
            minlength={this.minlength}
            name={this.name}
            onBlur={this.onBlur}
            onFocus={this.onFocus}
            onInput={this.onInput}
            pattern={this.pattern}
            placeholder={this.placeholder}
            readonly={this.readonly}
            // ref={ input => (this.mdsInput = input)}
            required={this.required}
            typography={this.typography}
            variant={this.variant}
            tip={this.tip}
            step={this.step}
            tabIndex={this.tabindex}
            type={this.type as InputTextType}
            value={this.value}
          />
          { this.message && <mds-text class="message" typography="caption">{ this.message }</mds-text> }
        </div>
      </Host>
    )
  }
}
