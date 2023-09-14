import { Component, Host, h, Prop } from '@stencil/core'
import { TypographyTitleType } from '@type/typography'

/**
 * @slot author - TODOSLOT
 */
@Component({
  tag: 'mds-quote',
  styleUrl: 'mds-quote.css',
  shadow: true,
})
export class MdsQuote {

  /**
   * Specifies the font typography of the element
   */
  @Prop() readonly typography: TypographyTitleType = 'h3'

  render () {
    return (
      <Host>
        <mds-text typography={ this.typography }><span><i>❝&nbsp;</i></span></mds-text>
        <div class="quote">
          <mds-text typography={ this.typography }>
            <i><slot/><span>&nbsp;❞</span></i>
          </mds-text>
          <slot name="author"/>
        </div>
      </Host>
    )
  }

}
