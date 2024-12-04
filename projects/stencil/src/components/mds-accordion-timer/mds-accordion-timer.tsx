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

  private timeChecker: number
  private timeStarted: number
  private selectedItemRemainingTime: number
  private currentDuration: number = 0
  private children: NodeListOf<HTMLMdsAccordionTimerItemElement>
  private selectedItem: HTMLMdsAccordionTimerItemElement
  @Element() private readonly element: HTMLMdsAccordionTimerElement

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
        item.duration ? this.currentDuration = item.duration : this.currentDuration = this.duration
        this.selectedItem = item
      }
    })

    if (this.selectedItem !== undefined) {
      this.startTimer()
    }

    if (this.paused) {
      this.pauseTimer()
    }
  }

  private readonly clearIntervals = (): void => {
    if (typeof window !== 'undefined') {
      window.clearInterval(this.timeChecker)
    }
    this.timeChecker = 0
  }

  disconnectedCallback (): void {
    this.stopTimer()
    this.clearIntervals()
  }

  private readonly remainingTime = (): number => {
    const remainingTime:number = this.selectedItemRemainingTime - ( (new Date()).getTime() - this.timeStarted )
    return remainingTime >= 0 ? remainingTime : 0
  }

  private readonly progress = (): number => {
    return Math.abs(this.remainingTime() / this.currentDuration - 1)
  }

  private readonly addTimeListener = (): void => {
    if (typeof window !== 'undefined') {
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
  }

  private readonly beginningTime = (): number => {
    this.timeStarted = (new Date()).getTime()
    return this.timeStarted
  }

  private readonly setSelectedItem = (uuid: number): void => {
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

  private readonly startNext = (): void => {
    const nextUuid = this.selectedItem.uuid + 1 > this.children.length - 1 ? 0 : this.selectedItem.uuid + 1
    this.setSelectedItem(nextUuid)
    this.startTimer()
  }

  private readonly startTimer = (): void => {
    this.clearIntervals()
    this.time = this.beginningTime()
    this.selectedItemRemainingTime = this.currentDuration
    this.addTimeListener()
  }

  private readonly playTimer = (): void => {
    this.beginningTime()
    this.addTimeListener()
  }

  private readonly pauseTimer = (): void => {
    this.clearIntervals()
    this.selectedItemRemainingTime = this.remainingTime()
  }

  private readonly stopTimer = (): void => {
    this.clearIntervals()
  }

  @Listen('mdsAccordionTimerItemClickSelect')
  onClickSelect (event: CustomEvent<MdsAccordionTimerItemEventDetail>): void {
    this.clearIntervals()
    if (this.selectedItem) {
      this.selectedItem.progress = 0
    }
    this.setSelectedItem(event.detail.uuid)
    this.startTimer()
    this.pauseTimer()
  }

  @Listen('mdsAccordionTimerItemSelect')
  onSelect (event: CustomEvent<MdsAccordionTimerItemEventDetail>): void {
    this.clearIntervals()
    this.paused = false
    if (this.selectedItem) {
      this.selectedItem.progress = 0
    }
    this.setSelectedItem(event.detail.uuid)
    this.startTimer()
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
