import { Component, Host, h, Listen, Element } from '@stencil/core'

@Component({
  tag: 'mds-tab',
  styleUrl: 'mds-tab.css',
  shadow: true,
})
export class MdsTab {

  @Element() private element: HTMLMdsTabElement
  private currentItem: number

  private queryItems = ():NodeListOf<HTMLMdsTabItemElement> =>
    this.element.querySelectorAll<HTMLMdsTabItemElement>('mds-tab-item')

  componentWillLoad ():void {
    const items = this.queryItems()
    items.forEach((item, key) => item.id = `item-${key}`)
  }

  private scrollTabs = (): void => {
    const items = this.queryItems()
    const tabItem = items[this.currentItem]
    this.element.scrollLeft = tabItem.offsetLeft - this.element.offsetLeft - (this.element.offsetWidth / 2) + (tabItem.offsetWidth / 2)
  }

  @Listen('selectedEvent')
  changeEventHandler (event: CustomEvent<string>): void {
    const items = this.element.querySelectorAll<HTMLMdsTabItemElement>('mds-tab-item')
    items.forEach((item, key) => {
      if (`item-${key}` === event.detail) {
        item.selected = true
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
        <slot name="tab-item"/>
      </Host>
    )
  }

}
