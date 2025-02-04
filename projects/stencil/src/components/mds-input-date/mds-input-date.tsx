import { Component, Element, Host, h, Method, Prop, State, Event, EventEmitter, Watch } from '@stencil/core'
import miBaselineCalendarToday from '@icon/mi/baseline/calendar-today.svg'

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
    this.value = input.value
    this.valueChange.emit(this.value)
  }

  componentWillLoad (): void {
    this.isSlotted = !!this.host.getAttribute('slot')
    this.internalValue = this.value || ''
  }

  render () {
    return (
      <Host>
        <input
          value={this.internalValue}
          class="input"
          type="date"
          onInput={event => this.handleInput(event)}
          onChange={event => this.handleChange(event)}
        />
        {!this.isSlotted && <mds-button class="action-open-calendar" variant="dark" tone="quiet" icon={miBaselineCalendarToday}></mds-button>}
      </Host>
    )
  }
}
