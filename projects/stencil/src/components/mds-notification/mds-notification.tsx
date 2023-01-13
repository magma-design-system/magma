import { Component, Element, Host, h, Prop, Watch } from '@stencil/core'
import { autoUpdate, computePosition, offset, shift } from '@floating-ui/dom'
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

  /**
   * Specifies the id of the caller element.
   */
  @Prop() readonly target?: string = null

  /**
   * Specifies number of notifications to display, if it set to 0, the element will be hidden
   */
  @Prop({ mutable: true, reflect: true }) value?: number = null

  /**
   * Specifies if the notification is visible
   */
  @Prop({ mutable: true, reflect: true }) visible?: boolean = null

  /**
   * Specifies the position strategy of the notification
   */
  @Prop({ reflect: true }) strategy?: StrategyType = 'fixed'

  private placement?: FloatingUIPlacement = 'right-start'

  private updatePosition = ():void => {
    const middleware = []
    const strategySelected: FloatingUIStrategy = this.strategy === 'static' ? 'absolute' : 'fixed'

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

  componentDidLoad (): void {
    this.caller = document.getElementById(this.target)
  }

  componentDidRender (): void {
    if (this.strategy === 'static') {
      return
    }

    if (this.target === null) {
      return
    }

    if (!this.cleanupAutoUpdate) {
      setTimeout(() => {
        this.cleanupAutoUpdate = autoUpdate(this.caller, this.host, this.updatePosition)
      }, 100)
    }
  }

  disconnectedCallback (): void {
    this.cleanupAutoUpdate = null
  }

  @Watch('strategy')
  strategyHandler (newValue: string): void {
    if (newValue === 'static') {
      this.cleanupAutoUpdate = null
    }
  }

  render () {
    return (
      <Host>
        <mds-text typography="caption" class="dot">
          { this.value ? Number(this.value).toLocaleString() : <span class="spacer"/> }
        </mds-text>
      </Host>
    )
  }

}
