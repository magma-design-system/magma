import { Component, Host, h, Prop } from '@stencil/core'
import { CalendarCellSelectionOrieintationType, CalendarCellSelectionPositionType, CalendarCellType } from './meta/types'

@Component({
  tag: 'mds-calendar-cell',
  styleUrl: 'mds-calendar-cell.css',
  shadow: true,
})
export class MdsCalendarCell {

  @Prop({ reflect: true }) readonly month?: CalendarCellType = 'current'
  @Prop({ reflect: true }) readonly date?: string
  @Prop({ reflect: true }) readonly orientation?: CalendarCellSelectionOrieintationType = 'horizontal'
  @Prop({ reflect: true }) readonly preview?: boolean = false
  @Prop({ reflect: true }) readonly selection?: CalendarCellSelectionPositionType
  @Prop({ reflect: true }) readonly disabled?: boolean | undefined = undefined

  render () {
    return (
      <Host>
        <div class="inner-dot"></div>
        <div class="area-background"></div>
        <mds-button class="action" variant="dark" tone="quiet">
          <slot></slot>
        </mds-button>
      </Host>
    )
  }
}
