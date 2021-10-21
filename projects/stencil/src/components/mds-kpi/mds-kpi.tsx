import { Component, Host, h } from '@stencil/core'

@Component({
  tag: 'mds-kpi',
  styleUrl: 'mds-kpi.css',
  shadow: true,
})
export class MdsKpi {

  render () {
    return (
      <Host>
        <slot></slot>
      </Host>
    )
  }
}
