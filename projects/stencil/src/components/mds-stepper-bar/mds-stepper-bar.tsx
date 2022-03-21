import { Component, Element, Host, Listen, h, State, Prop, Watch, Event, EventEmitter } from '@stencil/core'

@Component({
  tag: 'mds-stepper-bar',
  styleUrl: 'mds-stepper-bar.css',
  shadow: true,
})
export class MdsStepperBar {

  private items: NodeListOf<HTMLMdsStepperBarItemElement>
  @State() currentItem = 0
  @Element() private element: HTMLMdsStepperBarElement

  /**
   * Sets if the component should handle checked elements from the first to the last child or not
   */
  @Prop() readonly linear = true

  /**
   * Sets the current item to the given index: 0 is none selected, 1 is the first item selected, last number + 1 is all items checked
   */
  @Prop() readonly select: number = 1

  private queryItems = (): NodeListOf<HTMLMdsStepperBarItemElement> =>
    this.element.querySelectorAll<HTMLMdsStepperBarItemElement>('mds-stepper-bar-item')

  private queryContents = (): NodeListOf<HTMLElement> =>
    this.element.querySelectorAll<HTMLElement>('[slot="content"]')

  private minmax = (value: number, min: number, max: number): number =>
    Math.min(Math.max(value, min), max)

  private setCurrent = (index = 1): void => {
    this.items = this.queryItems()
    this.currentItem = index - 1
    this.items.forEach((item, key) => {
      if (this.linear) {
        item.checked = false
        if (key < this.currentItem) {
          item.checked = true
        }
      }
      item.current = false
      if (key === this.currentItem) {
        item.current = true
        this.currentItem = key
      }
    })

    this.itemChangedEvent.emit(this.currentItem)
    this.scrollItems()
    this.setCurrentContent()
  }

  private setCurrentContent = (): void => {
    const contents = this.queryContents()
    contents.forEach((item, key) => {
      item.style.display = 'none'
      if (key === this.currentItem) {
        item.removeAttribute('style')
      }
    })
  }

  /**
   * Emits when a step is changed
   */
  @Event() itemChangedEvent: EventEmitter<number>

  private scrollItems = (): void => {
    const itemsElement = this.element.shadowRoot.querySelector<HTMLDivElement>('.items')
    const pagesItems = this.queryItems()
    const elementIndex = this.minmax(this.currentItem, 0, this.items.length - 1)

    if (elementIndex <= 0) {
      itemsElement.scrollLeft = 0
      return
    }

    if (elementIndex >= pagesItems.length) {
      const pageItem = pagesItems[pagesItems.length - 1]
      itemsElement.scrollLeft = pageItem.offsetLeft - itemsElement.offsetLeft
      return
    }

    const pageItem = pagesItems[elementIndex]
    itemsElement.scrollLeft = pageItem.offsetLeft - itemsElement.offsetLeft - (itemsElement.offsetWidth / 2) + (pageItem.offsetWidth / 2)
  }

  componentWillLoad (): void {
    this.items = this.queryItems()
    this.items.forEach((item, key) => item.id = `item-${key}`)
    const contents = this.queryContents()
    contents.forEach(item => item.style.display = 'none')
  }

  componentDidLoad (): void {
    setTimeout(() => {
      console.log('componentDidLoad')
      this.setCurrent(this.select)
    }, 10)
  }

  @Watch('select')
  itemSelected (newValue: number): void {
    this.setCurrent(newValue)
  }

  @Listen('currentEvent')
  changeEventHandler (event: CustomEvent<string>): void {
    this.items = this.queryItems()
    this.items.forEach((item, key) => {
      item.current = false
      if (`item-${key}` === event.detail) {
        item.current = true
        this.currentItem = key
      }
    })
  }

  render () {
    return (
      <Host>
        <div class="items">
          <slot/>
        </div>
        <div class="contents">
          <slot name="content"/>
        </div>
      </Host>
    )
  }
}
