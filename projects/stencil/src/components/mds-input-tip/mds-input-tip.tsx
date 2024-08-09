import { Component, Host, h, Prop } from '@stencil/core'
import { InputTipPositionType } from './meta/types'

@Component({
  tag: 'mds-input-tip',
  styleUrl: 'mds-input-tip.css',
  shadow: true,
})
export class MdsInputTip {

  /**
   * Specifies the position of the element relative to its container
   */
  @Prop({ reflect: true }) readonly position?: InputTipPositionType = 'top'

  render () {
    return (
      <Host>
        <slot></slot>
      </Host>
    )
  }
}
