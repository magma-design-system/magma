import { Component, Host, h, Prop } from '@stencil/core'
import { TypographySecondaryType } from '../../types/typography'

@Component({
  tag: 'mds-list-item',
  styleUrl: 'mds-list-item.css',
  shadow: true,
})
export class MdsListItem {

  /**
   * Specifies the typography of the element
   */
  @Prop() readonly typography: TypographySecondaryType = 'detail'

  /**
   * Specifies the typography of the element
   */
  @Prop() readonly icon: string = 'list-dot'

  render () {
    return (
      <Host>
        <mds-icon name={this.icon} part="icon"/>
        <mds-text typography={this.typography} part="text"><slot></slot></mds-text>
      </Host>
    )
  }
}
