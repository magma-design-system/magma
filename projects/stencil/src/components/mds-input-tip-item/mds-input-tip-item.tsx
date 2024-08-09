import { Component, Host, h, Prop } from '@stencil/core'
import { InputTipItemVariantType } from '@component/mds-input-tip-item/meta/types'

@Component({
  tag: 'mds-input-tip-item',
  styleUrl: 'mds-input-tip-item.css',
  shadow: true,
})
export class MdsInputTipItem {

  /**
   * Specifies the variant of the element
   */
  @Prop({ reflect: true }) readonly variant?: InputTipItemVariantType = 'required'

  render () {
    return (
      <Host>
        <slot></slot>
      </Host>
    )
  }
}
