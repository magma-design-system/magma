import { Component, Host, h, Prop } from '@stencil/core'
import { TypographySecondaryType } from '../../types/typography'

@Component({
  tag: 'mds-pill',
  styleUrl: 'mds-pill.css',
  shadow: true,
})
export class MdsPill {

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
