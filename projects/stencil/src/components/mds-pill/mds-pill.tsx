import { Component, Host, h, Prop } from '@stencil/core'
import { TypographyTypes } from '../../types/typography'

@Component({
  tag: 'mds-pill',
  styleUrl: 'mds-pill.css',
  shadow: true,
})
export class MdsPill {

  /**
   * Specifies the typography of the element
   */
  @Prop() readonly typography: TypographyTypes = 'option'

  render() {
    return (
      <Host>
        <mds-text typography={this.typography}><slot></slot></mds-text>
      </Host>
    )
  }

}
