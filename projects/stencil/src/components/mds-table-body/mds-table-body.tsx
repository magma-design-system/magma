import { Component, Host, h, Prop, State } from '@stencil/core';
import { subscribePreference } from '@common/preference';

/**
 * @slot default - Put `mds-table-row` element/s.
 */

@Component({
  tag: 'mds-table-body',
  styleUrl: 'mds-table-body.css',
  shadow: true,
})
export class MdsTableBody {
  @State() prefAnimation?: string;
  private unsubscribePrefAnimation?: () => void;
  @Prop({ reflect: true }) readonly interactive?: boolean;
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
