import { Component, Event, EventEmitter, Element, Host, h, Listen } from '@stencil/core'
import { MdsTabBarEventDetail } from './meta/event-detail'

/**
 * @slot default - Add `mds-tab-bar-item` element/s.
 */

@Component({
  tag: 'mds-tab-bar',
  styleUrl: 'mds-tab-bar.css',
  shadow: true,
})
export class MdsTabBar {

  @Element() private element: HTMLMdsTabBarElement

  /**
   * Emits when a step is changed
   */
  @Event({ eventName: 'mdsTabBarChange' }) changedEvent: EventEmitter<MdsTabBarEventDetail>

  private queryItems = ():NodeListOf<HTMLMdsTabBarItemElement> =>
    this.element.querySelectorAll<HTMLMdsTabBarItemElement>('mds-tab-bar-item')

  componentWillLoad ():void {
    const items = this.queryItems()
    items.forEach((item, key) => item.id = `mds-tab-bar-item-${key}`)
  }

  @Listen('mdsTabBarItemSelect')
  changeEventHandler (event: CustomEvent<string>): void {
    const items = this.queryItems()
    items.forEach((item, key) => {
      item.selected = `mds-tab-bar-item-${key}` === event.detail
      if (item.selected) {
        this.changedEvent.emit({ index: key })
      }
    })
  }

  render () {
    return (
      <Host>
        <slot/>
      </Host>
    )
  }
}
