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
  private cssItemsGap: string
  private cssItemsDuration: string
  private cssItemsDelay: string

  /**
   * Specifies if the component is visible or not.
   */
  @Prop({ reflect: true }) readonly visible?: boolean

  /**
   * Specifies if the component visibility is handled when new `mds-push-notification` components are added to this component or when they are removed.
   */
  @Prop({ reflect: true }) readonly visiblity?: 'auto'|'manual'

  private introItem = (element: HTMLElement): void => {
    element.style.visibility = 'hidden'
    element.style.position = 'absolute'

    setTimeout(() => {
      element.style.marginBottom = `-${element.offsetHeight + cssSizeToNumber(this.cssItemsGap)}px`
      setTimeout(() => {
        element.style.visibility = ''
        element.style.position = ''
        element.style.transform = 'translate(0, 0)'
        element.style.marginBottom = '0px'
      }, cssDurationToMilliseconds(this.cssItemsDelay) + cssDurationToMilliseconds(this.cssItemsDuration))
    }, 15)
  }

  private handleSlotChange = (): void => {
    this.updateCSSCustomProps()
    const elements = this.host.shadowRoot?.querySelectorAll('slot')[1]?.assignedNodes()
    if (!elements) {
      console.info('No slotted elements found.')
      return
    }
    const lastElement:HTMLElement = elements[elements.length - 1] as HTMLElement
    this.introItem(lastElement)
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
