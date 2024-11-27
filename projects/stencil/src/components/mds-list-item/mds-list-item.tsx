import { Component, Host, h, Prop } from '@stencil/core'
import { TypographyInfoType, TypographyReadType, TypographyReadingVariants } from '@type/typography'
import mggListDot from '@icon/mgg/list-dot.svg'

/**
 * @slot default - Add `text string` to this slot, **avoid** to add `HTML elements` or `components` here.
 */

@Component({
  tag: 'mds-list-item',
  styleUrl: 'mds-list-item.css',
  shadow: true,
})
export class MdsListItem {

  /**
   * Specifies the typography of the element
   */
  @Prop({ reflect: true }) readonly typography: TypographyInfoType | TypographyReadType = 'detail'

  /**
   * Specifies the variant for `typography`
   */
  @Prop() readonly variant?: TypographyReadingVariants = 'info'

  /**
   * Specifies the icon displayed in the element
   */
  @Prop() readonly icon?: string

  render () {
    return (
      <Host role="listitem">
        <mds-icon aria-hidden="true" class="icon" name={this.icon ?? mggListDot} part="icon"/>
        <mds-text tag="span" typography={this.typography} variant={this.variant} part="text">
          <slot/>
        </mds-text>
      </Host>
    )
  }
}
