import { Component, Element, Event, EventEmitter, Host, Listen, Prop, State, Watch, h } from '@stencil/core'
import { MdsStepperBarEventDetail } from './meta/event-detail'

/**
 * @slot default - Add `mds-tepper-bar-item` element/s.
 * @slot content - Add `HTML elements` or `components`, one per mds-stepper-bar-item added
 */

@Component({
  tag: 'mds-stepper-bar',
  styleUrl: 'mds-stepper-bar.css',
  shadow: true,
})
export class MdsStepperBar {

  private items: NodeListOf<HTMLMdsStepperBarItemElement>
  private contentItems: NodeListOf<HTMLElement>
  @State() currentItem = 0
  @Element() private element: HTMLMdsStepperBarElement

  /**
   * Sets the current item to the given index: 0 is none done, 1 is the first item done, last number + 1 is all items done
   */
  @Prop() readonly itemsDone: number = 1

  private queryItems = (): NodeListOf<HTMLMdsStepperBarItemElement> =>
    this.element.querySelectorAll<HTMLMdsStepperBarItemElement>('mds-stepper-bar-item')

  private queryContentItems = (): NodeListOf<HTMLElement> =>
    this.element.querySelectorAll<HTMLElement>('[slot=content]')

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
    this.contentItems.forEach((item: HTMLElement, index: number) => {
      item.classList.add('hidden')
      if (index === this.currentItem) {
        item.classList.remove('hidden')
      }
    })
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
    this.contentItems = this.queryContentItems()
    this.setCurrent(this.itemsDone)
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
        <div class="contents" part="contents">
          <slot name="content"/>
        </div>
      </Host>
    )
  }
}
