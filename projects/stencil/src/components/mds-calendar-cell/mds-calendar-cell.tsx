import { Component, Host, h, Prop } from '@stencil/core'
import { CalendarCellSelectionOrieintationType, CalendarCellSelectionPositionType, CalendarCellType } from './meta/types'

@Component({
  tag: 'mds-calendar-cell',
  styleUrl: 'mds-calendar-cell.css',
  shadow: true,
})
export class MdsCalendarCell {

  /**
   * Specifies if the current month or a weekend
   */
  @Prop({ reflect: true }) readonly month?: CalendarCellType = 'current'

  /**
   * Specifies the label of the cell
   */
  @Prop({ reflect: true }) readonly label?: string

  /**
   * Specifies the date of the cell
   * @description It's in ISO format (YYYY-MM-DD).
   */
  @Prop({ reflect: true }) readonly date?: string

  /**
   * Specifies the selection orientation of the cell
   * @description It can be 'horizontal' or 'vertical', but currently only 'horizontal' is supported
   */
  @Prop({ reflect: true }) readonly orientation?: CalendarCellSelectionOrieintationType = 'horizontal'

  /**
   * Specifies if the selection is a preview or the final selection
   */
  @Prop({ reflect: true }) readonly preview?: boolean = false

  /**
   * Specifies the point of selection of the cell
   * @description It can be `end`, `middle`, `none`, `single`, `start`
   */
  @Prop({ reflect: true }) readonly selection?: CalendarCellSelectionPositionType

  /**
   * Specifies if the cell is disabled
   */
  @Prop({ reflect: true }) readonly disabled?: boolean | undefined = undefined

  /**
   * Specifies if the cell is today
   */
  @Prop({ reflect: true }) readonly today?: boolean | undefined = undefined

  render () {
    return (
      <Host>
        <div class="inner-dot"></div>
        <div class="area-background"></div>
        <mds-button class="action" variant="dark" tone="text" disabled={this.disabled} label={this.label}></mds-button>
      </Host>
    )
  }
}
