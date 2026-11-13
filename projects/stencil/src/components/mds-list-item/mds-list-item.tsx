import { Component, Element, Host, h, Prop, forceUpdate } from '@stencil/core';
import {
  TypographyInfoType,
  TypographyReadType,
  TypographyReadingVariants,
} from '@type/typography';
import mggListDot from '@icon/mgg/list-dot.svg';

/**
 * @slot - In a list with the `dot` marker, add a `text string`, **avoid** `HTML elements` or `components` here. In a list with `marker="none"`, add any content: a link, a card, a chip.
 * @part icon - The bullet icon before the text, the one `icon` sets; none in a list with `marker="none"`
 * @part text - The text of the item, around the default slot; none in a list with `marker="none"`
 * @parent mds-list
 */

@Component({
  tag: 'mds-list-item',
  styleUrl: 'mds-list-item.css',
  shadow: true,
})
export class MdsListItem {
  private loaded = false;

  @Element() host: HTMLMdsListItemElement;

  /**
   * Specifies the typography of the element; none in a list with `marker="none"`, where the
   * content brings its own
   */
  @Prop({ reflect: true }) readonly typography: TypographyInfoType | TypographyReadType = 'detail';

  /**
   * Specifies the variant for `typography`
   */
  @Prop() readonly variant?: TypographyReadingVariants = 'info';

  /**
   * Specifies the icon displayed in the element, in place of the dot; none in a list with
   * `marker="none"`
   */
  @Prop() readonly icon?: string;

  // the marker is the list's, as list-style is the ul's: read from the closest list, which
  // renders its items again when it changes (#1408)
  private hasMarker = (): boolean => this.host.closest('mds-list')?.marker !== 'none';

  // an item moved into another list is connected again without loading again
  connectedCallback(): void {
    if (this.loaded) forceUpdate(this);
  }

  componentDidLoad(): void {
    this.loaded = true;
  }

  render() {
    if (!this.hasMarker()) {
      // the item of a list of links, cards or chips: the listitem around its content, and
      // nothing else, so the page lays out what it holds
      return (
        <Host list-marker="none" role="listitem">
          <slot />
        </Host>
      );
    }
    return (
      <Host role="listitem">
        <mds-icon aria-hidden="true" class="icon" name={this.icon ?? mggListDot} part="icon" />
        <mds-text tag="span" typography={this.typography} variant={this.variant} part="text">
          <slot />
        </mds-text>
      </Host>
    );
  }
}
