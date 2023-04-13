import { Component, Element, Event, EventEmitter, Host, Listen, Prop, State, Watch, h } from '@stencil/core'
import { MdsStepperBarEventDetail } from './meta/event-detail'

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
   * Sets the current item to the given index: 0 is none done, 1 is the first item done, last number + 1 is all items done
   */
  @Prop() readonly itemsDone: number = 1

  private queryItems = (): NodeListOf<HTMLMdsStepperBarItemElement> =>
    this.element.querySelectorAll<HTMLMdsStepperBarItemElement>('mds-stepper-bar-item')

  // private queryContents = (): NodeListOf<HTMLElement> =>
  //   this.element.querySelectorAll<HTMLElement>('[slot="content"]')

  private minmax = (value: number, min: number, max: number): number =>
    Math.min(Math.max(value, min), max)

  private setCurrent = (index): void => {
    this.items = this.queryItems()
    this.currentItem = index - 1
    const values = new Array<string>()
    this.items.forEach((item, key) => {
      item.done = false
      if (key < this.currentItem) {
        item.done = true
        if (item.value) {
          values.push(item.value)
        }
      }

      item.current = false
      if (key === this.currentItem) {
        item.current = true
        this.currentItem = key
      }
    })

    this.changedEvent.emit({ value: values.toString(), step: this.currentItem })
    this.scrollItems()
    this.setCurrentContent()
  }

  private setCurrentContent = (): void => {
    const item = this.element.querySelector(`#mds-stepper-bar-item-${this.currentItem}`)
    const content = this.element.shadowRoot?.querySelector('.content') as HTMLElement
    content.innerHTML = ''
    if (item && item.innerHTML) content.innerHTML = item.innerHTML
  }

  /**
   * Emits when a step is changed
   */
  @Event({ eventName: 'mdsStepperBarChange' }) changedEvent: EventEmitter<MdsStepperBarEventDetail>

  private scrollItems = (): void => {
    const itemsElement = this.element.shadowRoot?.querySelector<HTMLDivElement>('.items')
    const pagesItems = this.queryItems()
    const elementIndex = this.minmax(this.currentItem, 0, this.items.length - 1)

    if (!itemsElement) throw Error('No mds-stepper-bar-items found')

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
    this.items.forEach((item, key) => {
      item.id = `mds-stepper-bar-item-${key}`
    })
  }

  componentDidLoad (): void {
    setTimeout(() => {
      this.setCurrent(this.itemsDone)
    }, 10)
  }

  @Watch('itemsDone')
  itemDone (newValue: number): void {
    this.setCurrent(newValue)
  }

  @Listen('mdsStepperBarItemDone')
  changeEventHandler (event: CustomEvent<string>): void {
    this.items = this.queryItems()
    this.items.forEach((item, key) => {
      item.done = false
      if (`mds-stepper-bar-item-${key}` === event.detail) {
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
        <div class="content">
        </div>
      </Host>
    )
  }
}
