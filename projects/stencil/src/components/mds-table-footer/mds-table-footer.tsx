import { Component, Host, h, State } from '@stencil/core';
import { subscribePreference } from '@common/preference';

/**
 * @slot default - Add `mds-table-row` element/s.
 */

@Component({
  tag: 'mds-table-footer',
  styleUrl: 'mds-table-footer.css',
  shadow: true,
})
export class MdsTableFooter {
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

  render() {
    return (
      <Host role="row" pref-animation={this.prefAnimation}>
        <slot />
      </Host>
    );
  }
}
