import { Component, Element, Host, h, Prop, Watch, Listen, State, Event, EventEmitter } from '@stencil/core'
import miBaselineCalendarToday from '@icon/mi/baseline/calendar-today.svg'
import { FocusEvent } from 'react'

@Component({
  tag: 'mds-input-date-range',
  styleUrl: 'mds-input-date-range.css',
  shadow: true,
})
export class MdsInputDateRange {

  @Element() host: HTMLMdsInputDateRangeElement

  @State() calendarKey: number = 0

  @Prop({ reflect: true, mutable: true }) startDate: string = ''
  @Prop({ reflect: true, mutable: true }) endDate: string = ''

  @Event() dateRangeSelected: EventEmitter<{ startDate: string, endDate: string }>

  @State() isStartFocused: boolean = false
  @State() isEndFocused: boolean = false

  @State() dropdownRef?: HTMLMdsDropdownElement

  private previousStartDate: string = ''
  private previousEndDate: string = ''

  @Watch('startDate')
  onStartDateChange (newValue: string): void {
    this.startDate = newValue
    const startInput = this.host.querySelector('mds-input-date[slot="start"]') as HTMLMdsInputDateElement
    startInput.value = this.startDate
  }

  @Watch('endDate')
  onEndDateChange (newValue: string): void {
    this.endDate = newValue
    const endInput = this.host.querySelector('mds-input-date[slot="end"]') as HTMLMdsInputDateElement
    endInput.value = this.endDate
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

  @Listen('focusin', { target: 'body' })
  handleFocusInEvent (ev: FocusEvent): void {
    const target = ev.target as HTMLElement
    if (target.closest('mds-input-date[slot="start"]')) {
      this.isStartFocused = true
    }
    if (target.closest('mds-input-date[slot="end"]')) {
      this.isEndFocused = true
    }
  }

  @Listen('focusout', { target: 'body' })
  handleFocusOutEvent (ev: FocusEvent): void {
    const target = ev.target as HTMLElement

    if (target && target.closest('mds-input-date[slot="start"]')) {
      this.isStartFocused = false
      const startInput = target as HTMLMdsInputDateElement
      this.startDate = startInput.value
    }

    if (target && target.closest('mds-input-date[slot="end"]')) {
      this.isEndFocused = false
      const endInput = target as HTMLMdsInputDateElement
      this.endDate = endInput.value
    }

    setTimeout(() => {
      if (!this.isStartFocused && !this.isEndFocused) {
        if (this.startDate && this.endDate && this.endDate < this.startDate) {
          this.endDate = this.startDate
        }

        if (this.startDate !== this.previousStartDate || this.endDate !== this.previousEndDate) {
          this.previousStartDate = this.startDate
          this.previousEndDate = this.endDate

          this.dateRangeSelected.emit({
            startDate: this.startDate,
            endDate: this.endDate,
          })
        }
      }

    }, 0)
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
              this.startDate = ev.detail.startDate
              if (ev.detail.endDate !== undefined) {
                this.endDate = ev.detail.endDate
              }

              if (this.startDate && this.endDate) {
                this.dateRangeSelected.emit({
                  startDate: this.startDate,
                  endDate: this.endDate,
                })

                if (this.dropdownRef) {
                  this.dropdownRef.visible = false
                }
              }
            }}
            startDate={this.startDate}
            endDate={this.endDate}>
          </mds-calendar>
        </mds-dropdown>
      </Host>
    )
  }
}
