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
import { AutocompleteTypes, TextFieldTypes } from './interface'
export interface InputChangeEventDetail {
  value: string | number | undefined | null
}

@Component({
  tag: 'mds-input',
  styleUrl: 'mds-input.css',
  shadow: true,
})

export class MdsInput {

  private nativeInput?: HTMLInputElement;
  private tabindex?: string | number;

  @Element() el!: HTMLElement;

  @State() hasFocus = false;

  /**
   * Specifies whether the element should have autocomplete enabled
   */
  @Prop() autoComplete?: AutocompleteTypes = 'off'

  /**
   * Specifies that the element should automatically get focus when the page loads
   */
  @Prop() autoFocus?: boolean = false

  /**
   * If true, the element is displayed as disabled
   */
  @Prop() disabled?: boolean = false

  /**
   * Specifies the maximum value
   * use it with input type="number"
   * */
  @Prop() max?: string

  /**
   * Specifies the maximum number of characters allowed in an element
   * use it with input type="number"
   */
  @Prop() maxlength?: number

  /**
   * Specifies the minimum value
   * use it with input type="number"
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
   * Specifies the type of element
   */
  @Prop() type: TextFieldTypes = 'text'

  /**
   * Specifies the value of the element
   */
  @Prop({ mutable: true }) value?: string | number | null = ''

  @Event() changeEvent!: EventEmitter<InputChangeEventDetail>
  @Event() keyDownEvent!: EventEmitter<KeyboardEvent>
  @Event() blurEvent!: EventEmitter<void>
  @Event() focusEvent!: EventEmitter<void>

  componentWillLoad(): void {
    // If the mds-input has a tabindex attribute we get the value
    // and pass it down to the native input, then remove it from the
    // mds-input to avoid causing tabbing twice on the same element
    if (this.el.hasAttribute('tabindex')) {
      const tabindex = this.el.getAttribute('tabindex')
      this.tabindex = tabindex !== null ? tabindex : undefined
      this.el.removeAttribute('tabindex')
    }
  }

  /**
   * Emits the change event when the component value changes
   */
  @Watch('value')
  protected valueChanged():void {
    this.changeEvent.emit({ value: this.value === null ? this.value : this.value.toString() })
  }

  /**
   * Sets focus on the specified `my-input`.
   * Use this method instead
   * of the global `input.focus()`.
   */
  @Method()
  async setFocus():Promise<void> {
    if (this.nativeInput) {
      this.nativeInput.focus()
    }
  }

  /**
   * Returns the native `<input>` element used under the hood.
   */
  @Method()
  getInputElement(): Promise<HTMLInputElement> {
    return Promise.resolve(this.nativeInput!)
  }

  private getValue(): string {
    return typeof this.value === 'number' ? this.value.toString() : (this.value || '').toString()
  }

  private onInput = (ev: Event) => {
    const input = ev.target as HTMLInputElement | false
    if (input) {
      this.value = input.value || ''
    }
    this.keyDownEvent.emit(ev as KeyboardEvent)
  }

  private hasValue(): boolean {
    return this.getValue().length > 0
  }

  private onBlur = () => {
    this.hasFocus = false
    this.blurEvent.emit()
  }

  private onFocus = () => {
    this.hasFocus = true
    this.focusEvent.emit()
  }

  render() {
    const value = this.getValue()
    return (
      <Host aria-disabled={this.disabled ? 'true' : null}
        class={{
          'has-value': this.hasValue(),
          'has-focus': this.hasFocus,
        }}>
        <input
          autocomplete={this.autoComplete}
          autofocus={this.autoFocus}
          disabled={this.disabled}
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
          step={this.step}
          tabindex={this.tabindex}
          type={this.type}
          value={value}
        />
      </Host>
    )
  }
}
