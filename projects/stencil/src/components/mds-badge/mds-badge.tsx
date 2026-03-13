import { Component, Host, h, Prop } from '@stencil/core'
import { TypographyLabelType } from '@type/typography'
import { ThemeFullVariantType, ToneSmartVariantType } from '@type/variant'

/**
 * @slot default - Add `text string` to this slot, **avoid** to add `HTML elements` or `components` here.
 */

@Component( {
  tag: 'mds-badge',
  styleUrl: 'mds-badge.css',
  shadow: true,
} )
export class MdsBadge {

  /**
   * Sets the theme variant colors
   */
  @Prop({ reflect: true }) variant?: ThemeFullVariantType = 'green'

  /**
   * Sets the tone of the color variant
   */
  @Prop({ reflect: true }) tone?: ToneSmartVariantType = 'weak'

  /**
   * Specifies the typography of the element
   */
  @Prop({ reflect: true }) readonly typography: TypographyLabelType = 'option'

  render () {
    return (
      <Host>
        <mds-text tag="span" typography={this.typography} variant="info">
          <slot/>
        </mds-text>
      </Host>
    )
  }

}
