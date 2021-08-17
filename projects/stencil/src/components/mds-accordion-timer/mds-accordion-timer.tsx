import { Component, Host, Event, EventEmitter, h, Prop, Listen, State } from '@stencil/core'

// https://store.google.com/product/nest_wifi_learn?hl=it
// https://stenciljs.com/docs/component-lifecycle#async-lifecycle-methods

@Component({
  tag: 'mds-accordion-timer',
  styleUrl: 'mds-accordion-timer.css',
  shadow: true,
})
export class MdsAccordionTimer {

  private timer

  @State() time = 0

  /**
   * Sets the duration of the single accordion item
   */
  @Prop() duration?: number = 4000

  /**
   * Emits when the accordion changes it's item
   */
  @Event() changedEvent: EventEmitter<string>

  connectedCallback (): void {
    this.startTimer()
  }

  disconnectedCallback (): void {
    this.stopTimer()
  }

  private timeStarted = (): number => {
    return (new Date()).getTime()
  }

  private remainingTime = (): number => {
    return this.duration - ( (new Date()).getTime() - this.time )
  }

  private timePassed = (): number => {
    return ( (new Date()).getTime() - this.time )
  }

  private timerStopped = (): void => {
    this.changedEvent.emit('this.description')
  }

  private startTimer = (): void => {
    // start from 0
    this.time = this.timeStarted()
    this.timer = window.setInterval(this.timerStopped, this.duration)
  }

  private playTimer = (): void => {
    // start paused timer

    this.timer = window.setInterval(this.timerStopped, this.duration)
  }

  private pauseTimer = (): void => {
    // pause started timer
    window.clearInterval(this.timer)
    this.time = this.remainingTime()
  }

  private stopTimer = (): void => {
    window.clearInterval(this.timer)
    this.time = null
  }

  @Listen('activeEvent')
  activeEvent (event: CustomEvent<string>): void {
    const items = document.querySelectorAll<HTMLMdsAccordionTimerItemElement>('mds-accordion-timer-item')
    items.forEach(item => item.active = item.description === event.detail)
    this.stopTimer()
    this.playTimer()
  }

  @Listen('hoverActiveEvent')
  hoverActiveEvent (): void {
    // pause timer
    this.time = this.timePassed()
    this.pauseTimer()
  }

  @Listen('outActiveEvent')
  outActiveEvent (): void {
    // play timer
    this.playTimer()
  }

  render () {
    return (
      <Host>
        <slot></slot>
      </Host>
    )
  }

}
