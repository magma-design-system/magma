import { Component, Host, h } from '@stencil/core'

/**
 * @slot default - Add `mds-kpi-item` element/s.
 */

@Component({
  tag: 'mds-kpi',
  styleUrl: 'mds-kpi.css',
  shadow: true,
})
export class MdsKpi {

  render () {
    return (
      <Host role="list">
        <slot></slot>
      </Host>
    )
  }
}
