import { Component, Host, h, Prop, Event, EventEmitter } from '@stencil/core'
import { TypographyTitleType } from '@type/typography'
import { MdsAccordionTimerItemEventDetail } from './meta/event-detail'

@Component({
  tag: 'mds-accordion-timer-item',
  styleUrl: 'mds-accordion-timer-item.css',
  shadow: true,
})
export class MdsAccordionTimerItem {

  /**
   * Specifies the typography of the element
   */
  @Prop() readonly typography: TypographyTitleType = 'h5'

  /**
   * Specifies if the accordion item is opened or not
   */
  @Prop({ reflect: true }) selected = false

  /**
   * Specifies the title shown when the accordion is closed or opened
   */
  @Prop() readonly description!: string

  /**
   * A value between 0 and 100 that rapresents the status progress
   */
  @Prop() progress = 0

  /**
   * Used automatically by MdsAccordionTimer wrapper to handle it's siblings
   */
  @Prop() readonly uuid: number = 0

  /**
   * Event throws only once the element is active,
   * to fire it again it need to be a different item
   */
  private toggle = () => {
    this.selected = !this.selected
    this.progress = 0
    if (this.selected) {
      this.clickSelectEvent.emit({ selected: this.selected, uuid: this.uuid })
    }
  }

  private mouseEnter = () => {
    if (this.selected) {
      this.selectedMouseEnterEvent.emit({ selected: this.selected, uuid: this.uuid })
    }
  }

  private mouseLeave = () => {
    if (this.selected) {
      this.selectedMouseLeaveEvent.emit({ selected: this.selected, uuid: this.uuid })
    }
  }

  /**
   * Emits when the accordion is clicked by the mouse
   */
  @Event({ eventName: 'mdsAccordionTimerItemClickSelect' }) clickSelectEvent: EventEmitter<MdsAccordionTimerItemEventDetail>

  /**
   * Emits when the accordion is hovered by the mouse
   */
  @Event({ eventName: 'mdsAccordionTimerItemMouseEnterSelect' }) selectedMouseEnterEvent: EventEmitter<MdsAccordionTimerItemEventDetail>

  /**
   * Emits when the accordion is hovered by the mouse
   */
  @Event({ eventName: 'mdsAccordionTimerItemMouseLeaveSelect' }) selectedMouseLeaveEvent: EventEmitter<MdsAccordionTimerItemEventDetail>

  render () {
    return (
      <Host onMouseEnter={ this.mouseEnter } onMouseLeave={ this.mouseLeave }>
        <div class="row">
          <mds-progress class="progress-bar" progress={ Number(this.progress?.toFixed(2)) } direction="vertical"/>
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
