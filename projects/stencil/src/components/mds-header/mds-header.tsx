import { Component, Element, Host, h, State, Event, EventEmitter, Listen } from '@stencil/core'

@Component({
  tag: 'mds-header',
  styleUrl: 'mds-header.css',
  shadow: true,
})
export class MdsHeader {

  private hasNav: boolean
  @Element() hostElement: HTMLMdsHeaderElement
  @State() isOpened: boolean

  /**
   * Emits when the component is closed
   */
  @Event({ bubbles: true, composed: true }) headerClosed: EventEmitter<void>

  private close = () => {
    this.isOpened = false
    this.headerClosed.emit()
  }

  componentWillLoad (): void {
    this.hasNav = this.hostElement.querySelector('[slot="nav-mobile"]') !== null
  }

  @Listen('headerOpened', { target: 'document' })
  onModalOpenedHandler (): void {
    this.isOpened = true
  }

  render () {
    return (
      <Host>
        <slot/>
        { this.hasNav &&
          <div class="nav">
            <mds-modal class="modal" opened={ this.isOpened } onClose={ this.close }>
              <slot name="nav-mobile"/>
            </mds-modal>
          </div>
        }
      </Host>
    )
  }
}
