import { Component, Element, Event, EventEmitter, Host, Listen, State, h } from '@stencil/core'

@Component({
  tag: 'mds-header-bar',
  styleUrl: 'mds-header-bar.css',
  shadow: true,
})
export class MdsHeaderBar {

  private hasNav: boolean
  @Element() hostElement: HTMLMdsHeaderBarElement

  @State() isOpened:boolean

  componentWillLoad (): void {
    this.hasNav = this.hostElement.querySelector('[slot="nav"]') !== null
  }

  /**
   * Emits when the component is opened
   */
  @Event({ bubbles: true, composed: true }) headerOpened: EventEmitter<void>

  private open = () => {
    this.isOpened = true
    this.headerOpened.emit()
  }

  @Listen('headerClosed', { target: 'document' })
  closedHandler (): void {
    this.isOpened = false
  }

  render () {
    return (
      <Host>
        <div class="contents">
          <div class="logo">
            <slot/>
          </div>
          { this.hasNav &&
            <nav class="nav">
              <slot name="nav"/>
            </nav>
          }
          { this.hasNav &&
            <mds-icon class="icon" name="menu" onClick={ this.open }/>
          }
        </div>
      </Host>
    )
  }

}
