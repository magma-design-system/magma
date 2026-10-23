import { Component, Host, h } from '@stencil/core';

/**
 * @slot - Add `mds-kpi-item` element/s.
 * @category data
 */

@Component({
  tag: 'mds-kpi',
  styleUrl: 'mds-kpi.css',
  shadow: true,
})
export class MdsKpi {
  render() {
    return (
      <Host role="list">
        <slot></slot>
      </Host>
    );
  }
}
