import { Component, Host, Element, Event, EventEmitter, h, Prop, Listen, State } from '@stencil/core'

// https://store.google.com/product/nest_wifi_learn?hl=it
// https://stenciljs.com/docs/component-lifecycle#async-lifecycle-methods

@Component({
  tag: 'mds-accordion-timer',
  styleUrl: 'mds-accordion-timer.css',
  shadow: true,
})
export class MdsAccordionTimer {

  private timer
  private timeChecker
  private timeStarted
  private activeItemDurationTime
  private children: NodeListOf<HTMLMdsAccordionTimerItemElement>
  private activeItem: HTMLMdsAccordionTimerItemElement
  @Element() private element: HTMLMdsAccordionTimerElement

  @State() time = 0

  /**
   * Sets the duration of the single accordion item
   */
  @Prop() duration?: number = 5000

  /**
   * Emits when the accordion changes it's item
   */
  @Event() itemActivated: EventEmitter<number>

  componentDidLoad (): void {
    this.children = this.element.querySelectorAll<HTMLMdsAccordionTimerItemElement>('mds-accordion-timer-item')
    this.children.forEach((item, key) => {
      item.uuid = key
      if (item.active) {
        this.activeItem = item
      }
    })
  }

  private clearIntervals = (): void => {
    window.clearInterval(this.timer)
    window.clearInterval(this.timeChecker)
    this.timer = null
    this.timeChecker = null
  }

  connectedCallback (): void {
    this.startTimer()
  }

  disconnectedCallback (): void {
    this.stopTimer()
    this.clearIntervals()
  }

  private progress = (): number => {
    return Math.abs(this.remainingTime() / this.duration - 1)
  }

  private addTimeListener = (): void => {
    this.timeChecker = window.setInterval(() => {
      const progress = this.progress()
      if (this.activeItem !== undefined) {
        this.activeItem.progress = progress
      }
      if (progress === 1) {
        this.activeItem.progress = 0
        this.startNext()
      }
    }, 100)
  }

  private beginningTime = (): number => {
    this.timeStarted = (new Date()).getTime()
    return this.timeStarted
  }

  private remainingTime = (): number => {
    const remainingTime:number = this.activeItemDurationTime - ( (new Date()).getTime() - this.timeStarted )
    return remainingTime >= 0 ? remainingTime : 0
  }

  private setActiveItem = (uuid: number): void => {
    this.children.forEach((item, key) => {
      if (key === uuid) {
        item.active = true
        this.activeItem = item
        this.itemActivated.emit(uuid)
      } else {
        item.active = false
      }
    })
  }

  private startNext = (): void => {
    const nextUuid = this.activeItem.uuid + 1 > this.children.length - 1 ? 0 : this.activeItem.uuid + 1
    this.setActiveItem(nextUuid)
    this.startTimer()
  }

  private startTimer = (): void => {
    this.clearIntervals()
    this.time = this.beginningTime()
    this.activeItemDurationTime = this.duration
    this.addTimeListener()
    // this.timer = window.setInterval(this.timerStopped, this.duration)
  }

  private playTimer = (): void => {
    this.beginningTime()
    this.addTimeListener()
    // this.timer = window.setInterval(this.timerStopped, this.time)
  }

  private pauseTimer = (): void => {
    this.clearIntervals()
    this.activeItemDurationTime = this.remainingTime()
  }

  private stopTimer = (): void => {
    this.clearIntervals()
    this.time = null
  }

  @Listen('clickActive')
  onClickActive (event: CustomEvent<string>): void {
    if (event.detail === this.activeItem.description) {
      return
    }
    let selectedUuid: number
    this.children.forEach(item => {
      item.progress = 0
      if (item.description === event.detail) {
        selectedUuid = item.uuid
      }
    })
    this.setActiveItem(selectedUuid)
    this.startTimer()
  }

  @Listen('mouseEnterActive')
  onMouseEnterActive (): void {
    this.pauseTimer()
  }

  @Listen('mouseLeaveActive')
  onMouseLeaveActive (): void {
    if (this.timeChecker === null) {
      this.playTimer()
    }
  }

  render () {
    return (
      <Host>
        <slot></slot>
      </Host>
    )
  }
}
