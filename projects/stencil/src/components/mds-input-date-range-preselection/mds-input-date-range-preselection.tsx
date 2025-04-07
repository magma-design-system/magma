import { Component, Host, Prop, h } from '@stencil/core'

@Component({
  tag: 'mds-input-date-range-preselection',
  styleUrl: 'mds-input-date-range-preselection.css',
  shadow: true,
})
export class MdsInputDateRangePreselection {


  @Prop({ reflect: true }) readonly start!: string
  @Prop({ reflect: true }) readonly end?: string

  private onClick = (event: MouseEvent) => {
    console.info('onClick', event)
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
