import { Component, Host, h } from '@stencil/core'

@Component({
  tag: 'mds-actions',
  styleUrl: 'mds-actions.css',
  shadow: true,
})
export class MdsActions {
  render () {
    return (
      <Host>
        <slot></slot>
      </Host>
    )
  }
}
