import { Component, Element, Host, h, Event, EventEmitter, State, Prop } from '@stencil/core'
import miBaselineCalendarToday from '@icon/mi/baseline/calendar-today.svg'

@Component({
  tag: 'mds-input-date-range',
  styleUrl: 'mds-input-date-range.css',
  shadow: true,
})
export class MdsInputDateRange {

  @Element() host: HTMLMdsInputDateRangeElement
  @Prop({ reflect: true, mutable: true }) startDate: string = ''
  @Prop({ reflect: true, mutable: true }) endDate: string = ''

  @Event() buttonToggleEmitter: EventEmitter<boolean>
  @State() buttonValue: boolean = false

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

  manageButtonValue (): void {
    this.buttonValue = !this.buttonValue
    this.buttonToggleEmitter.emit(this.buttonValue)
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
        <mds-button class="action-open-calendar" variant="dark" tone="quiet" icon={miBaselineCalendarToday} onClick={() => this.manageButtonValue()}></mds-button>
      </Host>
    )
  }
}
