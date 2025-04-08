import { Component, Element, Host, h, Method, Prop, State, Event, EventEmitter, Watch } from '@stencil/core'
import miBaselineCalendarToday from '@icon/mi/baseline/calendar-today.svg'
import { DateTime } from 'luxon'

@Component({
  tag: 'mds-input-date',
  styleUrl: 'mds-input-date.css',
  shadow: true,
})
export class MdsInputDate {
  @Element() host: HTMLMdsInputDateElement
  private isSlotted: boolean = false

  /**
   * Specifies the value of the input
   * @description It's in ISO format (YYYY-MM-DD).
   */
  @Prop({ reflect: true }) readonly value: string = ''

  /**
   * Specifies the min date of the range, user cannot set dates before this date
   * @description It's in ISO format (YYYY-MM-DD).
   */
  @Prop({ reflect: true, mutable: true }) min: string | null = null

  /**
   * Specifies the max date of the range, user cannot set dates after this date
   * @description It's in ISO format (YYYY-MM-DD).
   */
  @Prop({ reflect: true, mutable: true }) max: string | null = null

  @State() empty: boolean | undefined = undefined
  @State() internalValue: string = ''
  @State() calendarKey: number = 0
  @State() dropdownRef?: HTMLMdsDropdownElement
  @State() messageError: string = ''
  @Event() valueChange: EventEmitter<string>

  @Watch('value')
  handleValue (newValue: string): void {
    this.internalValue = newValue
    const date = DateTime.fromISO(newValue)

    if (!date.isValid) {
      this.empty = true
    } else {
      this.empty = false
    }
  }

  @Method()
  async focusInput (): Promise<void> {
    const input: HTMLInputElement = this.host.shadowRoot?.querySelector('.input') as HTMLInputElement
    input.focus()
  }

  componentWillLoad (): void {
    this.isSlotted = !!this.host.getAttribute('slot')
    this.internalValue = this.value || ''

    // Se max è precedente a min, imposto max uguale a min
    if (this.min && this.max) {
      const minDate = DateTime.fromISO(this.min)
      const maxDate = DateTime.fromISO(this.max)
      if (maxDate < minDate) {
        this.max = this.min
      }
    }
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

  manageValue (ev: FocusEvent): void {
    const input = ev.target as HTMLInputElement
    if (!input.validity.badInput && input.value !== '') {
      this.messageError = ''
      this.valueChange.emit(this.internalValue)
      this.empty = undefined
    } else {
      this.messageError = input.validationMessage
      this.empty = true
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

        {!this.isSlotted && <mds-dropdown ref={el => this.dropdownRef = el as HTMLMdsDropdownElement} target="#calendar-dropdown">
          <mds-calendar
            key={this.calendarKey}
            rangePicker={false}
            onDatesEmitter={ev => {
              this.internalValue = ev.detail.startDate
              const date = DateTime.fromISO(this.internalValue)

              if (!date.isValid) {
                this.empty = true
              } else {
                this.empty = false
              }

              this.valueChange.emit(this.internalValue)
              const { dropdownRef } = this
              if (dropdownRef) {
                setTimeout(() => {
                  dropdownRef.visible = false
                }, 500)
              }
            }}
            startDate={this.internalValue}
            {...this.min ? { min: this.min } : {}}
            {...this.max ? { max: this.max } : {}}
          >
          </mds-calendar>
        </mds-dropdown>}
      </Host>
    )
  }
}
