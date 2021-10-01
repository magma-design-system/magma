import { Component, Element, Host, h, Prop, Listen } from '@stencil/core'

@Component({
  tag: 'mds-accordion',
  styleUrl: 'mds-accordion.css',
  shadow: true,
})
export class MdsAccordion {

  @Element() private element: HTMLMdsAccordionElement;

  /**
   * Choose if multiple siblings can be opened simultaneously
   */
  @Prop() multiple?: boolean

  private queryItems = ():NodeListOf<HTMLMdsAccordionItemElement> =>
    this.element.querySelectorAll<HTMLMdsAccordionItemElement>('mds-accordion-item')

  componentWillLoad ():void {
    const items = this.queryItems()
    items.forEach((item, key) => item.id = `item-${key}`)
  }

  @Listen('openedEvent')
  changeEventHandler (event: CustomEvent<string>): void {
    if (this.multiple) {
      return
    }
    const items = this.queryItems()
    items.forEach((item, key) => item.opened = `item-${key}` === event.detail)
  }

  render () {
    return (
      <Host>
        <slot></slot>
      </Host>
    )
  }
}
