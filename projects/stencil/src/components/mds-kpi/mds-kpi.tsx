import { Component, Element, Host, Listen, h } from '@stencil/core'

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
