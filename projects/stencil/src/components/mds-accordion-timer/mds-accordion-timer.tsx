import { Component, Host, Element, Event, EventEmitter, h, Prop, Listen, State } from '@stencil/core'

@Component({
  tag: 'mds-accordion-timer',
  styleUrl: 'mds-accordion-timer.css',
  shadow: true,
})
export class MdsAccordionTimer {

  private timer: number
  private timeChecker: number
  private timeStarted: number
  private selectedItemDurationTime: number
  private children: NodeListOf<HTMLMdsAccordionTimerItemElement>
  private selectedItem: HTMLMdsAccordionTimerItemElement
  @Element() private element: HTMLMdsAccordionTimerElement

  @State() time = 0

  /**
   * Sets the duration of the single accordion item
   */
  @Prop() duration?: number = 10000

  /**
   * Emits when the accordion changes it's item
   */
  @Event({ eventName: 'mdsChange' }) changeEvent: EventEmitter<number>

  componentDidLoad (): void {
    this.children = this.element.querySelectorAll<HTMLMdsAccordionTimerItemElement>('mds-accordion-timer-item')
    this.children.forEach((item, key) => {
      item.uuid = key
      if (item.selected) {
        this.selectedItem = item
      }
    })

    if (this.selectedItem !== undefined) {
      this.startTimer()
    }
  }

  private clearIntervals = (): void => {
    window.clearInterval(this.timer)
    window.clearInterval(this.timeChecker)
    this.timer = null
    this.timeChecker = null
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
      if (this.selectedItem !== undefined) {
        this.selectedItem.progress = progress
      }
      if (progress === 1) {
        this.selectedItem.progress = 0
        this.startNext()
      }
    }, 100)
  }

  private beginningTime = (): number => {
    this.timeStarted = (new Date()).getTime()
    return this.timeStarted
  }

  private remainingTime = (): number => {
    const remainingTime:number = this.selectedItemDurationTime - ( (new Date()).getTime() - this.timeStarted )
    return remainingTime >= 0 ? remainingTime : 0
  }

  private setSelectedItem = (uuid: number): void => {
    this.children.forEach((item, key) => {
      if (key === uuid) {
        item.selected = true
        this.selectedItem = item
        this.changeEvent.emit(uuid)
      } else {
        item.selected = false
      }
    })
  }

  private startNext = (): void => {
    const nextUuid = this.selectedItem.uuid + 1 > this.children.length - 1 ? 0 : this.selectedItem.uuid + 1
    this.setSelectedItem(nextUuid)
    this.startTimer()
  }

  private startTimer = (): void => {
    this.clearIntervals()
    this.time = this.beginningTime()
    this.selectedItemDurationTime = this.duration
    this.addTimeListener()
  }

  private playTimer = (): void => {
    this.beginningTime()
    this.addTimeListener()
  }

  private pauseTimer = (): void => {
    this.clearIntervals()
    this.selectedItemDurationTime = this.remainingTime()
  }

  private stopTimer = (): void => {
    this.clearIntervals()
    this.time = null
  }

  @Listen('mdsClickSelect')
  onClickActive (event: CustomEvent<string>): void {
    if (this.selectedItem && event.detail === this.selectedItem.description) {
      return
    }
    let selectedUuid: number
    this.children.forEach(item => {
      item.progress = 0
      if (item.description === event.detail) {
        selectedUuid = item.uuid
      }
    })
    this.setSelectedItem(selectedUuid)
    this.startTimer()
    this.pauseTimer()
  }

  @Listen('mdsMouseEnterSelect')
  onMouseEnterSelect (): void {
    this.pauseTimer()
  }

  @Listen('mdsMouseLeaveSelect')
  onMouseLeaveSelect (): void {
    if (this.timeChecker === null) {
      this.playTimer()
    }
  }

  render () {
    return (
      <Host>
        <slot/>
      </Host>
    )
  }
}
