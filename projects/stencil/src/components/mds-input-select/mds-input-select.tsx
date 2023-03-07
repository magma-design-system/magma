import clsx from 'clsx'
import miBaselineKeyboardArrowDown from '@icon/mi/baseline/keyboard-arrow-down.svg'
import { Component, Event, EventEmitter, Host, Prop, h, State } from '@stencil/core'
import { InputValue } from '@interface/input-value'

@Component({
  tag: 'mds-input-select',
  styleUrl: 'mds-input-select.css',
  shadow: true,
})
export class MdsInputSelect {

  @State() selected: boolean

  /**
   * Specifies a short hint that describes the expected value of the element
   */
  @Prop() readonly placeholder?: string

  /**
   * Specifies a short hint that describes the expected value of the element
   */
  @Prop() readonly options?: string

  /**
   * Specifies the value of the element
   */
  @Prop() value?: string | number | null = ''

  /**
   * Emits an InputChangeEventDetail when the value of the input element changes
   */
  @Event({ eventName: 'mdsInputSelectChange' }) changeEvent: EventEmitter<InputValue>

  /**
    * Emits a KeyboardEvent when a keboard key is pressed on the focused input element
    */
  @Event({ eventName: 'mdsInputSelectKeydown' }) keyDownEvent: EventEmitter<KeyboardEvent>

  /**
    * Emits a void event when input element is blurred
    */
  @Event({ eventName: 'mdsInputSelectBlur' }) blurEvent: EventEmitter<void>

  /**
    * Emits a void event when input element is focused
    */
  @Event({ eventName: 'mdsInputSelectFocus' }) focusEvent: EventEmitter<void>

  private onInput = (ev: Event) => {
    const input = ev.target as HTMLSelectElement | false
    if (input) {
      this.selected = input.value !== ''
    }
  }

  private onBlur = () => {
    this.blurEvent.emit()
  }

  private onFocus = () => {
    this.focusEvent.emit()
  }

  render () {
    return (
      <Host>
        <select
          class={clsx('input', this.selected && 'input--selected')}
          onBlur={this.onBlur}
          onFocus={this.onFocus}
          onInput={this.onInput}
        >
          { this.placeholder && <option value="" disabled selected>{ this.placeholder }</option> }
          { Object.entries(JSON.parse(this.options)).map(([key, text]) =>
            <option value={ key }>{ text }</option>,
          ) }
        </select>
        <div class="icon-container">
          <i class="svg icon" innerHTML={miBaselineKeyboardArrowDown} />
        </div>
      </Host>
    )
  }
}
