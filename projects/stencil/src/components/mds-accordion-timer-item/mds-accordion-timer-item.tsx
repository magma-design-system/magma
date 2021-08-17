import { Component, Host, h, Prop, State, Event, EventEmitter, Watch } from '@stencil/core'
import clsx from 'clsx'
import { TypographyPrimaryType } from '../../types/typography'

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
  @Prop() readonly typography?: TypographyPrimaryType = 'h5'

  /**
   * Specifies if the accordion item is opened or not
   */
  @Prop() readonly active?: boolean

  /**
   * Specifies the title shown when the accordion is closed or opened
   */
  @Prop() readonly description!: string

  /**
   * A value between 0 and 100 that rapresents the status progress
   */
  @Prop() readonly progress?: number = 0

  componentWillLoad (): void {
    this.isActive = this.active
  }

  private toggle = () => {
    this.isActive = !this.isActive
    if (this.isActive) {
      this.activeEvent.emit(this.description)
    }
  }

  private mouseHover = () => {
    if (this.isActive) {
      this.hoverActiveEvent.emit(this.description)
    }
  }

  private mouseOut = () => {
    if (this.isActive) {
      this.outActiveEvent.emit(this.description)
    }
  }

  /**
   * Emits when the accordion is clicked by the mouse
   */
  @Event() activeEvent: EventEmitter<string>

  /**
   * Emits when the accordion is hovered by the mouse
   */
  @Event() hoverActiveEvent: EventEmitter<string>

  /**
   * Emits when the accordion is hovered by the mouse
   */
  @Event() outActiveEvent: EventEmitter<string>

  @Watch('active')
  validateOpened (newValue: boolean): void {
    this.isActive = newValue
  }

  render () {
    return (
      <Host class={ clsx(this.isActive && 'active') } onMouseOver={ this.mouseHover } onMouseOut={ this.mouseOut }>
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
