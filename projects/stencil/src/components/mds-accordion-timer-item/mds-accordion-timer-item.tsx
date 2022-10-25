import { Component, Host, h, Prop, State, Element, Event, EventEmitter, Watch } from '@stencil/core'
import { TypographyTitleType } from '../../types/typography'
// import { DirectionType } from '../mds-progress/meta/types'

@Component({
  tag: 'mds-accordion-timer-item',
  styleUrl: 'mds-accordion-timer-item.css',
  shadow: true,
})
export class MdsAccordionTimerItem {

  // @Element() private element: HTMLMdsAccordionTimerItemElement

  // @State() isActive:boolean

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

  // componentWillLoad (): void {
  //   this.isActive = this.active
  // }

  // componentDidLoad (): void {
  //   this.element.shadowRoot.querySelector<HTMLMdsProgressElement>('mds-progress').setAttribute('direction', 'vertical')
  // }

  private toggle = () => {
    if (!this.active) {
      // this.isActive = true
      this.clickActive.emit(this.description)
    }
  }

  private mouseEnter = () => {
    if (this.active) {
      this.mouseEnterActive.emit(this.description)
    }
  }

  private mouseLeave = () => {
    if (this.active) {
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

  // @Watch('active')
  // activeChanged (newValue: boolean): void {
  //   this.isActive = newValue
  // }

  render () {
    return (
      <Host onMouseEnter={ this.mouseEnter } onMouseLeave={ this.mouseLeave }>
        <div class="row">
          <mds-progress class="progress-bar" progress={ Number(this.progress.toFixed(2)) } direction="vertical"/>
          <div class="accordion">
            <button aria-controls="contents" aria-expanded={ this.active ? 'true' : 'false' } class="action" id="action" onClick={ this.toggle } role="button" tabindex="0">
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
