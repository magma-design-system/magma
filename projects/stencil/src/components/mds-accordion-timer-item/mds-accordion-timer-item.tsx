import { Component, Host, h, Prop, State, Event, EventEmitter, Watch } from '@stencil/core'
import clsx from 'clsx'
import { TypographyTitleType } from '../../types/typography'

@Component({
  tag: 'mds-accordion-timer-item',
  styleUrl: 'mds-accordion-timer-item.css',
  shadow: true,
})
export class MdsAccordionTimerItem {

  @State() isActive:boolean

  /**
   * Specifies the typography of the element
   */
  @Prop() readonly typography?: TypographyTitleType = 'h5'

  /**
   * Specifies if the accordion item is opened or not
   */
  @Prop({ reflect: true }) readonly active?: boolean

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

  componentWillLoad (): void {
    this.isActive = this.active
  }

  private toggle = () => {
    if (!this.isActive) {
      this.isActive = true
      this.clickActive.emit(this.description)
    }
  }

  private mouseEnter = () => {
    if (this.isActive) {
      this.mouseEnterActive.emit(this.description)
    }
  }

  private mouseLeave = () => {
    if (this.isActive) {
      this.mouseLeaveActive.emit(this.description)
    }
  }

  /**
   * Emits when the accordion is clicked by the mouse
   */
  @Event() clickActive: EventEmitter<string>

  /**
   * Emits when the accordion is hovered by the mouse
   */
  @Event() mouseEnterActive: EventEmitter<string>

  /**
   * Emits when the accordion is hovered by the mouse
   */
  @Event() mouseLeaveActive: EventEmitter<string>

  @Watch('active')
  validateOpened (newValue: boolean): void {
    this.isActive = newValue
  }

  render () {
    return (
      <Host class={ clsx(this.isActive && 'active') } onMouseEnter={ this.mouseEnter } onMouseLeave={ this.mouseLeave }>
        <div class="row">
          <mds-progress class="progress-bar" progress={this.progress} direction="vertical"/>
          <div class="accordion">
            <div class="header" onClick={ this.toggle }>
              <mds-text typography={ this.typography }>{ this.description }</mds-text>
            </div>
            <div class={ clsx('contents', this.isActive && 'contents--opened') }>
              <slot/>
            </div>
          </div>
        </div>
      </Host>
    )
  }
}
