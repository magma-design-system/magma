import { Component, Host, h, Prop, State } from '@stencil/core';
import { subscribePreference } from '@common/preference';
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
  @State() prefAnimation?: string;
  private unsubscribePrefAnimation?: () => void;

  connectedCallback(): void {
    this.unsubscribePrefAnimation = subscribePreference('animation', (value) => {
      this.prefAnimation = value;
    });
  }

  disconnectedCallback(): void {
    this.unsubscribePrefAnimation?.();
  }

  /**
   * Specifies if the component is active and shows expanded children or not
   */
  @Prop({ reflect: true }) readonly active?: boolean = false;

  /**
   * Specifies the position of the element relative to its container
   */
  @Prop({ reflect: true }) readonly position?: InputTipPositionType = 'top';

  render() {
    return (
      <Host pref-animation={this.prefAnimation}>
        <slot></slot>
      </Host>
    );
  }
}
