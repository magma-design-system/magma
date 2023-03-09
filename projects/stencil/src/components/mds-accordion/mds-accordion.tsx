import { Component, Element, Host, h, Prop, Listen } from '@stencil/core'
import { AccordionClickedEvent } from './meta/interface'

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

  private queryItems = ():NodeListOf<HTMLMdsAccordionItemElement> =>
    this.element.querySelectorAll<HTMLMdsAccordionItemElement>('mds-accordion-item')

  componentWillLoad ():void {
    const items = this.queryItems()
    items.forEach((item, key) => item.id = `item-${key}`)
  }

  @Listen('mdsAccordionItemSelect')
  selectedEventHandler (event: CustomEvent<AccordionClickedEvent>): void {
    const items = this.queryItems()
    if (this.multiple) {
      const list = []
      items.forEach((item, key) => {
        item.selected ? list.push(item) : list.push(null)
        item.classList.remove('sibling')
        if (list.length > 1 && list[key - 1] !== null) {
          item.classList.add('sibling')
        }
      })
      return
    }
    items.forEach((item, key) => item.selected = `item-${key}` === event.detail.id && (event.detail.selected || !this.closable))
  }

  render () {
    return (
      <Host>
        <slot/>
      </Host>
    )
  }
}
