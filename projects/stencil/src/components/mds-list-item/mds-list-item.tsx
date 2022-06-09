import { Component, Host, h, Prop } from '@stencil/core'
import { TypographyInfoType, TypographyReadType, TypographyVariants } from '../../types/typography'

@Component({
  tag: 'mds-list-item',
  styleUrl: 'mds-list-item.css',
  shadow: true,
})
export class MdsListItem {

  /**
   * Specifies the typography of the element
   */
  @Prop() readonly typography: TypographyInfoType | TypographyReadType = 'detail'

  /**
   * Specifies the variant for `typography`
   */
  @Prop() readonly variant?: TypographyVariants

  /**
   * Specifies the typography of the element
   */
  @Prop() readonly icon: string = 'list-dot'

  render () {
    return (
      <Host>
        <mds-icon name={this.icon} part="icon"/>
        <mds-text typography={this.typography} variant={this.variant} part="text"><slot></slot></mds-text>
      </Host>
    )
  }
}
