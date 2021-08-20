import {
  Component,
  Element,
  Event,
  EventEmitter,
  Host,
  Method,
  Prop,
  State,
  Watch,
  h,
} from '@stencil/core'

// https://www.w3schools.com/tags/tag_input.asp
// https://github.com/ionic-team/stencil-ds-output-targets/blob/55d62af2727395cd6d729735cb9d81e5d60cc637/packages/example-project/component-library/src/components/my-input/my-input.tsx

import clsx from 'clsx'
import { AutocompleteType } from '../../types/autocomplete'
import { InputTextType } from '../../types/input-text-type'
import { InputValue } from '../../interface/input-value'
import { StatusVariantType } from '../../types/variant'
import { inputFieldStatusDictionary } from '../../dictionary/input-field-status'

@Component({
  tag: 'mds-input-field',
  styleUrl: 'mds-input-field.css',
  shadow: true,
})

export class MdsInputField {

  // inherited props

  private nativeInput?: HTMLMdsInputElement;
  private tabindex?: number;

  @Element() el!: HTMLMdsInputFieldElement;

  @State() hasFocus = false;

  /**
   * Specifies whether the element should have autocomplete enabled
   */
  @Prop() autocomplete?: AutocompleteType = 'off'

  /**
   * Specifies that the element should automatically get focus when the page loads
   */
  @Prop() autofocus?: boolean = false

  /**
   * If true, the element is displayed as disabled
   */
  @Prop() disabled?: boolean = false

  /**
   * Specifies the maximum value
   * use it with input type="number" or type="date"
   * Example: max="180", max="2046-12-04"
   */
  @Prop() max?: number

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
  @Prop() name?: string;

  /**
   * Specifies a regular expression that element\'s value is checked against
   */
  @Prop() pattern?: string

  /**
   * Specifies a short hint that describes the expected value of the element
   */
  @Prop() placeholder?: string

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
   * Specifies the value of the input element
   */
  @Prop() value?: string | number | null = ''

  /**
   * Emits an InputValue when the value of the input element changes
   */
  @Event() changeEvent!: EventEmitter<InputValue>

  /**
   * Emits a KeyboardEvent when a keboard key is pressed on the focused input element
   */
  @Event() keyDownEvent!: EventEmitter<KeyboardEvent>

  /**
   * Emits a void event when input element is blurred
   */
  @Event() blurEvent!: EventEmitter<void>

  /**
   * Emits a void event when input element is focused
   */
  @Event() focusEvent!: EventEmitter<void>

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
    this.changeEvent.emit({ value: this.value === null ? this.value : this.value.toString() })
  }

  /**
   * Sets focus on the specified `my-input`.
   * Use this method instead
   * of the global `input.focus()`.
   */
  @Method()
  async setFocus ():Promise<void> {
    if (this.nativeInput !== null) {
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

  private getValue (): string {
    return typeof this.value === 'number' ? this.value.toString() : (this.value || '').toString()
  }

  private onInput = (ev: Event) => {
    const input = ev.target as HTMLInputElement | false
    if (input) {
      this.value = input.value || ''
    }
    this.keyDownEvent.emit(ev as KeyboardEvent)
  }

  private onBlur = () => {
    this.hasFocus = false
    this.blurEvent.emit()
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
   * Display the status of a message at the bottom of the input text field
   */
  @Prop() status?: StatusVariantType

  /**
   * Display the status of a message at the bottom of the input text field
   */
  @Prop() statusTip?: string

  render () {
    const value = this.getValue()
    return (
      <Host>
        { this.label && <mds-text class="label" typography="label">{ this.label }</mds-text> }
        <div class={clsx('message-window', this.status && `message-window--opened ${inputFieldStatusDictionary[this.status]}`)}>
          <mds-input
            autocomplete={this.autocomplete}
            autofocus={this.autofocus}
            disabled={this.disabled}
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
            placeholder={this.placeholder || ''}
            readonly={this.readonly}
            ref={ input => (this.nativeInput = input)}
            required={this.required}
            status={this.status}
            statusTip={this.statusTip}
            step={this.step}
            tabIndex={this.tabindex}
            type={this.type}
            value={value}
          />
          { this.message && <mds-text class="message" typography="caption">{ this.message }</mds-text> }
        </div>
      </Host>
    )
  }
}
