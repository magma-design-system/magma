import { Component, Host, h, Prop } from '@stencil/core'

import { ButtonType } from '../../types/button'
import { IconPositionType } from '../../types/icon-position'
import { TypographyType } from '../../types/typography'

@Component({
  tag: 'mds-button',
  styleUrl: 'mds-button.css',
  shadow: true,
})
export class MdsButton {

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
   * Specifies the font typography of the element
   */
  @Prop() readonly typography: TypographyType = 'action'

  render () {
    return (
      <Host>
        { this.icon && this.iconPosition === 'left' && <mds-icon name={this.icon} /> }
        <mds-text class="text" typography={this.typography}><slot></slot></mds-text>
        { this.icon && this.iconPosition === 'right' && <mds-icon name={this.icon} /> }
      </Host>
    )
  }
}
