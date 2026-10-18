import { Component, Host, Prop, h } from '@stencil/core';
import miOutlineHelp from '@icon/mi/outline/help-outline.svg';
import { FloatingUIPlacement } from '@type/floating-ui';

/**
 * @slot - Add `text string` to this slot, **avoid** `HTML elements` or `components`.
 * @part icon - The icon that shows the help text in a tooltip
 */

@Component({
  tag: 'mds-help',
  styleUrl: 'mds-help.css',
  shadow: true,
})
export class MdsHelp {
  /**
   * Set the name of the icon.
   */
  @Prop() readonly icon?: string;

  /**
   * Pins the tooltip to `placement`: without it, the tooltip moves to another side of the icon
   * when `placement` has no room.
   */
  @Prop({ reflect: true }) readonly disableAutoPlacement?: boolean = false;

  /**
   * Specifies where the tooltip should be placed relative to the icon: the side it takes
   * whenever it has room there.
   */
  @Prop({ reflect: true }) readonly placement?: FloatingUIPlacement = 'top';

  render() {
    return (
      <Host>
        {/* the icon is a tab stop, so the keyboard opens the tooltip as the pointer does, and the
         * tooltip names it: the help text is what a screen reader reads on the icon */}
        <mds-icon
          class="icon"
          name={this.icon ?? miOutlineHelp}
          part="icon"
          role="img"
          tabindex="0"
        ></mds-icon>
        <mds-tooltip
          placement={this.placement}
          disableAutoPlacement={this.disableAutoPlacement}
          relation="label"
          strategy="absolute"
          target=".icon"
        >
          <slot />
        </mds-tooltip>
      </Host>
    );
  }
}
