import { Component, Element, Event, EventEmitter, Host, Listen, h } from '@stencil/core'
import { MdsTabEventDetail } from './meta/event-detail'

@Component({
  tag: 'mds-tab',
  styleUrl: 'mds-tab.css',
  shadow: true,
})
export class MdsTab {

  @Element() private element: HTMLMdsTabElement
  private currentItem: number

  /**
   * Emits when a children is changed
   */
  @Event({ eventName: 'mdsTabChange' }) changedEvent: EventEmitter<MdsTabEventDetail>

  private queryItems = ():NodeListOf<HTMLMdsTabItemElement> =>
    this.element.querySelectorAll<HTMLMdsTabItemElement>('mds-tab-item')

  componentWillLoad ():void {
    const items = this.queryItems()
    items.forEach((item, key) => {
      if (!item.id) {
        item.id = `mds-tab-item-${key}`
      }
    })
  }

  private scrollTabs = (): void => {
    const items = this.queryItems()
    const tabItem = items[this.currentItem]
    this.element.scrollLeft = tabItem.offsetLeft - this.element.offsetLeft - (this.element.offsetWidth / 2) + (tabItem.offsetWidth / 2)
  }

  @Listen('mdsTabItemSelect')
  changeEventHandler (event: CustomEvent<string>): void {
    const items = this.element.querySelectorAll<HTMLMdsTabItemElement>('mds-tab-item')
    items.forEach((item, key) => {
      if (item.id === event.detail) {
        item.selected = true
        this.changedEvent.emit({ id: key })
        this.currentItem = key
        this.scrollTabs()
      } else {
        item.selected = false
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
