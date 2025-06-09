import { Component, Host, h } from '@stencil/core'

@Component({
  tag: 'mds-button-group',
  styleUrl: 'mds-button-group.css',
  shadow: true,
})
export class MdsButtonGroup {
  render () {
    return (
      <Host>
        <slot></slot>
      </Host>
    )
  }
}
