import { Component, Host, h } from '@stencil/core'

@Component({
  tag: 'mds-status-bar',
  styleUrl: 'mds-status-bar.css',
  shadow: true,
})
export class MdsStatusBar {
  render () {
    return (
      <Host>
        <slot></slot>
      </Host>
    )
  }
}
