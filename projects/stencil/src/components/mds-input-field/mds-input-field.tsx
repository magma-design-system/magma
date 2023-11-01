import clsx from 'clsx'
import { AttachInternals, Component, Element, Event, EventEmitter, Host, Method, Prop, State, Watch, h } from '@stencil/core'
import { AutocompleteType } from '@type/autocomplete'
import { InputTextType, InputControlsLayoutType } from '@type/input'
import { MdsInputEventDetail } from '@component/mds-input/meta/event-detail'
import { MdsInputInterface } from '@component/mds-input/mds-input'
import { ThemeStatusVariantType } from '@type/variant'
import { TypographyInputType } from '@type/typography'
import { ValidationModelType } from './meta/types'
import { modelValidator } from './meta/validators'

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
  private nativeInput?: HTMLMdsInputElement
  private tabindex?: number

  @Element() el!: HTMLMdsInputFieldElement
  @State() hasFocus = false
  @AttachInternals() internals: ElementInternals

  /**
   * Specifies whether the element should have autocomplete enabled
   */
  @Prop() autocomplete?: AutocompleteType = 'off'

  /**
   * Specifies that the element should automatically get focus when the page loads
   */
  @Prop() autofocus = false

  /**
   * Specifies the layout of the counter button when the input type is set to `number`
   */
  @Prop() readonly controlsLayout?: InputControlsLayoutType = 'vertical'

  /**
   * If true, the element is displayed as disabled
   */
  @Prop() disabled?: boolean = false

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
  @Prop() readonly?: boolean = false

  /**
   * Specifies that the element must be filled out before submitting the form
   */
  @Prop() required?: boolean = false

  /**
   * Specifies the interval between legal numbers in an input field
   */
  @Prop() step?: string

  /**
   * Specifies the type of input element
   */
  @Prop() type: InputTextType = 'text'

  /**
   * Specifies the typography of input element
   */
  @Prop() typography: TypographyInputType = 'detail'

  /**
   * Specifies the type of model data to be automatically validated
   */
  @Prop() validate?: ValidationModelType

  /**
   * Specifies the value of the input element
   */
  @Prop({ reflect: true }) value?: string = ''

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
  }

  /**
   * Emits the change event when the component value changes
   */
  @Watch('value')
  protected valueChanged ():void {
    this.changeEvent.emit({ value: this.value })
    this.internals.setFormValue(this.value ?? null)
    // this.cleanValue = this.value
    // console.log(this.cleanValue)
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
  getInputElement (): Promise<HTMLMdsInputElement> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return Promise.resolve(this.nativeInput!)
  }

  // private getValue (): string {
  //   return typeof this.value === 'number' ? this.value.toString() : (this.value ?? '')
  // }

  private mask (value: string | number | null = '' ): string | number | null {
    let i = -1
    const v = value?.toString()
    if (this.validate && v) {
      const { mask } = modelValidator[this.validate]
      let maskedChars: string

      return mask.replace(/#/g, () => {
        i += 1
        // console.log(v.length, i, v[ i ])
        // console.log(`'${mask[i]}'`)
        maskedChars = v[ i ] ?? ''
        return maskedChars
      })
    }
    return null
  }

  private onInput = (ev: Event) => {
    const input = ev.target as HTMLInputElement | false
    if (input) {
      this.value = input.value
      this.internals.setFormValue(this.value ?? null)
    }
    this.keyDownEvent.emit(ev as KeyboardEvent)

    if (this.validate !== null) {
      this.mask(this.value)
      // console.log(`"${this.mask(this.value)}"`)
    }
  }

  private onBlur = () => {
    this.hasFocus = false
    this.blurEvent.emit()

    if (this.validate !== null) {

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
  @Prop() message?: string

  /**
   * Display the variant of a message at the bottom of the input text field
   */
  @Prop() variant?: ThemeStatusVariantType

  /**
   * Display the variant of a message at the bottom of the input text field
   */
  @Prop() tip?: string

  render () {
    // const value = this.getValue()
    return (
      <Host>
        { this.label && <mds-text class="label" typography="label">{ this.label }</mds-text> }
        <div class={clsx('message-window', this.variant && this.message && 'message-window--opened')}>
          <mds-input
            autocomplete={this.autocomplete}
            autofocus={this.autofocus}
            class={clsx('input', this.validate && modelValidator[this.validate].font)}
            controlsLayout={this.controlsLayout}
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
            ref={ input => (this.nativeInput = input)}
            required={this.required}
            typography={this.typography}
            variant={this.variant}
            tip={this.tip}
            step={this.step}
            tabIndex={this.tabindex}
            type={this.type}
            value={this.value}
          />
          { this.message && <mds-text class="message" typography="caption">{ this.message }</mds-text> }
        </div>
      </Host>
    )
  }
}
