import { Component, Host, h, Prop, State } from '@stencil/core';
import { subscribePreference } from '@common/preference';
import { TypographyTitleType } from '@type/typography';
import { TypographyHeadingTagType } from '@type/text';

/**
 * @slot - Add `text string`, `HTML elements` or `components` to this slot.
 * @slot author - Add `text string`, `HTML elements` or `components` to this slot.
 */

@Component({
  tag: 'mds-quote',
  styleUrl: 'mds-quote.css',
  shadow: true,
})
export class MdsQuote {
  @State() prefContrast?: string;
  private unsubscribePrefContrast?: () => void;

  connectedCallback(): void {
    this.unsubscribePrefContrast = subscribePreference('contrast', (value) => {
      this.prefContrast = value;
    });
  }

  disconnectedCallback(): void {
    this.unsubscribePrefContrast?.();
  }

  /**
   * Specifies the font typography of the element
   */
  @Prop() readonly typography: TypographyTitleType = 'h3';

  /**
   * Specifies the tag the element
   */
  @Prop() readonly tag: TypographyHeadingTagType = 'h3';

  render() {
    return (
      <Host pref-contrast={this.prefContrast}>
        <mds-text class="open-quote" tag="div" typography={this.typography}>
          <span>
            <i>❝&nbsp;</i>
          </span>
        </mds-text>
        <div class="quote">
          <mds-text tag={this.tag} typography={this.typography}>
            <i>
              <slot />
              <span>&nbsp;❞</span>
            </i>
          </mds-text>
          <slot name="author" />
        </div>
      </Host>
    );
  }
}
