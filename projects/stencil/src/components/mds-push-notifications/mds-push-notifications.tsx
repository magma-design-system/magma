import { Component, Element, Host, h, Prop } from '@stencil/core'
import { cssDurationToMilliseconds, cssSizeToNumber } from '@common/unit'

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

  // TODO [fix] If visibility is set to false, hide all the notifications area also when they are added
  // TODO [fix] If visibility is set to true, shows all the notifications area also when they removed
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
    if (this.totalItems === 0) {
      this.visible = false
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
  }

  private updateCSSCustomProps = (): void => {
    const elementStyles = window.getComputedStyle(this.host)
    this.cssItemsGap = elementStyles.getPropertyValue('--mds-push-notifications-items-gap') ?? '0.5rem'
    this.cssItemsDuration = elementStyles.getPropertyValue('--mds-push-notifications-items-duration') ?? '200ms'
  }

  componentDidLoad (): void {
    this.updateCSSCustomProps()
  }

  render () {
    return (
      <Host>
        <slot name="top"></slot>
        <div class="notifications" part="notifications">
          <slot onSlotchange={this.handleSlotChange.bind(this)} />
        </div>
        <slot name="bottom"></slot>
      </Host>
    )
  }
}

