import { Component, Element, Host, h, Prop, Watch, Listen, State } from '@stencil/core'
import miBaselineCalendarToday from '@icon/mi/baseline/calendar-today.svg'
import { FocusEvent } from 'react'

@Component({
  tag: 'mds-input-date-range',
  styleUrl: 'mds-input-date-range.css',
  shadow: true,
})
export class MdsInputDateRange {

  @Element() host: HTMLMdsInputDateRangeElement
  @Prop({ reflect: true, mutable: true }) startDate: string = ''
  @Prop({ reflect: true, mutable: true }) endDate: string = ''

  @State() showCalendar: boolean = false

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
    this.focusStartDateInput(ev)
  }

  private focusStartDateInput = (ev: MouseEvent): void => {
    ev.stopPropagation()
    this.focusInput(this.host.querySelector('mds-input-date[slot="start"]') as HTMLMdsInputDateElement)
  }

  private focusEndDateInput = (ev: MouseEvent): void => {
    ev.stopPropagation()
    this.focusInput(this.host.querySelector('mds-input-date[slot="end"]') as HTMLMdsInputDateElement)
  }

  @Listen('focusout', { target: 'body' })
  handleFocusOutEvent (ev: FocusEvent): void {
    const target = ev.target as HTMLElement

    if (target && target.closest('mds-input-date[slot="start"]')) {
      const startInput = target as HTMLMdsInputDateElement
      this.startDate = startInput.value
    }

    if (target && target.closest('mds-input-date[slot="end"]')) {
      const endInput = target as HTMLMdsInputDateElement
      this.endDate = endInput.value
    }
  }

  render () {
    return (
      <Host onClick={this.focusDateInput}>
        <div class="inputs">
          <mds-text typography="detail" onClick={this.focusStartDateInput}>Dal</mds-text>
          <div class="input-wrapper">
            <slot name="start"></slot>
          </div>
          <mds-text typography="detail" onClick={this.focusEndDateInput}>al</mds-text>
          <div class="input-wrapper">
            <slot name="end"></slot>
          </div>
        </div>

        <mds-button
          class="action-open-calendar"
          variant="dark"
          tone="quiet"
          icon={miBaselineCalendarToday}
          id="calendar-dropdown"
          onClick={() => {
            this.showCalendar = !this.showCalendar
          }}>
        </mds-button>

        <mds-dropdown target="#calendar-dropdown" strategy="fixed">
          {this.showCalendar && <mds-calendar
            rangePicker={true}
            onDatesEmitter={ev => {
              this.startDate = ev.detail.startDate
              if (ev.detail.endDate !== undefined) {
                this.endDate = ev.detail.endDate
              }
            }}
            startDate={this.startDate}
            endDate={this.endDate}>
          </mds-calendar>}
        </mds-dropdown>
      </Host>
    )
  }
}
