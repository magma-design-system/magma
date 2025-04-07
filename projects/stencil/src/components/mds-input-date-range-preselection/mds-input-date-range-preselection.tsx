import { Component, Host, Prop, h, Element } from '@stencil/core'

@Component({
  tag: 'mds-input-date-range-preselection',
  styleUrl: 'mds-input-date-range-preselection.css',
  shadow: true,
})
export class MdsInputDateRangePreselection {


  @Prop({ reflect: true }) readonly start!: string
  @Prop({ reflect: true }) readonly end?: string

  @Element() host: HTMLElement

  private onClick = (event: MouseEvent) => {
    event.stopPropagation()
    const mdsInputDateRange = this.host?.closest('mds-input-date-range')
    if (mdsInputDateRange) {
      mdsInputDateRange.preselect( { start: this.start, end: this.end } )
    }
  }

  render () {
    return (
      <Host slot="calendar-preselection">
        <mds-button onClick={this.onClick} variant="dark" tone="quiet">
          <slot></slot>
        </mds-button>
      </Host>
    )
  }
}
