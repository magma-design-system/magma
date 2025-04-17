import { Component, Host, Prop, h } from '@stencil/core'
import { ButtonSizeType, ButtonVariantType } from '@type/button'

@Component({
  tag: 'mds-radial-menu-item',
  styleUrl: 'mds-radial-menu-item.css',
  shadow: true,
})
export class MdsRadialMenuItem {

  @Prop({ reflect: true }) readonly icon: string = ''

  /**
   * Specifies the color variant for the button
   */
  @Prop({ reflect: true }) readonly variant?: ButtonVariantType = 'dark'

  /**
   * Specifies the size for the button
   */
  @Prop({ reflect: true }) readonly size: ButtonSizeType = 'lg'

  render () {
    return (
      <Host slot="item">
        <mds-button
          class='button'
          icon={this.icon}
          variant={this.variant}
          tone='weak'
          size={this.size}
        ></mds-button>
      </Host>
    )
  }
}
