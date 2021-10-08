import { Component, Host, h, Prop } from '@stencil/core'
import { TypographyPrimaryType } from '../../types/typography'
@Component({
  tag: 'mds-quote',
  styleUrl: 'mds-quote.css',
  shadow: true,
})
export class MdsQuote {

  /**
   * Specifies the font typography of the element
   */
  @Prop() readonly typography: TypographyPrimaryType = 'h3'

  render () {
    return (
      <Host>
        <mds-text typography={ this.typography }><i>❝&nbsp;</i></mds-text>
        <div class="quote">
          <mds-text typography={ this.typography }>
            <i><slot/>&nbsp;❞</i>
          </mds-text>
          <slot name="author"/>
        </div>
      </Host>
    )
  }

}
