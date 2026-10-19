import { Component, Host, h, Prop } from '@stencil/core';
import { preferenceStore } from '@common/preference';
import { InputTipPositionType } from './meta/types';

/**
 * @slot - Add `mds-input-tip-item` elements or `components` to this slot.
 */
@Component({
  tag: 'mds-input-tip',
  styleUrl: 'mds-input-tip.css',
  shadow: true,
})
export class MdsInputTip {
  /**
   * Moves the tip onto the edge of the input, as the parent input does while it has the focus.
   * It does not expand the items: each `mds-input-tip-item` opens on its own `expanded`
   */
  @Prop({ reflect: true }) readonly active?: boolean = false;

  /**
   * Specifies the position of the element relative to its container
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
