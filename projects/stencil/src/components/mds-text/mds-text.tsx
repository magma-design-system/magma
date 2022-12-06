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
  @Prop({ mutable: true, reflect: true }) tag?: TypographyTagType

  /**
   * Specifies if the text shoud be truncated or should behave as a normal text
   */
  @Prop({ reflect: true }) readonly truncate?: boolean

  /**
   * Specifies the font typography of the element
   */
  @Prop({ reflect: true }) readonly typography?: TypographyType = 'detail'

  /**
   * Specifies the variant for `typography`
   */
  @Prop({ reflect: true }) readonly variant?: TypographyVariants

  render () {
    const { tag } = typographyDefaultsVariant[ this.typography ]
    this.tag = this.tag ?? tag as TypographyTagType
    return (
      <Host>
        <this.tag class={clsx(this.truncate ? 'truncate' : 'text')}>
          <slot />
        </this.tag>
      </Host>
    )
  }
}
