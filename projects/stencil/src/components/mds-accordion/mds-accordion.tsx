import { MdsAccordionItemEventDetail } from '@component/mds-accordion-item/meta/event-detail'
import { Component, Element, Event, EventEmitter, Host, Listen, Prop, h } from '@stencil/core'
import { MdsAccordionEventDetail } from './meta/event-detail'

/**
 * @slot default - Add `mds-accordion-item` element/s.
 */

@Component({
  tag: 'mds-accordion',
  styleUrl: 'mds-accordion.css',
  shadow: true,
})
export class MdsAccordion {

  @Element() private element: HTMLMdsAccordionElement

  /**
   * Choose if multiple siblings can be selected simultaneously
   */
  @Prop() readonly multiple?: boolean = false

  /**
   * Specifies if an item can be closed by user
   */
  @Prop() readonly closable?: boolean = true

  /**
   * Emits when the component attribute selected is changed
   */
  @Event({ eventName: 'mdsAccordionChange' }) changedEvent: EventEmitter<MdsAccordionEventDetail>

  private queryItems = (): NodeListOf<HTMLMdsAccordionItemElement> =>
    this.element.querySelectorAll<HTMLMdsAccordionItemElement>('mds-accordion-item')

  componentWillLoad (): void {
    const items = this.queryItems()
    items.forEach((item, key) => item.id = `item-${key}`)
  }

  private selectMultipleItems = (): void => {
    const items = this.queryItems()
    const list: (HTMLMdsAccordionItemElement | null)[] = []
    const selectedItem: number[] = []
    items.forEach((item, key) => {
      item.selected ? list.push(item) : list.push(null)
      if (item.selected) {
        selectedItem.push(key)
      }
    })
    this.changedEvent.emit({ children: items, selected: selectedItem.toString() })
  }

  private changedChildrenHandler = (event: CustomEvent<MdsAccordionItemEventDetail>): void => {
    const items = this.queryItems()

    if (this.multiple) {
      this.selectMultipleItems()
      return
    }

    items.forEach((item, key) => {
      item.selected = `item-${key}` === event.detail.id && (event.detail.selected || !this.closable)
      if (item.selected) {
        this.changedEvent.emit({ children: items, selected: key.toString() })
      }
    })
  }

  @Listen('mdsAccordionItemSelect')
  selectedEventHandler (event: CustomEvent<MdsAccordionItemEventDetail>): void {
    this.changedChildrenHandler(event)
  }

  @Listen('mdsAccordionItemUnselect')
  unselectedEventHandler (event: CustomEvent<MdsAccordionItemEventDetail>): void {
    this.changedChildrenHandler(event)
  }

  render () {
    return (
      <Host>
        <slot />
      </Host>
    )
  }
}
