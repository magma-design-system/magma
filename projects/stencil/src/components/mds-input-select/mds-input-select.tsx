import clsx from 'clsx'
import miBaselineKeyboardArrowDown from '@icon/mi/baseline/keyboard-arrow-down.svg'
import { AttachInternals, Component, Element, Event, EventEmitter, Host, Prop, h, State, Watch } from '@stencil/core'
import { MdsInputEventDetail } from '@type/input'
import { ThemeStatusVariantType } from '@type/variant'

/**
 * @part select - The select HTML element
 */

@Component({
  tag: 'mds-input-select',
  styleUrl: 'mds-input-select.css',
  formAssociated: true,
  shadow: true,
})
export class MdsInputSelect {

  @Element() host: HTMLMdsInputSelectElement
  @State() selected: boolean
  @State() hasFocus = false
  @AttachInternals() internals: ElementInternals

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
   * Sets the variant of the component
   */
  @Prop({ reflect: true }) readonly variant?: ThemeStatusVariantType

  /**
   * Emits an InputChangeEventDetail when the value of the input element changes
   */
  @Event({ eventName: 'mdsInputSelectChange' }) changeEvent: EventEmitter<MdsInputEventDetail>

  /**
   * Emits the change event when the component value changes
   */
  @Watch('value')
  protected valueChanged ():void {
    this.selected = this.value !== ''
    this.changeEvent.emit({ value: this.value?.toString() })
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

  formResetCallback (): void {
    this.internals.setFormValue('')
  }

  componentDidLoad (): void {
    if (this.value) {
      this.selected = true

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
    const select = this.host.shadowRoot?.querySelector('select')
    const options = select?.querySelectorAll('option')

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
      select?.appendChild(element.cloneNode(true))
    })

    /**
     * I found only this way to make the `select` element SEE the
     * selected option that we wanted as a default
     */
    if (this.value){
      select?.querySelectorAll('option').forEach((element: HTMLOptionElement) => {
        element.selected = element.value === this.value
      })
    } else if (!this.placeholder) {
      this.value = select?.querySelectorAll('option')[0].value
    }
  }

  render () {
    return (
      <Host>
        <select
          class={clsx('input', this.selected && 'input--selected')}
          onInput={this.onInput.bind(this)}
          onBlur={this.onBlur}
          onFocus={this.onFocus}
          name={this.name}
          required={this.required}
          disabled={this.disabled}
          multiple={this.multiple}
          size={this.size}
          part="select"
        >
          { this.placeholder && <option value="" disabled selected>{ this.placeholder }</option> }
        </select>
        <div class="icon-container">
          <i class="icon" innerHTML={miBaselineKeyboardArrowDown} />
        </div>
        <div class="option-container">
          <slot onSlotchange={this.onSlotChangeHandler}></slot>
        </div>
        <mds-input-tip position="top" active={this.hasFocus}>
          { this.disabled && <mds-input-tip-item expanded variant="disabled"></mds-input-tip-item> }
          { this.required &&
            <mds-input-tip-item expanded={this.hasFocus} variant={this.value === '' ? 'required' : 'required-success'}></mds-input-tip-item>
          }
        </mds-input-tip>
      </Host>
    )
  }
}
