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
  private cssItemsDuration: string
  private cssItemsGap: string
  private totalItems = 0

  /**
   * Specifies if the component is visible or not.
   */
  @Prop({ reflect: true }) readonly visible?: boolean

  /**
   * Specifies if the component visibility is handled when new `mds-push-notification` components are added to this component or when they are removed.
   */
  @Prop({ reflect: true }) readonly visiblity?: 'auto'|'visible'|'hidden'

  private introItem (element: HTMLElement) {
    return new Promise<void>(resolve => {
      element.style.visibility = 'hidden'
      element.style.position = 'absolute'
      element.style.marginBottom = `-${element.offsetHeight + cssSizeToNumber(this.cssItemsGap)}px`
      setTimeout(() => {
        element.style.visibility = ''
        element.style.position = ''
        element.style.transform = 'translate(0, 0)'
        element.style.marginBottom = '0px'

        resolve()
      }, cssDurationToMilliseconds(this.cssItemsDuration))

    })
  }

  private handleSlotChange = (): void => {
    this.updateCSSCustomProps()
    const elements = this.host.shadowRoot?.querySelectorAll('slot')[1]?.assignedNodes()
    if (!elements) {
      console.info('No slotted elements found.')
      return
    }

    const itemsIntro: Promise<void>[] = []

    while (this.totalItems < elements.length) {
      itemsIntro.push(this.introItem(elements[this.totalItems] as HTMLElement))
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

