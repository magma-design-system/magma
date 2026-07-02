import { Component, Host, h, Prop, State } from '@stencil/core';
import { subscribePreference } from '@common/preference';

/**
 * @slot - Put `mds-table-row` element/s.
 */

@Component({
  tag: 'mds-table-body',
  styleUrl: 'mds-table-body.css',
  shadow: true,
})
export class MdsTableBody {
  @State() prefAnimation?: string;
  private unsubscribePrefAnimation?: () => void;
  /**
   * Specifies whether the rows react to user interaction (hover/focus).
   */
  @Prop({ reflect: true }) readonly interactive?: boolean;
  /**
   * Enables the selection column for the rows in this table body.
   */
  @Prop({ reflect: true }) readonly selection?: boolean;

  connectedCallback(): void {
    this.unsubscribePrefAnimation = subscribePreference('animation', (value) => {
      this.prefAnimation = value;
    });
  }

  disconnectedCallback(): void {
    this.unsubscribePrefAnimation?.();
  }

  render() {
    return (
      <Host role="rowgroup" pref-animation={this.prefAnimation}>
        <slot />
      </Host>
    );
  }
}
