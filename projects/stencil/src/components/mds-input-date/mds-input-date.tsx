import { Component, Element, Host, h, Method, Prop, State, Event, EventEmitter, Watch } from '@stencil/core'
import miBaselineCalendarToday from '@icon/mi/baseline/calendar-today.svg'
/* import { DateTime } from 'luxon' */


@Component({
  tag: 'mds-input-date',
  styleUrl: 'mds-input-date.css',
  shadow: true,
})
export class MdsInputDate {
  @Element() host: HTMLMdsInputDateElement
  private isSlotted: boolean = false

  @Prop({ reflect: true, mutable: true }) value: string = ''

  @State() internalValue: string = ''
  @State() calendarKey: number = 0
  @State() dropdownRef?: HTMLMdsDropdownElement
  @State() messageError: string = ''
  @Event() valueChange: EventEmitter<string>


  @Method()
  async focusInput (): Promise<void> {
    const input: HTMLInputElement = this.host.shadowRoot?.querySelector('.input') as HTMLInputElement
    input.focus()
  }

  @Watch('value')
  valueChanged (newValue: string): void {
    this.internalValue = newValue
  }

  handleInput (event: Event): void {
    const input = event.target as HTMLInputElement
    this.internalValue = input.value
  }

  handleChange (event: Event): void {
    const input = event.target as HTMLInputElement
    this.internalValue = input.value
    this.valueChange.emit(this.internalValue)
  }

  componentWillLoad (): void {
    this.isSlotted = !!this.host.getAttribute('slot')
    this.internalValue = this.value || ''
  }


  manageValue (ev: FocusEvent): void {
    const input = ev.target as HTMLInputElement
    if (!input.validity.badInput) {
      this.messageError = ''
      this.valueChange.emit(this.value)
    } else {
      this.messageError = input.validationMessage
    }
  }

  render () {
    return (
      <Host>
        <input
          value={this.internalValue}
          id="dateInput"
          class="input"
          type="date"
          onInput={event => this.handleInput(event)}
          onChange={event => this.handleChange(event)}
          onFocusout={event => this.manageValue(event)}
        />
        {!this.isSlotted && <mds-button id="calendar-dropdown" class="action-open-calendar" variant="dark" tone="quiet" icon={miBaselineCalendarToday} onClick={() => {
          this.calendarKey += 1
        }}></mds-button>}

        <mds-dropdown ref={el => this.dropdownRef = el as HTMLMdsDropdownElement} target="#calendar-dropdown">
          <mds-calendar
            key={this.calendarKey}
            rangePicker={false}
            onDatesEmitter={ev => {
              this.value = ev.detail.startDate
              this.valueChange.emit(this.value)
              if (this.dropdownRef) this.dropdownRef.visible = false
            }}
            startDate={this.value}>
          </mds-calendar>
        </mds-dropdown>

      </Host>
    )
  }
}
