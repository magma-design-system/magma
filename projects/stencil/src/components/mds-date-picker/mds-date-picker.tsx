import { Component, Host, State, h, Watch, Element, Prop } from '@stencil/core'

@Component({
  tag: 'mds-date-picker',
  styleUrl: 'mds-date-picker.css',
  shadow: true,
})
export class MdsDatePicker {
  @Prop() startDate: string = ''
  @Prop() endDate: string = ''
  @State() showCalendar: boolean = false
  @Element() host!: HTMLElement

  @Watch('startDate')
  onStartDateChange (newValue: string): void {
    this.startDate = newValue
    this.updateCalendarDates()
  }

  @Watch('endDate')
  onEndDateChange (newValue: string): void {
    this.endDate = newValue
    this.updateCalendarDates()
  }

  private updateCalendarDates () {
    const calendar = this.host?.shadowRoot?.querySelector('mds-calendar')
    if (calendar) {
      calendar.startDate = this.startDate
      calendar.endDate = this.endDate
    }
  }

  render () {
    return (
      <Host>
        <mds-input-date-range onButtonToggleEmitter={ev => this.showCalendar = ev.detail } startDate={this.startDate} endDate={this.endDate}>
          <mds-input-date onValueChange={ev => this.startDate = ev.detail} slot="start" value={this.startDate}></mds-input-date>
          <mds-input-date onValueChange={ev => this.endDate = ev.detail} slot="end" value={this.endDate}></mds-input-date>
        </mds-input-date-range>
        {this.showCalendar && <mds-calendar onDatesEmitter={ev => {this.startDate = ev.detail.startDate; this.endDate = ev.detail.endDate}} startDate={this.startDate} endDate={this.endDate}></mds-calendar>}
      </Host>
    )
  }
}