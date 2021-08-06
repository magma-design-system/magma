import { Component, Host, h, Prop } from '@stencil/core'

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
  @Prop() siblings?: boolean

  render () {
    return (
      <Host>
        <slot></slot>
      </Host>
    )
  }
}
