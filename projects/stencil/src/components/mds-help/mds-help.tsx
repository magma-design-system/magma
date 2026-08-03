import { Component, Host, Prop, h } from '@stencil/core';
import miOutlineHelp from '@icon/mi/outline/help-outline.svg';
import { FloatingUIPlacement } from '@type/floating-ui';

/**
 * @slot - Add `text string` to this slot, **avoid** `HTML elements` or `components`.
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
   * If set, the component will not be placed automatically near it's caller.
   */
  @Prop({ reflect: true }) readonly disableAutoPlacement?: boolean = false;

  /**
   * Specifies where the component should be placed relative to the caller.
   */
  @Prop({ reflect: true }) readonly placement?: FloatingUIPlacement = 'top';

  render() {
    return (
      <Host>
        <mds-icon class="icon" name={this.icon ?? miOutlineHelp} part="icon"></mds-icon>
        <mds-tooltip
          placement={this.placement}
          disableAutoPlacement={this.disableAutoPlacement}
          strategy="absolute"
          target=".icon"
        >
          <slot />
        </mds-tooltip>
      </Host>
    );
  }
}
