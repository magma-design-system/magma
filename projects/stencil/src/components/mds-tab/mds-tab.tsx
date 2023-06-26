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
  private lastKnownContentsScrollX: number
  private contents: HTMLElement
  private tabs: HTMLElement
  private ticking: boolean
  private tabItems: NodeListOf<HTMLMdsTabItemElement>
  private tabContents: NodeListOf<HTMLElement>

  /**
   * Emits when a children is changed
   */
  @Event({ eventName: 'mdsTabChange' }) changedEvent: EventEmitter<MdsTabEventDetail>

  componentWillLoad (): void {
    this.tabItems = this.element.querySelectorAll<HTMLMdsTabItemElement>('mds-tab-item')
    this.tabContents = this.element.querySelectorAll<HTMLElement>('[slot=content]')

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
    this.contents = this.element.shadowRoot?.querySelector('.contents') as HTMLElement
    console.log(this.contents)
    if (this.tabContents.length > 0) {
      this.contents.addEventListener('scrollend', this.changeHeightOnScrollEnd.bind(this))
      this.contents.addEventListener('scroll', this.findCurrentItem.bind(this))
    }
  }

  disconnectedCallback (): void {
    this.contents.removeEventListener('scrollend', this.changeHeightOnScrollEnd.bind(this))
    this.contents.removeEventListener('scroll', this.findCurrentItem.bind(this))
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

  private findCurrentItem = (): void => {
    const contentBox = this.tabContents[0].getBoundingClientRect()
    if (!this.ticking) {
      window.requestAnimationFrame(() => {
        this.lastKnownContentsScrollX = Math.abs(contentBox.left - this.contents.offsetLeft)
        const foundItem = Math.round(this.lastKnownContentsScrollX * this.tabContents.length / (contentBox.width * this.tabContents.length))
        if (foundItem !== this.currentItem) {
          this.selectTabItem(foundItem)
        }
        this.ticking = false
      })
      this.ticking = true
    }
  }

  private changeHeightOnScrollEnd = (): void => {
    const contentBox = this.tabContents[this.currentItem].getBoundingClientRect()
    this.contents.style.setProperty('--mds-tab-contents-height', `${contentBox.height}px`)
  }

  private scrollToContent = (): void => {
    const contentBox = this.tabContents[0].getBoundingClientRect()
    this.contents.scrollLeft = contentBox.width * this.currentItem
  }

  @Listen('mdsTabItemSelect')
  changeEventHandler (event: CustomEvent<string>): void {
    // since the external developer can define a custom id
    // we must find the key from event.detail
    this.tabItems.forEach((item, key) => {
      if (item.id === event.detail) {
        this.selectTabItem(key)
      } else {
        item.selected = false
      }
    })

    this.scrollToContent()
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
