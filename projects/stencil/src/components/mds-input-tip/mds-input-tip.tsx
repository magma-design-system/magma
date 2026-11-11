import { Component, Host, h, Prop } from '@stencil/core';
import { preferenceStore } from '@common/preference';
import { InputTipPositionType } from './meta/types';

/**
 * @slot - Add `mds-input-tip-item` elements or `components` to this slot.
 * @parent mds-input mds-input-date mds-input-select
 */
@Component({
  tag: 'mds-input-tip',
  styleUrl: 'mds-input-tip.css',
  shadow: true,
})
export class MdsInputTip {
  /**
   * Moves the bottom tip onto the edge of the input, as the parent input does while it has the
   * focus; the top tip stays on the border of the field. It does not expand the items: each
   * `mds-input-tip-item` opens on its own `expanded`
   */
  @Prop({ reflect: true }) readonly active?: boolean = false;

  /**
   * Specifies the position of the element relative to its container: `top` stands on the top
   * border of the field, half outside, clear of its corner by the radius the field passes down plus
   * a margin; `bottom` sits inside the bottom edge
   */
  @Prop({ reflect: true }) readonly position?: InputTipPositionType = 'top';

  render() {
    return (
      <Host pref-animation={preferenceStore.state.animation}>
        <slot></slot>
      </Host>
    );
  }
}
