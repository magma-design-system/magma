import { Component, Host, h, Prop, Event, EventEmitter } from '@stencil/core'
import { TypographyTitleType } from '@type/typography'
// import { DirectionType } from '../mds-progress/meta/types'

@Component({
  tag: 'mds-accordion-timer-item',
  styleUrl: 'mds-accordion-timer-item.css',
  shadow: true,
})
export class MdsAccordionTimerItem {

  /**
   * Specifies the typography of the element
   */
  @Prop() readonly typography?: TypographyTitleType = 'h5'

  /**
   * Specifies if the accordion item is opened or not
   */
  @Prop({ reflect: true }) readonly selected?: boolean

  /**
   * Specifies the title shown when the accordion is closed or opened
   */
  @Prop() readonly description!: string

  /**
   * A value between 0 and 100 that rapresents the status progress
   */
  @Prop() readonly progress?: number = 0

  /**
   * Used automatically by MdsAccordionTimer wrapper to handle it's siblings
   */
  @Prop() readonly uuid?: number = 0

  /**
   * Event throws only once the element is active,
   * to fire it again it need to be a different item
   */
  private toggle = () => {
    if (!this.selected) {
      this.clickSelectEvent.emit(this.description)
    }
  }

  private mouseEnter = () => {
    if (this.selected) {
      this.selectedMouseEnterEvent.emit(this.description)
    }
  }

  private mouseLeave = () => {
    if (this.selected) {
      this.selectedMouseLeaveEvent.emit(this.description)
    }
  }

  /**
   * Emits when the accordion is clicked by the mouse
   */
  @Event({ eventName: 'mdsClickSelect' }) clickSelectEvent: EventEmitter<string>

  /**
   * Emits when the accordion is hovered by the mouse
   */
  @Event({ eventName: 'mdsMouseEnterSelect' }) selectedMouseEnterEvent: EventEmitter<string>

  /**
   * Emits when the accordion is hovered by the mouse
   */
  @Event({ eventName: 'mdsMouseLeaveSelect' }) selectedMouseLeaveEvent: EventEmitter<string>

  render () {
    return (
      <Host onMouseEnter={ this.mouseEnter } onMouseLeave={ this.mouseLeave }>
        <div class="row">
          <mds-progress class="progress-bar" progress={ Number(this.progress.toFixed(2)) } direction="vertical"/>
          <div class="accordion">
            <button aria-controls="contents" aria-expanded={ this.selected ? 'true' : 'false' } class="action focusable" id="action" onClick={ this.toggle } role="button" tabindex="0">
              <mds-text typography={ this.typography }>{ this.description }</mds-text>
            </button>
            <div class="contents" id="contents">
              <slot/>
            </div>
          </div>
        </div>
      </Host>
    )
  }
}
