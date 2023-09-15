import miRoundMenu from '@icon/mi/round/menu.svg'
import { Component, Element, Event, EventEmitter, Host, Listen, Prop, State, h } from '@stencil/core'
import clsx from 'clsx'

/**
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
   * Sets the visibility of the hamburger menu for mobile behaviour, it's automatically set by mds-header parent
   */
  @Prop({ mutable: true, reflect: true }) mobileMenu = true

  componentWillLoad (): void {
    this.hasNav = this.host.querySelector('[slot="nav"]') !== null
  }

  /**
   * Emits when the component is opened
   */
  @Event({ bubbles: true, composed: true, eventName: 'mdsHeaderBarOpen' }) openedEvent: EventEmitter<void>

  private open = () => {
    this.isOpened = true
    this.openedEvent.emit()
  }

  @Listen('mdsHeaderClose', { target: 'document' })
  closedHandler (): void {
    this.isOpened = false
  }

  render () {
    return (
      <Host>
        <div class="contents">
          <div class="logo">
            <slot />
          </div>
          {this.hasNav &&
            <nav class={clsx('nav', this.mobileMenu && 'nav--hide-on-mobile')}>
              <slot name="nav" />
            </nav>
          }
          {this.mobileMenu &&
            <i class="svg icon" innerHTML={miRoundMenu} onClick={this.open} />
          }
        </div>
      </Host>
    )
  }

}
