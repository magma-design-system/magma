import { Component, Host, Prop, h } from '@stencil/core'
import { ButtonSizeType, ButtonVariantType } from '@type/button'
import { ToneVariantType } from '@type/variant'

@Component({
  tag: 'mds-radial-menu-item',
  styleUrl: 'mds-radial-menu-item.css',
  shadow: true,
})
export class MdsRadialMenuItem {

  /**
   * The tooltip displayed when hovering over the button
   */
  @Prop({ reflect: true }) readonly tooltip?: string

  /**
   * The icon displayed in the button
   */
  @Prop({ reflect: true, mutable: true }) icon?: string

  /**
   * Specifies the tone variant for the button
   */
  @Prop({ reflect: true }) readonly tone?: ToneVariantType = 'weak'

  /**
   * Specifies the color variant for the button
   */
  @Prop({ reflect: true }) readonly variant?: ButtonVariantType = 'dark'

  @Prop({ reflect: true }) readonly size: ButtonSizeType = 'lg'

  render () {
    return (
      <Host slot="item">
        <mds-button
          aria-label={this.tooltip}
          class='button'
          icon={this.icon}
          variant={this.variant}
          tone={this.tone}
          size={this.size}
        ></mds-button>
        { this.tooltip && <mds-tooltip class="tooltip" target=".button" placement="top" autoPlacement={false}>{ this.tooltip }</mds-tooltip> }
      </Host>
    )
  }
}
