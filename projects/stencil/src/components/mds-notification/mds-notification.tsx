import { Component, Element, Host, h, Prop, Watch } from '@stencil/core'
import { autoUpdate, computePosition, Middleware, offset, shift } from '@floating-ui/dom'
import { FloatingUIPlacement, FloatingUIStrategy } from '@type/floating-ui'
import { StrategyType } from './meta/types'

@Component({
  tag: 'mds-notification',
  styleUrl: 'mds-notification.css',
  shadow: true,
})
export class MdsNotification {

  private caller: HTMLElement
  @Element() private host: HTMLMdsNotificationElement
  private cleanupAutoUpdate: () => void

  // We should change in the future this approach when it will be fully supported by main browsers
  // https://www.youtube.com/watch?v=DNXEORSk4GU&list=PLMTbm2xm6FfPWPUr__bFUGVPfYMZwu5U7&index=67

  /**
   * Specifies the selector of the target element, this attribute is used with `querySelector` method.
   */
  @Prop() readonly target: string

  /**
   * Specifies number of notifications to display, if it set to 0, the element will be hidden
   */
  @Prop({ mutable: true, reflect: true }) value = 0

  /**
   * Specifies if the notification is visible
   */
  @Prop({ mutable: true, reflect: true }) visible = true

  /**
   * Specifies the position strategy of the notification
   */
  @Prop({ mutable: true, reflect: true }) strategy: StrategyType = 'fixed'

  /**
   * Specifies the maximum number that can be seen, assuming that the number is for example 9 and that this is exceeded with 15, the component shows +9
   */
  @Prop({ reflect: true }) max?: number

  private placement?: FloatingUIPlacement = 'right-start'

  private updatePosition = ():void => {
    const middleware = new Array<Middleware>()
    const strategySelected: FloatingUIStrategy = this.strategy === 'disabled' ? 'absolute' : 'fixed'

    middleware.push(offset(0))
    middleware.push(shift({ padding: 0 }))

    computePosition(this.caller, this.host, {
      middleware,
      placement: this.placement,
      strategy: strategySelected,
    }).then(({ x, y }) => {

      Object.assign(this.host.style, {
        left: `${x}px`,
        top: `${y}px`,
      })
    })
  }

  private clean = (value: number):string => {
    if (this.max) {
      if (value > this.max) {
        return `+${Number(this.max).toLocaleString()}`
      }
    }

    return Number(value).toLocaleString()
  }

  componentDidRender (): void {
    if (!this.target) {
      this.strategy = 'disabled'
      return
    }
    const c = document.querySelector(this.target) as HTMLElement
    if (!c) throw new Error('No valid target found')
    this.caller = c
  }

  componentDidLoad (): void {
    if (this.strategy === 'disabled') {
      return
    }

    if (this.target && !this.cleanupAutoUpdate) {
      setTimeout(() => {
        this.cleanupAutoUpdate = autoUpdate(this.caller, this.host, this.updatePosition)
      }, 100)
    }
  }

  disconnectedCallback (): void {
    this.cleanupAutoUpdate = (): void => {}
  }

  @Watch('strategy')
  strategyHandler (newValue: StrategyType): void {
    if (newValue === 'disabled') {
      this.cleanupAutoUpdate = (): void => {}
    }
  }

  render () {
    return (
      <Host aria-labelledby={this.target} aria-label={this.value ?? '0'}>
        <mds-text typography="caption" class="dot" aria-hidden="true">
          { this.value ? this.clean(this.value) : '' }
        </mds-text>
      </Host>
    )
  }

}
