import clsx from 'clsx'
import miBaselineKeyboardArrowDown from '@icon/mi/baseline/keyboard-arrow-down.svg'
import { AttachInternals, Component, Element, Event, EventEmitter, Host, Prop, h, State, Watch } from '@stencil/core'
import { InputValue } from '@interface/input-value'

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
    this.changeEvent.emit({ value: this.value })
    this.internals.setFormValue((this.value as string) ?? null)
  }

  private onInput = (ev: Event) => {
    const input = ev.target as HTMLSelectElement | false
    if (input) {
      this.selected = input.value !== ''
      this.value = input.value
      // this.internals.setFormValue(input.value)
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

    elements?.forEach((element: HTMLElement) => {
      select?.appendChild(element.cloneNode(true))
    })
  }

  render () {
    return (
      <Host>
        <select
          class={clsx('input', this.selected && 'input--selected')}
          onInput={this.onInput.bind(this)}
        >
          { this.placeholder && <option value="" disabled selected>{ this.placeholder }</option> }
        </select>
        <div class="icon-container">
          <i class="svg icon" innerHTML={miBaselineKeyboardArrowDown} />
        </div>
        <div class="option-container">
          <slot onSlotchange={this.onSlotChangeHandler}></slot>
        </div>
      </Host>
    )
  }
}
