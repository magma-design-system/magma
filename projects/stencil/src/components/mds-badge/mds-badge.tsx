import { Component, Host, h, Prop } from '@stencil/core'
import { TypographySecondaryType } from '../../types/typography'

@Component({
  tag: 'mds-badge',
  styleUrl: 'mds-badge.css',
  shadow: true,
})
export class MdsBadge {

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
