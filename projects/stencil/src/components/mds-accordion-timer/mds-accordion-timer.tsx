import { MdsAccordionTimerItemEventDetail } from '@component/mds-accordion-timer-item/meta/event-detail'
import { Component, Host, Element, Event, EventEmitter, h, Prop, Listen, State, Watch } from '@stencil/core'
import { MdsAccordionTimerEventDetail } from './meta/event-detail'

/**
 * @slot default - Add `mds-accordion-timer-item` element/s.
 */

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
  private currentDuration: number = 0
  private children: NodeListOf<HTMLMdsAccordionTimerItemElement>
  private selectedItem: HTMLMdsAccordionTimerItemElement
  @Element() private element: HTMLMdsAccordionTimerElement

  @State() time = 0

  /**
   * Sets the duration of the single accordion item
   */
  @Prop({ reflect: true }) duration = 10000

  /**
   * When paused is defined, the timer stops run
   */
  @Prop({ reflect: true }) paused?: boolean

  /**
   * Emits when the accordion changes it's item
   */
  @Event({ eventName: 'mdsAccordionTimerChange' }) changeEvent: EventEmitter<MdsAccordionTimerEventDetail>

  componentDidLoad (): void {
    this.children = this.element.querySelectorAll<HTMLMdsAccordionTimerItemElement>('mds-accordion-timer-item')
    this.children.forEach((item, key) => {
      item.uuid = key
      if (item.selected) {
        this.selectedItem = item
      }
    })

    this.currentDuration = this.duration

    if (this.selectedItem !== undefined) {
      this.startTimer()
    }

    if (this.paused) {
      this.pauseTimer()
    }
  }

  private clearIntervals = (): void => {
    window.clearInterval(this.timer)
    window.clearInterval(this.timeChecker)
    this.timeChecker = 0
  }

  disconnectedCallback (): void {
    this.stopTimer()
    this.clearIntervals()
  }

  private progress = (): number => {
    return Math.abs(this.remainingTime() / this.currentDuration - 1)
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
        item.duration ? this.currentDuration = item.duration : this.currentDuration = this.duration
        this.selectedItem = item
        this.changeEvent.emit({ index: key })
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
    this.selectedItemDurationTime = this.currentDuration
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
  }

  @Listen('mdsAccordionTimerItemClickSelect')
  onClickActive (event: CustomEvent<MdsAccordionTimerItemEventDetail>): void {
    if (this.selectedItem) {
      this.selectedItem.progress = 0
    }
    this.setSelectedItem(event.detail.uuid)
    this.startTimer()
    this.pauseTimer()
  }

  @Listen('mdsAccordionTimerItemMouseEnterSelect')
  onMouseEnterSelect (): void {
    if (this.paused) {
      return
    }
    this.pauseTimer()
  }

  @Listen('mdsAccordionTimerItemMouseLeaveSelect')
  onMouseLeaveSelect (): void {
    if (this.paused) {
      return
    }
    if (this.timeChecker === 0) {
      this.playTimer()
    }
  }

  @Watch('paused')
  handlePaused (newValue: boolean): void {
    if (newValue) {
      this.pauseTimer()
      return
    }
    this.playTimer()
  }

  render () {
    return (
      <Host>
        <slot/>
      </Host>
    )
  }
}
