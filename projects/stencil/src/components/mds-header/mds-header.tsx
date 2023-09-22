import { Component, Element, Event, EventEmitter, Host, Listen, State, h, Prop, Watch } from '@stencil/core'
import { MdsHeaderEventDetail } from './meta/event-detail'
import { MenuType } from '../mds-header-bar/meta/types'

/**
 * @slot default - Add `mds-header-bar` element/s.
 * @slot menu - Put actions and other contents that will be shown as mobile menu. Add `text string`, `HTML elements` or `components` to this slot.
 */

/**
 * @part menu - The container element of the modal
 */

@Component({
  tag: 'mds-header',
  styleUrl: 'mds-header.css',
  shadow: true,
})
export class MdsHeader {

  @Element() host: HTMLMdsHeaderElement
  @State() hasMenu: boolean
  @State() isOpened: boolean

  /**
   * Sets the visibility type of the hamburger menu of mds-header-bar
   */
  @Prop({ reflect: true }) menu: MenuType = 'mobile'

  /**
   * Sets the visibility type of the navigation menu of mds-header-bar
   */
  @Prop({ reflect: true }) nav: MenuType = 'desktop'

  /**
   * Emits when the component is closed
   */
  @Event({ bubbles: true, composed: true, eventName: 'mdsHeaderClose' }) closedEvent: EventEmitter<MdsHeaderEventDetail>

  private mobileMenu = (): HTMLElement => {
    return this.host.querySelector('[slot="menu"]') as HTMLElement
  }

  private headerBar = (): HTMLMdsHeaderBarElement => {
    return this.host.querySelector('mds-header-bar') as HTMLMdsHeaderBarElement
  }

  private close = () => {
    this.isOpened = false
    this.closedEvent.emit({ bar: this.headerBar() })
  }

  componentDidLoad (): void {
    this.hasMenu = this.mobileMenu() !== null
    if (this.hasMenu) {
      return
    }
    const headerBar = this.headerBar()
    headerBar.setAttribute('menu', 'none')
  }

  @Listen('mdsHeaderBarOpen', { target: 'document' })
  onModalOpenedHandler (): void {
    this.isOpened = true
  }

  @Watch('menu')
  onMenuChangedHandler (newValue: MenuType): void {
    const headerBar = this.headerBar()
    headerBar.setAttribute('menu', newValue)
  }

  @Watch('nav')
  onNavChangedHandler (newValue: MenuType): void {
    const headerBar = this.headerBar()
    headerBar.setAttribute('nav', newValue)
  }

  render () {
    return (
      <Host>
        <slot />
        {this.hasMenu &&
          <div class="menu" part="menu">
            <mds-modal class="modal" opened={this.isOpened} onMdsModalClose={this.close}>
              <slot name="menu" />
            </mds-modal>
          </div>
        }
      </Host>
    )
  }
}
