import { Component, Element, Event, EventEmitter, Host, Listen, State, h } from '@stencil/core'
import { MdsHeaderEventDetail } from './meta/event-detail'

/**
 * @slot nav-mobile - TODOSLOT
 */
@Component({
  tag: 'mds-header',
  styleUrl: 'mds-header.css',
  shadow: true,
})
export class MdsHeader {

  @Element() host: HTMLMdsHeaderElement
  @State() hasNav: boolean
  @State() isOpened: boolean

  /**
   * Emits when the component is closed
   */
  @Event({ bubbles: true, composed: true, eventName: 'mdsHeaderClose' }) closedEvent: EventEmitter<MdsHeaderEventDetail>

  private mobileMenu = (): HTMLElement => {
    return this.host.querySelector('[slot="nav-mobile"]') as HTMLElement
  }

  private headerBar = (): HTMLMdsHeaderBarElement => {
    return this.host.querySelector('mds-header-bar') as HTMLMdsHeaderBarElement
  }

  private close = () => {
    this.isOpened = false
    this.closedEvent.emit({ bar: this.headerBar() })
  }

  componentDidLoad (): void {
    this.hasNav = this.mobileMenu() !== null
    const headerBar = this.headerBar()
    headerBar.setAttribute('mobile-menu', this.hasNav.toString())
  }

  @Listen('mdsHeaderBarOpen', { target: 'document' })
  onModalOpenedHandler (): void {
    this.isOpened = true
  }

  render () {
    return (
      <Host>
        <slot />
        {this.hasNav &&
          <div class="nav">
            <mds-modal class="modal" opened={this.isOpened} onMdsModalClose={this.close}>
              <slot name="nav-mobile" />
            </mds-modal>
          </div>
        }
      </Host>
    )
  }
}
