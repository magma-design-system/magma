import { Component, Host, h, Prop } from '@stencil/core'
import { TypographyInfoType, TypographyReadType, TypographyVariants } from '@type/typography'
import { ThemeFullVariantType, ToneVariantType } from '@type/variant'

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
  @Prop( { reflect: true } ) variant?: ThemeFullVariantType = 'green'

  /**
   * Sets the tone of the color variant
   */
  @Prop( { reflect: true } ) tone?: ToneVariantType = 'weak'

  /**
   * Specifies the typography of the element
   */
  @Prop() readonly typography: TypographyInfoType | TypographyReadType = 'option'

  /**
   * Specifies the variant for `typography`
   */
  @Prop() readonly typographyVariant?: TypographyVariants

  render () {
    return (
      <Host>
        <mds-text tag="span" typography={this.typography} variant={this.typographyVariant}>
          <slot/>
        </mds-text>
      </Host>
    )
  }

}
