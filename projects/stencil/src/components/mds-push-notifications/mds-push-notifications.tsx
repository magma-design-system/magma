import { Component, Element, Host, h, Prop } from '@stencil/core'
// import { cssSizeToNumber } from '@common/unit'
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
  private cssItemsDelay: string
  private cssItemsDuration: string
  private cssItemsGap: string
  private totalItems = 0
  // private guardTimer = new Date()
  private runningItems = 0

  /**
   * Specifies if the component is visible or not.
   */
  @Prop({ reflect: true }) readonly visible?: boolean

  /**
   * Specifies if the component visibility is handled when new `mds-push-notification` components are added to this component or when they are removed.
   */
  @Prop({ reflect: true }) readonly visiblity?: 'auto'|'visible'|'hidden'

  private introItem = (element: HTMLElement, delay: number, isLast: boolean): void => {
    element.style.visibility = 'hidden'
    element.style.position = 'absolute'

    setTimeout(() => {
      element.style.marginBottom = `-${element.offsetHeight + cssSizeToNumber(this.cssItemsGap)}px`
      setTimeout(() => {
        element.style.visibility = ''
        element.style.position = ''
        element.style.transform = 'translate(0, 0)'
        element.style.marginBottom = '0px'

        /* TODO: questo controllo va spostato in un timer a parte */
        if (isLast) {
          console.info('stop running items')
          this.runningItems = 0
        }
      }, cssDurationToMilliseconds(this.cssItemsDuration))
    }, delay ? delay : 15)
  }

  private handleSlotChange = (): void => {
    this.updateCSSCustomProps()
    const elements = this.host.shadowRoot?.querySelectorAll('slot')[1]?.assignedNodes()
    if (!elements) {
      console.info('No slotted elements found.')
      return
    }

    console.info(this.runningItems)

    while (this.totalItems < elements.length) {
      const delay = cssDurationToMilliseconds(this.cssItemsDelay) * this.runningItems
      console.info('delay', delay)
      this.introItem(elements[this.totalItems] as HTMLElement, delay, this.totalItems === elements.length - 1)
      this.totalItems += 1
      this.runningItems += 1

      // if (this.totalItems === elements.length - 1) {
      //   this.guardTimer = new Date()
      // }
    }

    /*
      TODO: manca un timer che fa la differenza tra un gruppo aggiunto e l'altro
      in modo da appenderli in modo omogeneo
    */

    setTimeout(() => {
      // ciaone
    }, cssDurationToMilliseconds(this.cssItemsDelay) * this.runningItems)
  }

  private updateCSSCustomProps = (): void => {
    const elementStyles = window.getComputedStyle(this.host)
    this.cssItemsGap = elementStyles.getPropertyValue('--mds-push-notifications-items-gap') ?? '0.5rem'
    this.cssItemsDuration = elementStyles.getPropertyValue('--mds-push-notifications-items-duration') ?? '200ms'
    this.cssItemsDelay = elementStyles.getPropertyValue('--mds-push-notifications-items-delay') ?? '100ms'
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
