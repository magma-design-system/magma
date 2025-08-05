import { Component, Element, Host, h, Method, Prop, State, Event, EventEmitter, Watch } from '@stencil/core'
import miBaselineCalendarToday from '@icon/mi/baseline/calendar-today.svg'
import { DateTime } from 'luxon'
import { Locale } from '@common/locale'

@Component({
  tag: 'mds-input-date',
  styleUrl: 'mds-input-date.css',
  shadow: true,
})
export class MdsInputDate {
  @Element() host: HTMLMdsInputDateElement
  private isSlotted: boolean = false
  private t:Locale = new Locale({
    el: {},
    en: {},
    es: {},
    it: {},
  })
  @State() language: string
  @State() touched: boolean = false
  @Method()
  async updateLang (): Promise<void> {
    this.language = this.t.lang(this.host)
  }

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

  /**
   * Specifies the delay in milliseconds before closing the calendar dropdown, if the value is 0 the dropdown will not close
   * @description Default is 500
   */
  @Prop({ reflect: true }) readonly delay: number = 500

  @State() empty: boolean | undefined = undefined
  @State() internalValue: string = ''
  @State() calendarKey: number = 0
  @State() dropdownRef?: HTMLMdsDropdownElement
  @Event({ eventName: 'mdsInputDateSelect', bubbles: true, composed: true }) valueChange: EventEmitter<string>

  @Watch('value')
  handleValue (newValue: string): void {
    this.internalValue = newValue
    this.validateValue(newValue)
  }

  private validateValue (value: string): void {
    const date = DateTime.fromISO(value)

    if (!this.touched) {
      this.empty = undefined
      return
    }

    if (value === '') {
      this.empty = undefined
      return
    }

    if (!date.isValid) {
      this.empty = true
    } else {
      this.empty = undefined
    }
  }

  @Method()
  async focusInput (): Promise<void> {
    const input: HTMLInputElement = this.host.shadowRoot?.querySelector('.input') as HTMLInputElement
    input.focus()
  }

  @Method()
  async setValue (value: string): Promise<void> {
    this.internalValue = value
    this.validateValue(value)
    return Promise.resolve()
  }

  componentWillLoad (): void {
    this.isSlotted = !!this.host.getAttribute('slot')
    this.internalValue = this.value || ''
    this.language = this.t.lang(this.host)

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
    this.touched = true
    this.internalValue = input.value
    this.validateValue(this.internalValue)
  }

  handleChange (event: Event): void {
    const input = event.target as HTMLInputElement
    this.touched = true
    this.internalValue = input.value
    this.validateValue(this.internalValue)
  }

  manageValue (ev: FocusEvent): void {
    const input = ev.target as HTMLInputElement
    this.internalValue = input.value
    if (!input.validity.badInput && input.value === '') {
      this.empty = undefined
    } else {
      this.empty = true
    }

    this.valueChange.emit(this.internalValue)
  }


  render () {
    return (
      <Host empty={this.empty}>
        <input
          value={this.internalValue}
          id="dateInput"
          class="input"
          part="input-date"
          type="date"
          onInput={event => this.handleInput(event)}
          onChange={event => this.handleChange(event)}
          onFocusout={event => this.manageValue(event)}
        />
        {!this.isSlotted && <mds-button id="calendar-dropdown" class="action-open-calendar" variant="dark" tone="quiet" icon={miBaselineCalendarToday} onClick={() => {
          this.calendarKey += 1
        }}></mds-button>}

        {!this.isSlotted && <mds-dropdown placement="bottom-end" auto-placement={false} ref={el => this.dropdownRef = el as HTMLMdsDropdownElement} target="#calendar-dropdown">
          <mds-calendar
            key={this.calendarKey}
            rangePicker={false}
            lang={this.language}
            onMdsCalendarChange={ev => {
              this.internalValue = ev.detail.startDate
              const date = DateTime.fromISO(this.internalValue)

              if (!date.isValid) {
                this.empty = true
              } else {
                this.empty = undefined
              }

              this.valueChange.emit(this.internalValue)
              if (this.delay === 0) return
              const { dropdownRef } = this
              if (dropdownRef) {
                setTimeout(() => {
                  dropdownRef.visible = false
                }, this.delay)
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
