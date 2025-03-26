import { Component, Element, Host, h, Prop, Event, EventEmitter, Watch } from '@stencil/core'
import { cssDurationToMilliseconds, cssSizeToNumber } from '@common/unit'
import { MdsPushNotificationsEventDetail } from './meta/event-detail'
/**
 * @part notifications - The container wrapper of the notifications.
 * @slot top - Add `HTML elements` or `components`, it is **recommended** to use `mds-button` element.
 * @slot bottom - Add `HTML elements` or `components`, it is **recommended** to use `mds-button` element.
 * @slot default - Add `HTML elements` or `components`, it is **recommended** to use `mds-push-notification` element.
 */

@Component({
  tag: 'mds-push-notifications',
  styleUrl: 'mds-push-notifications.css',
  shadow: true,
})
export class MdsPushNotifications {

  @Element() host: HTMLMdsPushNotificationsElement
  private cssItemsDuration: string
  private cssItemsGap: string
  private totalItems = 0

  /**
   * Specifies if the component is visible or not.
   */
  @Prop({ reflect: true, mutable: true }) visible?: boolean

  /**
   * Specifies if the component is visible or not.
   * visibility = auto | manual
   * should hide when click outside
   * should hide when all notifications are removed
   * should show when one or more notifications are added
   */
  @Prop({ reflect: true }) visibility?: 'auto' | 'manual' = 'auto'

  /**
   * Emits when the component visibility changes
   */
  @Event({ eventName: 'mdsPushNotificationsChange' }) changedEvent: EventEmitter<MdsPushNotificationsEventDetail>

  /**
   * Emits when the component is shown
   */
  @Event({ eventName: 'mdsPushNotificationsShow' }) shownEvent: EventEmitter<void>

  /**
   * Emits when the component is hidden
   */
  @Event({ eventName: 'mdsPushNotificationsHide' }) hiddenEvent: EventEmitter<void>

  // TODO [fix] If visibility is set to false, hide all the notifications area also when they are added
  // TODO [fix] If visibility is set to true, and there are not notifications, show the notifications area
  // TODO [feat] Add a method to clear all notifications at once
  // TODO [feat] Hide the component when all the children are removed
  // TODO [feat] Show the component when one or more children are added
  // TODO [test] tests are not clear, please fix them

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

  private checkNotificationsItems = (): void => {
    this.totalItems -= 1
    // console.log('totalItems', this.totalItems)
    if (this.totalItems === 0) {
      this.changedEvent.emit()
      this.hiddenEvent.emit()
      this.visible = undefined
    }
  }

  private outroItem = (element: HTMLElement): Promise<void> => {
    // no reason why I must duplicate marginBottom negative to prevent flickering
    element.style.marginBottom = '0px'
    this.checkNotificationsItems()
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

  private addNotificationBehavior = (element: HTMLElement): void => {
    element.addEventListener('mdsPushNotificationClose', () => this.outroItem(element))
  }

  private handleSlotChange = (): void => {
    this.updateCSSCustomProps()
    const elements = this.host.shadowRoot?.querySelectorAll('slot')[1]?.assignedNodes()
    if (!elements) {
      console.info('No slotted elements found.')
      return
    }

    const itemsIntro: Promise<void>[] = []
    let element: HTMLElement
    while (this.totalItems < elements.length) {
      element = elements[this.totalItems] as HTMLElement
      this.addNotificationBehavior(element)
      itemsIntro.push(this.introItem(element))
      this.totalItems += 1
    }

    itemsIntro.forEach(async intro => {
      await intro
    })
    this.shownEvent.emit()
    this.visible = true
  }

  private updateCSSCustomProps = (): void => {
    const elementStyles = window.getComputedStyle(this.host)
    this.cssItemsGap = elementStyles.getPropertyValue('--mds-push-notifications-items-gap') ?? '0.5rem'
    this.cssItemsDuration = elementStyles.getPropertyValue('--mds-push-notifications-items-duration') ?? '200ms'
  }

  componentWillLoad (): void {
    const elements = this.host.shadowRoot?.querySelectorAll('slot')[1]?.assignedNodes()
    if (!elements) {
      return
    }
    this.totalItems = elements.length
  }

  componentDidLoad (): void {
    this.updateCSSCustomProps()
    if (this.totalItems === 0) {
      this.visible = undefined
    }
  }

  @Watch('visible')
  visibleChanged (newValue?: boolean): void {
    this.changedEvent.emit({ visible: newValue ?? false })
    if (!newValue) {
      this.hiddenEvent.emit()
      if (newValue === false) this.visible = undefined
      return
    }
    this.shownEvent.emit()
  }

  render () {
    return (
      <Host>
        <div class="aside-window">
          <slot name="top"></slot>
          <div class="notifications" part="notifications">
            <slot onSlotchange={this.handleSlotChange.bind(this)} />
          </div>
          <slot name="bottom"></slot>
        </div>
      </Host>
    )
  }
}

