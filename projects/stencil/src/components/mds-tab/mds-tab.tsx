import { Component, Element, Event, EventEmitter, Host, Listen, h, Prop } from '@stencil/core'
import { MdsTabEventDetail } from './meta/event-detail'
import { MdsTabItemEventDetail } from '@component/mds-tab-item/meta/event-detail'
import { setAttributeIfEmpty } from '@common/aria'

/**
 * @slot default - Add `mds-tab-item` element/s.
 * @slot content - Add `HTML elements` or `components`, one per mds-tab-item added.
 */

@Component({
  tag: 'mds-tab',
  styleUrl: 'mds-tab.css',
  shadow: true,
})
export class MdsTab {

  @Element() private element: HTMLMdsTabElement
  private currentItem: number = -1
  private tabs: HTMLElement
  private tabItems: NodeListOf<HTMLMdsTabItemElement>
  private contentItems: NodeListOf<HTMLElement>

  /**
   * Shows the horizontal scrollbar to maximize accessibility
   */
  @Prop({ reflect: true }) readonly scrollbar?: boolean

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
    this.contentItems.forEach((item: HTMLElement): void => {
      setAttributeIfEmpty(item, 'role', 'tabpanel')
    })
    this.selectContentItem()
  }

  private scrollTabs = (key: number): void => {
    const tabItem = this.tabItems[key]
    this.tabs.scrollLeft = tabItem.offsetLeft - this.tabs.offsetLeft - (this.tabs.offsetWidth / 2) + (tabItem.offsetWidth / 2)
  }

  private selectContentItem = (): void => {
    this.contentItems.forEach((item: HTMLElement, index: number) => {
      item.setAttribute('mds-tab-content-hidden', '')
      if (index === this.currentItem) {
        item.removeAttribute('mds-tab-content-hidden')
      }
    })
  }

  @Listen('mdsTabItemSelect')
  changeEventHandler (event: CustomEvent<MdsTabItemEventDetail>): void {
    // since the external developer can define a custom id
    // we must find the key from event.detail
    this.tabItems.forEach((item, key: number) => {
      if (item.id === event.detail.target.id) {
        item.selected = true
        this.changedEvent.emit({ id: key, value: item.value })
        this.currentItem = key
        this.scrollTabs(key)
      } else {
        item.selected = false
      }
    })
    this.selectContentItem()
  }

  @Listen('mdsTabItemFocus')
  focusEventHandler (event: CustomEvent<MdsTabItemEventDetail>): void {
    this.tabItems.forEach((item, key: number) => {
      if (item.id === event.detail.target.id) {
        this.scrollTabs(key)
      }
    })
  }

  render () {
    return (
      <Host>
        <div class="tabs" part="tabs" role="tablist">
          <slot />
        </div>
        <div class="contents" part="contents">
          <slot name="content"/>
        </div>
      </Host>
    )
  }

}
