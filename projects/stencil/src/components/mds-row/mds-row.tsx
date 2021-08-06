import { Component, Host, h } from '@stencil/core'

@Component({
  tag: 'mds-row',
  styleUrl: 'mds-row.css',
  shadow: true,
})
export class MdsRow {

  render () {
    return (
      <Host>
        <slot></slot>
      </Host>
    )
  }
}
