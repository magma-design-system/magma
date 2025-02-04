import { Component, Element, Host, h, Method, Prop } from '@stencil/core'
import miBaselineCalendarToday from '@icon/mi/baseline/calendar-today.svg'

@Component({
  tag: 'mds-input-date',
  styleUrl: 'mds-input-date.css',
  shadow: true,
})
export class MdsInputDate {
  @Element() host: HTMLMdsInputDateElement
  private isSlotted: boolean = false

  @Prop({ reflect: true, mutable: true }) value: string

  @Method()
  async focusInput (): Promise<void> {
    const input: HTMLInputElement = this.host.shadowRoot?.querySelector('.input') as HTMLInputElement
    input.focus()
  }

  componentWillLoad (): void {
    this.isSlotted = !!this.host.getAttribute('slot')
  }

  render () {
    return (
      <Host>
        <input value={this.value} class="input" type="date"></input>
        { this.isSlotted === false && <mds-button class="action-open-calendar" variant="dark" tone="quiet" icon={miBaselineCalendarToday}></mds-button> }
      </Host>
    )
  }
}
