import { Component, Element, Host, h, Prop } from '@stencil/core'
import { autoUpdate, computePosition, offset, shift } from '@floating-ui/dom'
import { FloatingUIPlacement, FloatingUIStrategy } from '../../types/floating-ui'

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
  @Prop() readonly target!:string

  /**
   * Specifies number of notifications to display, if it set to 0, the element will be hidden
   */
  @Prop({ mutable: true, reflect: true }) value?: number = null

  /**
   * Specifies if the notification is visible
   */
  @Prop({ mutable: true, reflect: true }) visible?: boolean = null

  private placement?: FloatingUIPlacement = 'right-start'
  private strategy?: FloatingUIStrategy = 'fixed'

  private updatePosition = ():void => {
    const middleware = []

    middleware.push(offset(0))
    middleware.push(shift({ padding: 0 }))

    computePosition(this.caller, this.host, {
      middleware,
      placement: this.placement,
      strategy: this.strategy,
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
    if (!this.cleanupAutoUpdate) {
      setTimeout(() => {
        this.cleanupAutoUpdate = autoUpdate(this.caller, this.host, this.updatePosition)
      }, 100)
    }
  }

  disconnectedCallback (): void {
    this.cleanupAutoUpdate = null
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
