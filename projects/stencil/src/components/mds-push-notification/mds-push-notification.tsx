import { Component, Element, Host, h, Prop, Event, EventEmitter, Watch, Method } from '@stencil/core'
import { cssDurationToMilliseconds, cssSizeToNumber } from '@common/unit'
import { MdsPushNotificationEventDetail } from './meta/event-detail'
/**
 * @part notifications - The container wrapper of the notifications.
 * @slot top - Add `HTML elements` or `components`, it is **recommended** to use `mds-button` element.
 * @slot bottom - Add `HTML elements` or `components`, it is **recommended** to use `mds-button` element.
 * @slot default - Add `HTML elements` or `components`, it is **recommended** to use `mds-push-notification` element.
 */

@Component({
  tag: 'mds-push-notification',
  styleUrl: 'mds-push-notification.css',
  shadow: true,
})
export class MdsPushNotification {

  @Element() host: HTMLMdsPushNotificationElement
  slotNotifications!: HTMLSlotElement
  private cssItemsDuration: string
  private cssItemsGap: string
  // private totalItems = 0

  /**
   * Specifies if the component is visible or not.
   */
  @Prop({ reflect: true, mutable: true }) visible?: boolean

  /**
   * Specifies if the component is visible or not.
   * behavior = manual
   * should hide when click outside
   * should hide when all notifications are removed
   * should show when change visible from component or call show method
   *
   * behavior = auto
   * should hide when all notifications are removed
   * should show when one or more notifications are added
   */
  @Prop() behavior?: 'auto' | 'manual' = 'auto'

  /**
   * Emits when the component visibility changes
   */
  @Event({ eventName: 'mdsPushNotificationChange' }) changedEvent: EventEmitter<MdsPushNotificationEventDetail>

  /**
   * Emits when the component is shown
   */
  @Event({ eventName: 'mdsPushNotificationShow' }) shownEvent: EventEmitter<void>

  /**
   * Emits when the component is hidden
   */
  @Event({ eventName: 'mdsPushNotificationHide' }) hiddenEvent: EventEmitter<void>

  // TODO [fix] If visibility is set to false, hide all the notifications area also when they are added
  // TODO [fix] If visibility is set to true, and there are not notifications, show the notifications area
  // TODO [feat] Add a method to clear all notifications at once
  // TODO [feat] Hide the component when all the children are removed
  // TODO [feat] Show the component when one or more children are added
  // TODO [test] tests are not clear, please fix them

  /**
   * Animation for open notification
   * @param element HTMLElement that need to be opened
   * @returns
   */
  private introItem = (element: HTMLElement): Promise<void> => {
    // no reason why I must duplicata marginBottom negative to prevent flickering
    element.style.marginBottom = `-${element.offsetHeight + cssSizeToNumber(this.cssItemsGap)}px`
    return new Promise<void>(resolve => {
      setTimeout(() => {
        element.style.marginBottom = `-${element.offsetHeight + cssSizeToNumber(this.cssItemsGap)}px`
        setTimeout(() => {
          element.style.visibility = 'visible'
          element.style.position = 'relative'
          element.style.transform = 'translate(0, 0)'
          element.style.marginBottom = '0px'
          resolve()
        }, cssDurationToMilliseconds(this.cssItemsDuration))
      }, 15) // hope to find a better solution not based on 15ms of delay, not very robust
    })
  }

  /**
   * Animation for close notification
   * @param element HTMLElement that need to be removed
   * @returns
   */
  private outroItem = (element: HTMLElement): Promise<void> => {
    if (this.slotNotifications.assignedNodes().length <= 1) this.hide()
    // no reason why I must duplicate marginBottom negative to prevent flickering
    element.style.marginBottom = '0px'
    return new Promise<void>(resolve => {
      setTimeout(() => {
        element.style.marginBottom = '0px'
        setTimeout(() => {
          element.addEventListener('transitionend', () => {
            // element.removeEventListener('transitionend')
            element.remove()
          })
          element.style.removeProperty('transform')
          element.style.marginBottom = `-${element.offsetHeight + cssSizeToNumber(this.cssItemsGap)}px`
          resolve()
        }, cssDurationToMilliseconds(this.cssItemsDuration))
      }, 15) // hope to find a better solution not based on 15ms of delay, not very robust
    })
  }

  /**
   * manages the opening of notifications when they are added to the slot
   */
  private handleSlotChange = (): void => {
    const elements = this.slotNotifications.assignedElements().map(e => e as HTMLElement).filter(e => !e.style.visibility )
    if (elements.length === 0) return

    elements.forEach(async e => {
      e.addEventListener('mdsPushNotificationItemClose', () => this.outroItem(e))
      await this.introItem(e)
    })
    if (this.behavior === 'auto') this.show()
  }

  private updateCSSCustomProps = (): void => {
    const elementStyles = window.getComputedStyle(this.host)
    this.cssItemsGap = elementStyles.getPropertyValue('--mds-push-notification-items-gap') ?? '0.5rem'
    this.cssItemsDuration = elementStyles.getPropertyValue('--mds-push-notification-items-duration') ?? '200ms'
  }

  private clear (): void {
    this.slotNotifications.assignedElements().forEach(e => this.outroItem(e as HTMLElement))
    this.hide()
  }

  @Method()
  show (): Promise<void> {
    this.visible = true
    return Promise.resolve()
  }

  @Method()
  hide (): Promise<void> {
    this.visible = undefined
    return Promise.resolve()
  }

  @Method()
  removeNotification (notification: HTMLMdsPushNotificationItemElement | HTMLMdsPushNotificationItemElement[]): Promise<void> {
    if (Array.isArray(notification)) {
      notification.forEach(this.outroItem)
    } else {
      this.outroItem(notification)
    }
    return Promise.resolve()
  }

  componentDidLoad (): void {
    this.updateCSSCustomProps()

    this.slotNotifications.addEventListener('slotchange', this.handleSlotChange)
    this.handleSlotChange()
  }

  @Watch('visible')
  visibleChanged (newValue?: boolean): void {
    if (newValue) {
      this.changedEvent.emit({ visible: true })
      this.shownEvent.emit()
      return
    }
    if (newValue === undefined) {
      this.changedEvent.emit({ visible: false })
      this.hiddenEvent.emit()
      return
    }
    this.visible = undefined
  }

  render () {
    return (
      <Host>
        {/* <slot name="top"></slot> */}
        <mds-button variant="dark" onClick={this.clear.bind(this)}>Cancella notifiche</mds-button>
        <div class="notifications" part="notifications">
          <slot ref={el => this.slotNotifications = el as HTMLSlotElement}/>
        </div>
        {/* <slot name="bottom"></slot> */}
      </Host>
    )
  }
}

