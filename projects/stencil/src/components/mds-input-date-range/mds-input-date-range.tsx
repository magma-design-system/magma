import { Component, Element, Host, h, Prop, State, Event, EventEmitter } from '@stencil/core'
import miBaselineCalendarToday from '@icon/mi/baseline/calendar-today.svg'
import { DateTime } from 'luxon'

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

  @Prop({ reflect: true }) startDate: string = ''
  @Prop({ reflect: true }) endDate: string = ''

  @Event() dateRangeSelected: EventEmitter<{ startDate: string, endDate: string }>

  componentWillLoad (): void {
    this.internalStartDate = this.startDate
    this.internalEndDate = this.endDate
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

  render () {
    return (
      <Host>
        <div class="inputs">
          <div class="input-element">
            <mds-text class="date-label" typography="detail">Dal</mds-text>
            <div class="input-wrapper">
              <slot name="start"></slot>
            </div>
          </div>
          <div class="input-element">
            <mds-text class="date-label" typography="detail">al</mds-text>
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
                if (this.dropdownRef) this.dropdownRef.visible = false
              }
            }}
            startDate={this.internalStartDate}
            endDate={this.internalEndDate}>
          </mds-calendar>
        </mds-dropdown>
      </Host>
    )
  }
}
