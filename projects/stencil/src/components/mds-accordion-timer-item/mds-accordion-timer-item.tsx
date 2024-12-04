import miBaselineKeyboardArrowDown from '@icon/mi/baseline/keyboard-arrow-down.svg'
import { Component, Event, EventEmitter, Host, Prop, h, Watch } from '@stencil/core'
import { MdsAccordionTimerItemEventDetail } from './meta/event-detail'
import { TypographyTitleType } from '@type/typography'

/**
 * @slot default - Add content like `text string`, `HTML elements` or `components` to this slot
 * @part content - the content wrapper of the `default` slot
 * @part icon - The arrow icon of the component
 * @part label - The text label of the component
 * @part progress - The progress bar of the component
 */

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
   * Specifies the duration of the single component when selected, it overrides the global duration of itself only
   */
  @Prop({ reflect: true }) readonly duration?: number

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
   * Emits when the accordion is changed from code
   */
  @Event({ eventName: 'mdsAccordionTimerItemSelect' }) selectEvent: EventEmitter<MdsAccordionTimerItemEventDetail>

  /**
   * Emits when the accordion is hovered by the mouse
   */
  @Event({ eventName: 'mdsAccordionTimerItemMouseEnterSelect' }) selectedMouseEnterEvent: EventEmitter<MdsAccordionTimerItemEventDetail>

  /**
   * Emits when the accordion is hovered by the mouse
   */
  @Event({ eventName: 'mdsAccordionTimerItemMouseLeaveSelect' }) selectedMouseLeaveEvent: EventEmitter<MdsAccordionTimerItemEventDetail>

  @Watch('selected')
  handleSelected (newValue: boolean): void {
    this.progress = 0
    if (newValue) {
      this.selectEvent.emit({ selected: this.selected, uuid: this.uuid })
    }
  }

  render () {
    return (
      <Host onMouseEnter={this.mouseEnter} onMouseLeave={this.mouseLeave}>
        <div class="row">
          <mds-progress aria-hidden="true" class="progress-bar" progress={Number(this.progress?.toFixed(2))} direction="vertical" part="progress"/>
          <div class="accordion">
            <button aria-controls="content" aria-expanded={this.selected ? 'true' : 'false'} class="action focus-bounce" id="action" onClick={this.toggle} role="button" tabindex="0">
              <mds-text typography={this.typography} part="label">{this.description}</mds-text>
              <mds-text aria-hidden="true" class="icon-button" typography={this.typography} part="icon">
                <i class="icon" innerHTML={miBaselineKeyboardArrowDown} />
              </mds-text>
            </button>
            <div class="content" id="content">
              <div aria-label={this.description} class="content-expander" part="content" role="region">
                <slot />
              </div>
            </div>
          </div>
        </div>
      </Host>
    )
  }
}
