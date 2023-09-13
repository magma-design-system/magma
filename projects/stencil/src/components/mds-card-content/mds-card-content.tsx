import { Component, Host, h } from '@stencil/core'

@Component({
  tag: 'mds-card-content',
  styleUrl: 'mds-card-content.css',
  shadow: true,
})
export class MdsCardContent {

  render () {
    return (
      <Host slot="content">
        <slot></slot>
      </Host>
    )
  }

}
