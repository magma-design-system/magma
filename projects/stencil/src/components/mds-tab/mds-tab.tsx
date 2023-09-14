import { Component, Element, Event, EventEmitter, Host, Listen, h } from '@stencil/core'
import { MdsTabEventDetail } from './meta/event-detail'

/**
 * @slot content - TODOSLOT
 */
@Component({
  tag: 'mds-tab',
  styleUrl: 'mds-tab.css',
  shadow: true,
})
export class MdsTab {

  @Element() private element: HTMLMdsTabElement
  private currentItem = -1
  private tabs: HTMLElement
  private tabItems: NodeListOf<HTMLMdsTabItemElement>
  private contentItems: NodeListOf<HTMLElement>

  /**
   * Emits when a children is changed
   */
  @Event({ eventName: 'mdsTabChange' }) changedEvent: EventEmitter<MdsTabEventDetail>

  private queryContentItems = (): NodeListOf<HTMLElement> =>
    this.element.querySelectorAll<HTMLElement>('[slot=content]')

  componentWillLoad (): void {
    this.tabItems = this.element.querySelectorAll<HTMLMdsTabItemElement>('mds-tab-item')

    this.tabItems.forEach((item, key) => {
      if (!item.id) {
        item.id = `mds-tab-item-${key}`
      }
      if (item.selected) {
        this.currentItem = key
      }
    })
  }

  componentDidLoad (): void {
    this.tabs = this.element.shadowRoot?.querySelector('.tabs') as HTMLElement
    this.contentItems = this.queryContentItems()
    this.selectContentItem()
  }

  private scrollTabs = (): void => {
    const tabItem = this.tabItems[this.currentItem]
    this.tabs.scrollLeft = tabItem.offsetLeft - this.tabs.offsetLeft - (this.tabs.offsetWidth / 2) + (tabItem.offsetWidth / 2)
  }

  private selectTabItem = (scrollItem: number): void => {
    this.tabItems.forEach((item, key) => {
      if (key === scrollItem) {
        item.selected = true
        this.changedEvent.emit({ id: key })
        this.currentItem = key
        this.scrollTabs()
      } else {
        item.selected = false
      }
    })
  }

  private selectContentItem = (): void => {
    this.contentItems.forEach((item: HTMLElement, index: number) => {
      item.classList.add('hidden')
      if (index === this.currentItem) {
        item.classList.remove('hidden')
      }
    })
  }

  @Listen('mdsTabItemSelect')
  changeEventHandler (event: CustomEvent<string>): void {
    // since the external developer can define a custom id
    // we must find the key from event.detail
    this.tabItems.forEach((item, key: number) => {
      if (item.id === event.detail) {
        this.selectTabItem(key)
      } else {
        item.selected = false
      }
    })

    this.selectContentItem()
  }

  render () {
    return (
      <Host>
        <div class="tabs" part="tabs">
          <slot />
        </div>
        <div class="contents" part="contents">
          <slot name="content"/>
        </div>
      </Host>
    )
  }

}
