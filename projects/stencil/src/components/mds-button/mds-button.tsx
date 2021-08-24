import { Component, Host, h, Prop } from '@stencil/core'

import { ButtonType, ButtonSizeType } from '../../types/button'
import { IconPositionType } from '../../types/icon-position'
import { TypographyType } from '../../types/typography'
import { ButtonVariantType, ToneVariantType } from '../../types/variant'
import { buttonSizeTypographyVariant } from '../../variants/button'

@Component({
  tag: 'mds-button',
  styleUrl: 'mds-button.css',
  shadow: true,
})
export class MdsButton {

  private typography?: TypographyType

  /**
   * The icon displayed in the button
   */
  @Prop() readonly icon?: string

  /**
   * Specifies the horizontal position of the icon displayed in the button
   */
  @Prop() readonly iconPosition?: IconPositionType = 'left'

  /**
   * The type of the button element
   */
  @Prop() readonly type?: ButtonType = 'submit'

  /**
   * Specifies the color variant for the button
   */
  @Prop({ reflect: true }) readonly variant?: ButtonVariantType = 'primary'

  /**
   * Specifies the tone variant for the button
   */
  @Prop({ reflect: true }) readonly tone?: ToneVariantType = 'strong'

  /**
   * Specifies the size for the button
   */
  @Prop({ reflect: true }) readonly size?: ButtonSizeType = 'md'

  /**
   * Specifies if the button is active or not
   */
  @Prop({ mutable: true, reflect: true }) active: boolean

  private mouseDown = () => {
    this.active = true
  }

  private mouseUp = () => {
    this.active = false
  }

  render () {
    this.typography = buttonSizeTypographyVariant[this.size] as TypographyType

    return (
      <Host onMouseDown={this.mouseDown} onMouseUp={this.mouseUp} onMouseOut={this.mouseUp}>
        { this.icon && this.iconPosition === 'left' && <mds-icon name={this.icon} /> }
        <mds-text class="text" typography={this.typography}><slot></slot></mds-text>
        { this.icon && this.iconPosition === 'right' && <mds-icon name={this.icon} /> }
      </Host>
    )
  }
}
