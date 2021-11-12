import { Component, Host, h, Prop } from '@stencil/core'
import { TypographySecondaryType } from '../../types/typography'
import { ThemeFullVariantType, ToneSimpleVariantType } from '../../types/variant'

@Component({
  tag: 'mds-badge',
  styleUrl: 'mds-badge.css',
  shadow: true,
})
export class MdsBadge {

  /**
   * Sets the theme variant colors
   */
  @Prop({ reflect: true }) variant?: ThemeFullVariantType = 'green'

  /**
   * Sets the tone of the color variant
   */
  @Prop({ reflect: true }) tone?: ToneSimpleVariantType = 'weak'

  /**
   * Specifies the typography of the element
   */
  @Prop() readonly typography: TypographySecondaryType = 'option'

  render () {
    return (
      <Host>
        <mds-text typography={this.typography}><slot></slot></mds-text>
      </Host>
    )
  }

}
