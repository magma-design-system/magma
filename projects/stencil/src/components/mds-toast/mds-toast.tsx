import { Component, Host, h, Prop } from '@stencil/core'
import { ToneVariantType, ThemeVariantType } from '../../types/variant'
import clsx from 'clsx'

@Component({
  tag: 'mds-toast',
  styleUrl: 'mds-toast.css',
  shadow: true,
})
export class MdsToast {

  /**
   * Specifies if toast is visible at the bottom or not
   */
  @Prop() readonly visible?: boolean

  /**
   * Sets the theme variant colors
   */
  @Prop({ reflect: true }) readonly variant?: ThemeVariantType = 'light'

  /**
   * Sets the tone of the color variant
   */
  @Prop({ reflect: true }) readonly tone?: ToneVariantType = 'strong'

  render () {
    return (
      <Host>
        <div class={clsx('dialog', this.visible && 'dialog--visible')}>
          <mds-icon name="warning"/>
          <mds-text typography="caption">
            <slot name="text"/>
          </mds-text>
          <div class="actions">
            <slot name="action"/>
          </div>
        </div>
      </Host>
    )
  }

}
