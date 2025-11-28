import { Component, Element, Host, h, Method, Prop, State, Event, EventEmitter, Watch } from '@stencil/core'
import miBaselineCalendarToday from '@icon/mi/baseline/calendar-today.svg'
import { DateTime } from 'luxon'
import { Locale } from '@common/locale'
import { ThemeInputVariantType } from '@type/variant'

// TODO add input validation manager for error message
@Component({
  tag: 'mds-input-date',
  styleUrl: 'mds-input-date.css',
  shadow: true,
})
export class MdsInputDate {
  @Element() host: HTMLMdsInputDateElement
  private isSlotted: boolean = false
  @State() isValid: boolean
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
  @Prop({ reflect: true }) value: string = ''

  /**
   * Sets the variant of the input field
   */
  @Prop({ reflect: true, mutable: true }) variant?: ThemeInputVariantType = 'primary'

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

  /**
   * If true, the element is displayed as disabled
   */
  @Prop({ reflect: true }) readonly disabled?: boolean = false

  /**
   * Specifies that the element is read-only
   */
  @Prop({ reflect: true }) readonly readonly?: boolean = false

  /**
   * Specifies that the element must be filled out before submitting the form
   */
  @Prop({ reflect: true }) readonly required?: boolean = false

  @State() calendarKey: number = 0
  @State() dropdownRef?: HTMLMdsDropdownElement
  @State() hasFocus = false
  @Event({ eventName: 'mdsInputDateSelect', bubbles: true, composed: true }) valueChange: EventEmitter<string>

  @Watch('value')
  handleValue (): void {
    this.valueChange.emit(this.value)
    this.validateValue()
  }

  private validateValue (): void {
    const date = DateTime.fromISO(this.value)

    this.isValid = false
    this.variant = 'error'
    if (date.invalid && this.required) return

    if ((this.max && DateTime.fromISO(this.max) < date) ||
    (this.min && DateTime.fromISO(this.min) > date)) return

    this.isValid = true
    this.variant = 'primary'
  }

  @Method()
  async focusInput (): Promise<void> {
    const input: HTMLInputElement = this.host.shadowRoot?.querySelector('.input') as HTMLInputElement
    input.focus()
  }

  @Method()
  async setValue (value: string): Promise<void> {
    this.value = value
    this.validateValue()
    return Promise.resolve()
  }

  componentWillLoad (): void {
    this.isSlotted = !!this.host.getAttribute('slot')
    this.value = this.value || ''
    this.language = this.t.lang(this.host)

    // Se max è precedente a min, imposto max uguale a min
    if (this.min && this.max) {
      const minDate = DateTime.fromISO(this.min)
      const maxDate = DateTime.fromISO(this.max)
      if (maxDate < minDate) {
        this.max = this.min
      }
    }
    this.validateValue()
  }

  handleChange (event: Event): void {
    const input = event.target as HTMLInputElement
    this.touched = true
    // manage case when i insert 0 on date and default input behavior change in 01 instead of resetting all date
    if (input.value) this.value = input.value
    this.validateValue()
  }

  private onBlur = (ev: Event) => {
    const input = ev.target as HTMLInputElement
    this.hasFocus = false
    this.value = input.value
  }

  private onFocus = (ev: Event) => {
    const input = ev.target as HTMLInputElement | HTMLTextAreaElement
    this.hasFocus = true
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
        <input
          value={this.value}
          id="dateInput"
          class="input"
          part="input-date"
          type="date"
          disabled={this.disabled}
          onBlur={this.onBlur}
          onFocus={this.onFocus}
          onInput={this.handleChange}
          onChange={this.handleChange}
        />
        {!this.isSlotted && <mds-button id="calendar-dropdown" class="action-open-calendar" disabled={this.disabled} variant="dark" tone="text" icon={miBaselineCalendarToday} onClick={() => {
          this.calendarKey += 1
        }}></mds-button>}
        <mds-input-tip lang={this.language} position="top" active={this.hasFocus}>
          { this.disabled && <mds-input-tip-item expanded variant="disabled"></mds-input-tip-item> }
          { this.readonly && <mds-input-tip-item expanded variant="readonly"></mds-input-tip-item> }
          { this.required &&
            <mds-input-tip-item expanded={this.hasFocus} variant={this.isValid ? 'required-success' : 'required'}></mds-input-tip-item>
          }
        </mds-input-tip>
        {!this.isSlotted && <mds-dropdown placement="bottom-end" auto-placement={false} ref={el => this.dropdownRef = el as HTMLMdsDropdownElement} target="#calendar-dropdown">
          <mds-calendar
            key={this.calendarKey}
            rangePicker={false}
            lang={this.language}
            onMdsCalendarChange={ev => {
              this.value = ev.detail.startDate

              if (this.delay === 0) return
              const { dropdownRef } = this
              if (dropdownRef) {
                setTimeout(() => {
                  dropdownRef.visible = false
                }, this.delay)
              }
            }}
            startDate={this.value}
            {...this.min ? { min: this.min } : {}}
            {...this.max ? { max: this.max } : {}}
          >
          </mds-calendar>
        </mds-dropdown>}
      </Host>
    )
  }
}
