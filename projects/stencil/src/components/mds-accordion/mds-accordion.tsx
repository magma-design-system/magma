import { Component, Host, h, Prop, Listen } from '@stencil/core'

// https://store.google.com/product/nest_hub_sleep_sensing?hl=it#sleep-sensing-faq
// https://store.google.com/it/product/pixel_buds_a_series_specs?hl=it

@Component({
  tag: 'mds-accordion',
  styleUrl: 'mds-accordion.css',
  shadow: true,
})
export class MdsAccordion {

  /**
   * Choose if multiple siblings can be opened simultaneously
   */
  @Prop() multiple?: boolean

  @Listen('openedEvent')
  changeEventHandler (event: CustomEvent<string>): void {
    if (this.multiple) {
      return
    }
    const items = document.querySelectorAll<HTMLMdsAccordionItemElement>('mds-accordion-item')
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
