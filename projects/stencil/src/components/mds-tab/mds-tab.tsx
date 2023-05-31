import { Component, Element, Event, EventEmitter, Host, Listen, h } from '@stencil/core'
import { MdsTabEventDetail } from './meta/event-detail'
import { cssDurationToMilliseconds } from '@common/unit'

@Component({
  tag: 'mds-tab',
  styleUrl: 'mds-tab.css',
  shadow: true,
})
export class MdsTab {

  @Element() private element: HTMLMdsTabElement
  private currentItem: number
  private switchAnimationDuration: number

  /**
   * Emits when a children is changed
   */
  @Event({ eventName: 'mdsTabChange' }) changedEvent: EventEmitter<MdsTabEventDetail>

  private queryItems = ():NodeListOf<HTMLMdsTabItemElement> =>
    this.element.querySelectorAll<HTMLMdsTabItemElement>('mds-tab-item')

  private attachContents = (): void => {
    const items = this.element.querySelectorAll('mds-tab-item')
    const contents = this.element.shadowRoot?.querySelector('.contents') as HTMLElement
    contents.innerHTML = ''
    if (items) {
      items.forEach((el: Element) => {
        const wrapper = document.createElement('div')
        wrapper.classList.add('content')
        wrapper.innerHTML = el.innerHTML
        contents.appendChild(wrapper)
      })
    }
  }

  private switchContent = (): void => {
    console.log(this.currentItem)

  }

  componentWillLoad ():void {
    const items = this.queryItems()
    items.forEach((item, key) => {
      if (!item.id) {
        item.id = `mds-tab-item-${key}`
      }
      if (item.selected) {
        this.currentItem = key
      }
    })
  }

  componentDidLoad ():void {
    this.attachContents()
    this.switchContent()
  }

  componentDidUpdate ():void {
    const elementStyles = window.getComputedStyle(this.element)
    this.switchAnimationDuration = cssDurationToMilliseconds(elementStyles.getPropertyValue('--mds-tab-duration'))
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
    this.switchContent()
  }

  render () {
    return (
      <Host>
        <div class="tabs" part="tabs">
          <slot/>
        </div>
        <div class="contents" part="contents"></div>
      </Host>
    )
  }

}
