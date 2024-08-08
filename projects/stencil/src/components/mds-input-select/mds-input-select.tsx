import clsx from 'clsx'
import miBaselineDone from '@icon/mi/baseline/done.svg'
import miBaselineKeyboardArrowDown from '@icon/mi/baseline/keyboard-arrow-down.svg'
import { AttachInternals, Component, Element, Event, EventEmitter, Host, Prop, h, State, Watch } from '@stencil/core'
import { InputValue } from '@interface/input-value'

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
 * Specifies the label for the displayed state disabled
 */
  @Prop({ reflect: true }) readonly disabledLabel?: string = 'disattivato'

  /**
   * Specifies that the element must be filled out before submitting the form
   */
  @Prop({ reflect: true }) readonly required?: boolean = false

  /**
   * Specifies the label for the displayed state required
   */
  @Prop({ reflect: true }) readonly requiredLabel?: string = 'obbligatorio'

  /**
   * Specifies if the select should allow multiple options to be selected in the list
   */
  @Prop({ reflect: true }) readonly multiple?: boolean = false

  /**
   * When `multiple` is set to `true`, represents the number or rows in the list that should be visible
   */
  @Prop({ reflect: true }) readonly size?: number = 0

  /**
   * Specifies the value of the element
   */
  @Prop({ reflect: true }) value?: string | number | null = ''

  /**
   * Emits an InputChangeEventDetail when the value of the input element changes
   */
  @Event({ eventName: 'mdsInputSelectChange' }) changeEvent: EventEmitter<InputValue>

  /**
   * Emits the change event when the component value changes
   */
  @Watch('value')
  protected valueChanged ():void {
    this.selected = this.value !== ''
    this.changeEvent.emit({ value: this.value })
    this.internals.setFormValue((this.value as string) ?? null)
  }

  componentDidLoad (): void {
    if (this.value) {
      this.selected = true

      this.internals.setFormValue(this.value as string)
    }
  }

  private onInput = (ev: Event) => {
    const input = ev.target as HTMLSelectElement | false
    if (input) {
      this.value = input.value
    }
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
    }
  }

  render () {
    return (
      <Host>
        <select
          class={clsx('input', this.selected && 'input--selected')}
          onInput={this.onInput.bind(this)}
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
          <i class="svg icon" innerHTML={miBaselineKeyboardArrowDown} />
        </div>
        <div class="option-container">
          <slot onSlotchange={this.onSlotChangeHandler}></slot>
        </div>
        <div class="tip-container tip-container--top">
          { this.disabled &&
            <div class="tip tip--expanded tip--disabled">
              <div class="tip__content">
                <mds-text typography="option" truncate="word">
                  <span class="tip__text">{ this.disabledLabel }</span>
                </mds-text>
              </div>
            </div>
          }
          { this.required &&
            <div class="tip tip--expand tip--required">
              <div class="tip__content">
                <mds-text typography="option" truncate="word">
                  <span class="tip__text">{ this.requiredLabel }</span>
                  <span class="tip__icon svg" innerHTML={miBaselineDone}></span>
                </mds-text>
              </div>
            </div>
          }
        </div>
      </Host>
    )
  }
}
