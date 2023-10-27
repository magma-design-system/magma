import clsx from 'clsx'
import { AttachInternals, Component, Element, Event, EventEmitter, Host, Method, Prop, State, Watch, h } from '@stencil/core'
import { AutocompleteType } from '@type/autocomplete'
import { InputTextType } from '@type/input-text-type'
import { ThemeStatusVariantType } from '@type/variant'
import { MdsInputEventDetail } from './meta/event-detail'

export interface MdsInputInterface {
  placeholder?: string
  type: InputTextType
  required?: boolean
  autocomplete?: AutocompleteType
  autofocus?: boolean
  datalist?: string[]
  disabled?: boolean
  icon?: string
  max?: string
  maxLength?: number
  min?: string
  minLength?: number
  name?: string
  pattern?: string
  readOnly?: boolean
  step?: string
  variant?: ThemeStatusVariantType
  tip?: string
  value?: string
  tabindex?: number
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
  @Element() el!: HTMLMdsInputElement
  @State() hasFocus = false

  @AttachInternals() internals: ElementInternals

  /**
   * Specifies whether the element should have autocomplete enabled
   */
  @Prop() readonly autocomplete?: AutocompleteType = 'off'

  /**
   * Specifies that the element should automatically get focus when the page loads
   */
  @Prop() readonly autofocus: boolean = false

  /**
   * A list of search terms to be searched from the input field,
   * it should be used with type="search" input.
   */
  @Prop() readonly datalist?: string[]

  /**
   * If true, the element is displayed as disabled
   */
  @Prop() readonly disabled?: boolean = false

  /**
   * An icon displayed at the right of the input
   */
  @Prop() readonly icon?: string

  /**
   * Specifies the maximum value
   * use it with input type="number" or type="date"
   * Example: max="180", max="2046-12-04"
   */
  @Prop() readonly max?: string

  /**
   * Specifies the maximum number of characters allowed in an element
   * use it with input type="number"
   */
  @Prop() readonly maxlength?: number

  /**
   * Specifies the minimum value
   * use it with input type="number" or type="date"
   * Example: min="-3", min="1988-04-15"
   */
  @Prop() readonly min?: string | number

  /**
   * Specifies the minimum number of characters allowed in an element
   * use it with input type="number"
   */
  @Prop() readonly minlength?: number

  /**
   * Is needed to reference the form data after the form is submitted
   */
  @Prop() readonly name?: string

  /**
   * Specifies a regular expression that element\'s value is checked against
   */
  @Prop() readonly pattern?: string

  /**
   * Specifies a short hint that describes the expected value of the element
   */
  @Prop() readonly placeholder: string = ''

  /**
   * Specifies that the element is read-only
   */
  @Prop() readonly readonly?: boolean = false

  /**
   * Specifies that the element must be filled out before submitting the form
   */
  @Prop() readonly required?: boolean = false

  /**
   * Sets the variant of the input field
   */
  @Prop({ reflect: true }) readonly variant?: ThemeStatusVariantType

  /**
   * Sets the word(s) of the tip of the input field
   */
  @Prop() readonly tip?: string

  /**
   * Specifies the interval between legal numbers in an input field
   */
  @Prop() readonly step?: string

  /**
   * Specifies the type of input element
   */
  @Prop() readonly type?: InputTextType = 'text'

  /**
   * Specifies the value of the input element
   */
  @Prop({ reflect: true }) value?: string = ''

  /**
   * Emits an InputChangeEventDetail when the value of the input element changes
   */
  @Event({ eventName: 'mdsInputChange' }) changeEvent!: EventEmitter<MdsInputEventDetail>

  /**
   * Emits a KeyboardEvent when a keboard key is pressed on the focused input element
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

  componentWillLoad (): void {
    // If the mds-input has a tabindex attribute we get the value
    // and pass it down to the native input, then remove it from the
    // mds-input to avoid causing tabbing twice on the same element
    if (this.el.hasAttribute('tabindex')) {
      const tabindex = this.el.getAttribute('tabindex')
      this.tabindex = tabindex !== null ? parseInt(tabindex) : undefined
      this.el.removeAttribute('tabindex')
    }
    this.internals.setFormValue(this.value ?? null)
  }

  /**
   * Emits the change event when the component value changes
   */
  @Watch('value')
  protected valueChanged ():void {
    this.changeEvent.emit({ value: this.value })
    this.internals.setFormValue(this.value ?? null)
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
    this.blurEvent.emit()
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

  render () {
    return (
      <Host>
        { this.type === 'textarea'
          ? <textarea
            class={clsx(
              'input',
              this.icon && 'has-icon',
            )}
            autoFocus={this.autofocus}
            disabled={this.disabled}
            maxLength={this.maxlength}
            minLength={this.minlength}
            name={this.name}
            onBlur={this.onBlur}
            onFocus={this.onFocus}
            onInput={this.onInput}
            placeholder={this.placeholder}
            readOnly={this.readonly}
            ref={ input => (this.nativeInput = input)}
            required={this.required}
            tabIndex={this.tabindex}
            value={this.value}>
          </textarea>
          : <input
            class={clsx(
              'input',
              this.icon && 'has-icon',
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
            placeholder={this.placeholder}
            readOnly={this.readonly}
            ref={ input => (this.nativeInput = input)}
            required={this.required}
            step={this.step}
            tabIndex={this.tabindex}
            type={this.type}
            value={this.value}
          />
        }
        { this.disabled && <mds-text typography="option" class="tip top-1 disabled">Disabilitato</mds-text> }
        { this.readonly && !this.disabled && <mds-text typography="option" class="tip top-1 read-only">Sola lettura</mds-text> }
        { this.required && !this.disabled && !this.readonly && <mds-text typography="option" class="tip top-1 required">Obbligatorio</mds-text> }
        { this.tip && <mds-text typography="option" class={clsx('tip bottom-1', this.variant && 'tip-variant')}>{ this.tip }</mds-text> }
        { this.datalist &&
          <datalist id="datalist" class="datalist">
            { this.datalist.forEach(element => {
              <option value={element}/>
            })}
          </datalist>
        }
        { this.icon && <mds-icon class={clsx('icon', this.variant)} name={this.icon}/> }
      </Host>
    )
  }
}
