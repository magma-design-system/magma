import { Component, Host, h, Prop } from '@stencil/core'
import { TypographyTitleType } from '@type/typography'
import { TypographyHeadingTagType } from '@type/text'

/**
 * @slot default - Add `text string`, `HTML elements` or `components` to this slot.
 * @slot author - Add `text string`, `HTML elements` or `components` to this slot.
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

  /**
   * Specifies the tag the element
   */
  @Prop() readonly tag: TypographyHeadingTagType = 'h3'

  render () {
    return (
      <Host>
        <mds-text class="open-quote" tag="div" typography={ this.typography }><span><i>❝&nbsp;</i></span></mds-text>
        <div class="quote">
          <mds-text tag={this.tag} typography={ this.typography }>
            <i><slot/><span>&nbsp;❞</span></i>
          </mds-text>
          <slot name="author"/>
        </div>
      </Host>
    )
  }

}
