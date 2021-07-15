import { Component, Host, h } from '@stencil/core'

@Component({
  tag: 'mds-grid',
  styleUrl: 'mds-grid.css',
  shadow: true,
})
export class MdsGrid {

  render () {
    return (
      <Host>
        <slot></slot>
      </Host>
    )
  }
}
