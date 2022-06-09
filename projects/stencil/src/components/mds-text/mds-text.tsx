import { Component, Host, Prop, h } from '@stencil/core'
import { TypographyTagType } from './meta/types'
import { TypographyType, TypographyVariants } from '../../types/typography'
import { typographyDefaultsVariant } from './meta/variants'
import clsx from 'clsx'

@Component( {
  tag: 'mds-text',
  styleUrl: 'mds-text.css',
  shadow: true,
} )
export class MdsText {
  /**
   * Specifies the HTML tag of the element
   */
  @Prop() readonly tag?: TypographyTagType

  /**
   * Specifies the font typography of the element
   */
  @Prop() readonly typography: TypographyType = 'detail'

  /**
   * Specifies the variant for `typography`
   */
  @Prop() readonly variant?: TypographyVariants


  render () {
    const Tag = this.tag !== undefined ? this.tag : typographyDefaultsVariant[ this.typography ].tag
    const { selector } = typographyDefaultsVariant[ this.typography ]
    const selectorVariant = this.variant === undefined || !selector[ this.variant ] ? selector.default : selector[ this.variant ]
    return (
      <Host class={clsx( selectorVariant, Tag )}>
        <Tag class="text">
          <slot />
        </Tag>
      </Host>
    )
  }
}
