import miRoundMenu from '@icon/mi/round/menu.svg'
import { Component, Element, Event, EventEmitter, Host, Method, Prop, State, h } from '@stencil/core'
import { HeaderBarMenuType, HeaderBarNavType } from '@type/header-bar'

/**
 * @part actions - Selects the element which wraps `nav` and `hamburger` parts
 * @part hamburger - Selects the `hamburger` menu action element
 * @part nav - Selects the `nav` element that contains the horizontal menu
 * @slot default - Put contents, like logo and a small description shown on the left of the component. Add `text string`, `HTML elements` or `components` to this slot.
 * @slot nav - Put the actions shown when the component is on desktop mode. Add `HTML elements` or `components`, it is **recommended** to use `mds-button` element.
 */

@Component({
  tag: 'mds-header-bar',
  styleUrl: 'mds-header-bar.css',
  shadow: true,
})
export class MdsHeaderBar {

  private hasNav: boolean
  @Element() host: HTMLMdsHeaderBarElement
  @State() isOpened: boolean

  /**
   * Sets the visibility type of the hamburger menu
   */
  @Prop({ reflect: true }) menu: HeaderBarMenuType = 'mobile'

  /**
   * Sets the visibility type of the navigation menu
   */
  @Prop({ reflect: true }) nav: HeaderBarNavType = 'desktop'

  componentWillLoad (): void {
    this.hasNav = this.host.querySelector('[slot="nav"]') !== null
  }

  /**
   * Emits when the component is opened
   */
  @Event({ bubbles: true, eventName: 'mdsHeaderBarOpen' }) openedEvent: EventEmitter<void>

  private open = () => {
    this.isOpened = true
    this.openedEvent.emit()
    this.host.closest('mds-header')?.setOpened(true)
  }

  @Method()
  async setOpened (isOpened: boolean = true): Promise<void> {
    this.isOpened = isOpened
  }

  render () {
    return (
      <Host>
        <div class="content" part="content">
          <div class="logo">
            <slot />
          </div>
          <div class="actions" part="actions">
            {this.nav !== 'none' && this.hasNav &&
              <nav class="nav" part="nav">
                <slot name="nav" />
              </nav>
            }
            {this.menu !== 'none' &&
              <mds-button class="menu" icon={miRoundMenu} onClick={this.open} part="hamburger"></mds-button>
            }
          </div>
        </div>
      </Host>
    )
  }

}
