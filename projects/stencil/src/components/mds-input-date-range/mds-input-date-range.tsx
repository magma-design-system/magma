import { Component, Element, Host, h, Prop, State, Event, EventEmitter, Method } from '@stencil/core'
import miBaselineCalendarToday from '@icon/mi/baseline/calendar-today.svg'
import { DateTime } from 'luxon'
import clsx from 'clsx'

export interface EventDate {
  caller: HTMLMdsInputDateRangePreselectionElement
  start: string,
  end?: string
}

@Component({
  tag: 'mds-input-date-range',
  styleUrl: 'mds-input-date-range.css',
  shadow: true,
})
export class MdsInputDateRange {
  @Element() host: HTMLMdsInputDateRangeElement

  @State() calendarKey: number = 0
  @State() internalStartDate: string = ''
  @State() internalEndDate: string = ''
  @State() dropdownRef?: HTMLMdsDropdownElement
  @State() hasPreselection: boolean = false

  /**
   * Specifies the start date of the range
   * @description It's in ISO format (YYYY-MM-DD).
   */
  @Prop({ reflect: true }) startDate: string = ''

  /**
   * Specifies the end date of the range
   * @description It's in ISO format (YYYY-MM-DD).
   */
  @Prop({ reflect: true }) endDate: string = ''

  /**
   * Specifies the min date of the range, user cannot set dates before this date
   * @description It's in ISO format (YYYY-MM-DD).
   */
  @Prop({ reflect: true }) min: string | null = null

  /**
   * Specifies the max date of the range, user cannot set dates after this date
   * @description It's in ISO format (YYYY-MM-DD).
   */
  @Prop({ reflect: true }) max: string | null = null

  /**
   * Specifies the delay in milliseconds before closing the calendar dropdown, if the value is 0 the dropdown will not close
   * @description Default is 500
   */
  @Prop({ reflect: true }) readonly delay: number = 500

  private togglePreselection: HTMLMdsInputDateRangePreselectionElement[]

  @Event() dateRangeSelected: EventEmitter<{ startDate: string, endDate: string }>

  componentWillLoad (): void {
    this.internalStartDate = this.startDate
    this.internalEndDate = this.endDate

    // Se max è precedente a min, imposto max uguale a min
    if (this.min && this.max) {
      const minDate = DateTime.fromISO(this.min)
      const maxDate = DateTime.fromISO(this.max)
      if (maxDate < minDate) {
        this.max = this.min
      }
    }
  }

  @Method() async preselect (event: EventDate): Promise<void> {

    if (!this.togglePreselection) {
      this.togglePreselection = Array.from(this.host.querySelectorAll('mds-input-date-range-preselection'))
    }

    this.togglePreselection.forEach((element: HTMLMdsInputDateRangePreselectionElement) => {
      element.selected = false
    })

    event.caller.selected = true

    const startDate = DateTime.fromISO(event.start)

    if (startDate.isValid) {
      this.internalStartDate = event.start
      this.updateInputValue('start', this.internalStartDate)
    }

    if (event.end !== undefined) {
      const endDate = DateTime.fromISO(event.end)
      if (endDate.isValid) {
        this.internalEndDate = event.end
      }
    } else {
      this.internalEndDate = event.start
    }
    this.updateInputValue('end', this.internalEndDate)

    const calendar = this.host?.shadowRoot?.querySelector('mds-calendar')

    if (calendar) {
      await calendar.updateCurrentDate(this.internalStartDate)
      if (this.delay === 0) return
      const { dropdownRef } = this
      if (dropdownRef) {
        setTimeout(() => {
          dropdownRef.visible = false
        }, this.delay)
      }
    }
    return Promise.resolve()
  }

  private focusInput = (element: HTMLMdsInputDateElement): void => {
    element.focusInput()
  }

  private focusDateInput = (ev: MouseEvent): void => {
    if (ev.target !== this.host) {
      return
    }
    this.focusStartDateInput(ev)
  }

  private focusStartDateInput = (ev: MouseEvent): void => {
    ev.preventDefault()
    ev.stopPropagation()
    this.focusInput(this.host.querySelector('mds-input-date[slot="start"]') as HTMLMdsInputDateElement)
  }

  private focusEndDateInput = (ev: MouseEvent): void => {
    ev.preventDefault()
    ev.stopPropagation()
    this.focusInput(this.host.querySelector('mds-input-date[slot="end"]') as HTMLMdsInputDateElement)
  }

  componentDidLoad (): void {
    this.updateInputListeners()
  }

  private updateInputValue (slotName: string, newValue: string): void {
    const slot = this.host.shadowRoot?.querySelector(`slot[name="${slotName}"]`) as HTMLSlotElement
    const input = slot?.assignedElements()[0] as HTMLMdsInputDateElement
    if (input) {
      input.value = newValue
    }
  }

  private updateInputListeners (): void {
    const startSlot = this.host.shadowRoot?.querySelector('slot[name="start"]') as HTMLSlotElement
    const endSlot = this.host.shadowRoot?.querySelector('slot[name="end"]') as HTMLSlotElement
    this.hasPreselection = this.host.querySelector('mds-input-date-range-preselection') !== null

    if (startSlot) {
      const input = startSlot?.assignedElements()[0] as HTMLMdsInputDateElement

      const focusOutListener = this.createFocusoutListener('start')
      const valueChangeListener = (ev: CustomEvent) => this.createValueChangeListener('start', ev)
      input.addEventListener('focusout', focusOutListener)
      input.addEventListener('valueChange', valueChangeListener)
    }

    if (endSlot) {
      const input = endSlot?.assignedElements()[0] as HTMLMdsInputDateElement

      const focusOutListener = this.createFocusoutListener('end')
      const valueChangeListener = (ev: CustomEvent) => this.createValueChangeListener('end', ev)
      input.addEventListener('focusout', focusOutListener)
      input.addEventListener('valueChange', valueChangeListener)
    }
  }

  private createValueChangeListener (slotName: 'start' | 'end', event: CustomEvent): void {
    const slot = this.host.shadowRoot?.querySelector(`slot[name="${slotName}"]`) as HTMLSlotElement
    const input = slot?.assignedElements()[0] as HTMLMdsInputDateElement

    if (input) {
      input.value = event.detail
    }
  }

  private createFocusoutListener (slotName: 'start' | 'end'): EventListener {
    return () => {
      this.updateInternalDateValues(slotName)
      this.validateDateRange()
    }
  }

  private updateInternalDateValues (slotName: 'start' | 'end'): void {
    const slot = this.host.shadowRoot?.querySelector(`slot[name="${slotName}"]`) as HTMLSlotElement
    const input = slot?.assignedElements()[0] as HTMLMdsInputDateElement

    if (input) {
      const newValue = input.value

      if (slotName === 'start') {
        this.internalStartDate = newValue
      } else if (slotName === 'end') {
        this.internalEndDate = newValue
      }

      this.checkPreselections()
    }
  }

  private validateDateRange (): void {
    if (this.internalStartDate && this.internalEndDate) {
      const start = DateTime.fromISO(this.internalStartDate)
      const end = DateTime.fromISO(this.internalEndDate)

      if (end < start) {
        this.internalEndDate = this.internalStartDate
        this.updateInputValue('end', this.internalEndDate)

      }
    }
  }

  private checkPreselections (): void {
    const preselections = Array.from(this.host.querySelectorAll('mds-input-date-range-preselection'))

    if (preselections) {
      preselections.forEach(element => {
        const preselection = element

        const isSameRange =
          preselection.start === this.internalStartDate &&
          preselection.end === this.internalEndDate

        const isSingleDayMatch =
          preselection.start === this.internalStartDate &&
          this.internalStartDate === this.internalEndDate &&
          preselection.end === undefined

        if (isSameRange || isSingleDayMatch) {
          preselection.selected = true
        } else {
          preselection.selected = false
        }
      })
    }
  }

  render () {
    return (
      <Host onClick={this.focusDateInput}>
        <div class="inputs">
          <div class="input-element">
            <mds-text class="date-label" typography="detail" onClick={this.focusStartDateInput}>Dal</mds-text>
            <div class="input-wrapper">
              <slot name="start"></slot>
            </div>
          </div>
          <div class="input-element">
            <mds-text class="date-label" typography="detail" onClick={this.focusEndDateInput}>al</mds-text>
            <div class="input-wrapper">
              <slot name="end"></slot>
            </div>
          </div>
        </div>

        <mds-button
          class="action-open-calendar"
          variant="dark"
          tone="quiet"
          icon={miBaselineCalendarToday}
          id="calendar-dropdown"
          onClick={() => {
            this.calendarKey += 1
          }}>
        </mds-button>

        <mds-dropdown ref={el => this.dropdownRef = el as HTMLMdsDropdownElement} target="#calendar-dropdown">
          <mds-calendar
            key={this.calendarKey}
            rangePicker={true}
            onDatesEmitter={ev => {
              this.internalStartDate = ev.detail.startDate
              this.updateInputValue('start', this.internalStartDate)
              if (ev.detail.endDate) {
                this.internalEndDate = ev.detail.endDate
                this.updateInputValue('end', this.internalEndDate)
              }

              if (this.internalStartDate && this.internalEndDate) {
                this.dateRangeSelected.emit({
                  startDate: this.internalStartDate,
                  endDate: this.internalEndDate,
                })
                if (this.delay === 0) return
                const { dropdownRef } = this
                if (dropdownRef) {
                  setTimeout(() => {
                    dropdownRef.visible = false
                  }, this.delay)
                }
              }
            }}
            onCheckPreselectionsEmitter={() => {
              this.checkPreselections()
            }}
            startDate={this.internalStartDate}
            endDate={this.internalEndDate}
            {...(this.min ? { min: this.min } : {})}
            {...(this.max ? { max: this.max } : {})}
          >
            <div slot="preselection" class={clsx('date-preselection', this.hasPreselection && 'date-preselection--has-preselection')}>
              <slot name="calendar-preselection"></slot>
            </div>
          </mds-calendar>
        </mds-dropdown>
      </Host>
    )
  }
}
