import { Component, Element, Host, h, State, Event, EventEmitter, Listen } from '@stencil/core'
import { MdsHeaderEventDetail } from './meta/event-detail'

@Component({
  tag: 'mds-header',
  styleUrl: 'mds-header.css',
  shadow: true,
})
export class MdsHeader {

  private hasNav: boolean
  @Element() host: HTMLMdsHeaderElement
  @State() isOpened: boolean

  /**
   * Emits when the component is closed
   */
  @Event({ bubbles: true, composed: true, eventName: 'mdsHeaderClose' }) closedEvent: EventEmitter<MdsHeaderEventDetail>

  private bar = ():HTMLMdsHeaderBarElement => {
    return this.host.querySelector('[slot="nav-mobile"]') as HTMLMdsHeaderBarElement
  }

  private close = () => {
    this.isOpened = false
    this.closedEvent.emit({ bar: this.bar() })
  }

  componentWillLoad (): void {
    this.hasNav = this.bar() !== null
  }

  @Listen('mdsHeaderBarOpen', { target: 'document' })
  onModalOpenedHandler (): void {
    this.isOpened = true
  }

  render () {
    return (
      <Host>
        <slot/>
        { this.hasNav &&
          <div class="nav">
            <mds-modal class="modal" opened={ this.isOpened } onMdsModalClose={ this.close }>
              <slot name="nav-mobile"/>
            </mds-modal>
          </div>
        }
      </Host>
    )
  }
}
