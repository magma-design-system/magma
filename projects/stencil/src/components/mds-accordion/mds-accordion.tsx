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

  @Listen('openedEvent')
  changeEventHandler (event: CustomEvent<string>): void {
    if (this.multiple) {
      return
    }
    const items = this.element.querySelectorAll<HTMLMdsAccordionItemElement>('mds-accordion-item')
    items.forEach(item => item.opened = item.description === event.detail)
  }

  render () {
    return (
      <Host>
        <slot></slot>
      </Host>
    )
  }
}
